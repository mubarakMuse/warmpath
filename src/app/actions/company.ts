"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { makeCompanySlug, makeRoleSlug } from "@/lib/slug";
import {
  clearCompanySessionCookie,
  getCompanyIdFromServerSession,
  setCompanySessionCookie,
  signCompanySessionToken,
} from "@/lib/session/company-session";
import {
  isValidReasonPreset,
  isValidReferralStage,
} from "@/lib/referral-response";

export type CompanyFormState = { error?: string; ok?: boolean; message?: string };

function clip(s: string, max: number) {
  return s.trim().slice(0, max);
}

export async function companyCodeLogin(_prev: CompanyFormState, formData: FormData): Promise<CompanyFormState> {
  const code = String(formData.get("access_code") ?? "")
    .trim()
    .toUpperCase();
  if (code.length < 4) return { error: "Enter your company access code." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Supabase is not configured." };
  }

  const { data, error } = await admin.from("companies").select("id").eq("access_code", code).maybeSingle();
  if (error) return { error: error.message };
  if (!data?.id) return { error: "That code doesn’t match any company." };

  let token: string;
  try {
    token = await signCompanySessionToken(data.id as string);
  } catch {
    return { error: "Set WARMPATH_SESSION_SECRET (16+ chars) in .env.local." };
  }

  await setCompanySessionCookie(token);
  redirect("/company/dashboard");
}

export async function companyLogout() {
  await clearCompanySessionCookie();
  redirect("/company/login");
}

export async function companyUpdateDetails(
  _prev: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  const companyId = await getCompanyIdFromServerSession();
  if (!companyId) return { error: "Not signed in." };

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Company name is required." };

  const slug = String(formData.get("slug") ?? "").trim();
  if (!slug) return { error: "Slug is required." };

  const base = {
    name,
    logo_url: clip(String(formData.get("logo_url") ?? ""), 500) || null,
    linkedin_url: clip(String(formData.get("linkedin_url") ?? ""), 500) || null,
    website: clip(String(formData.get("website") ?? ""), 500) || null,
    description: clip(String(formData.get("description") ?? ""), 2000) || null,
  };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Supabase is not configured." };
  }

  let currentSlug = slug;
  for (let i = 0; i < 8; i++) {
    const { error } = await admin
      .from("companies")
      .update({ ...base, slug: currentSlug })
      .eq("id", companyId);
    if (!error) {
      revalidatePath("/company/dashboard");
      revalidatePath("/admin");
      return { ok: true, message: "Company saved." };
    }
    if (error.code === "23505") {
      currentSlug = `${makeCompanySlug(name)}-${i + 2}`;
      continue;
    }
    return { error: error.message };
  }
  return { error: "Slug conflict — try another slug." };
}

export async function companyCreateRole(_prev: CompanyFormState, formData: FormData): Promise<CompanyFormState> {
  const companyId = await getCompanyIdFromServerSession();
  if (!companyId) return { error: "Not signed in." };

  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 2) return { error: "Title is required." };

  const description = clip(String(formData.get("description") ?? ""), 8000) || null;
  const location = clip(String(formData.get("location") ?? ""), 300) || null;
  const referral_bonus = clip(String(formData.get("referral_bonus") ?? ""), 2000) || null;
  const statusRaw = String(formData.get("status") ?? "draft").trim();
  const status =
    statusRaw === "active" || statusRaw === "closed" || statusRaw === "draft" ? statusRaw : "draft";

  let slug = makeRoleSlug(title);
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Supabase is not configured." };
  }

  for (let i = 0; i < 8; i++) {
    const { error } = await admin.from("roles").insert({
      company_id: companyId,
      title,
      slug,
      description,
      location,
      status,
      referral_bonus,
    });
    if (!error) {
      revalidatePath("/company/dashboard");
      revalidatePath("/admin");
      revalidatePath("/connect/roles");
      revalidatePath(`/r/${slug}`);
      return { ok: true, message: `Role created (${slug}).` };
    }
    if (error.code === "23505") {
      slug = `${makeRoleSlug(title)}-${i + 2}`;
      continue;
    }
    return { error: error.message };
  }
  return { error: "Could not create role." };
}

export async function companyUpdateRole(_prev: CompanyFormState, formData: FormData): Promise<CompanyFormState> {
  const companyId = await getCompanyIdFromServerSession();
  if (!companyId) return { error: "Not signed in." };

  const roleId = String(formData.get("role_id") ?? "").trim();
  if (!roleId) return { error: "Missing role." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Supabase is not configured." };
  }

  const { data: row, error: rErr } = await admin
    .from("roles")
    .select("id, company_id")
    .eq("id", roleId)
    .maybeSingle();
  if (rErr || !row || row.company_id !== companyId) {
    return { error: "Role not found." };
  }

  const title = String(formData.get("title") ?? "").trim();
  if (title.length < 2) return { error: "Title is required." };

  const description = clip(String(formData.get("description") ?? ""), 8000) || null;
  const location = clip(String(formData.get("location") ?? ""), 300) || null;
  const referral_bonus = clip(String(formData.get("referral_bonus") ?? ""), 2000) || null;
  const statusRaw = String(formData.get("status") ?? "draft").trim();
  const status =
    statusRaw === "active" || statusRaw === "closed" || statusRaw === "draft" ? statusRaw : "draft";

  const { data: prevRow } = await admin.from("roles").select("slug").eq("id", roleId).maybeSingle();
  const prevSlug = (prevRow?.slug as string | undefined) ?? "";

  const { error: uErr } = await admin
    .from("roles")
    .update({ title, description, location, status, referral_bonus })
    .eq("id", roleId)
    .eq("company_id", companyId);

  if (uErr) return { error: uErr.message };

  revalidatePath("/company/dashboard");
  revalidatePath("/admin");
  revalidatePath("/connect/roles");
  if (prevSlug) revalidatePath(`/r/${prevSlug}`);
  return { ok: true, message: "Role updated." };
}

export async function companyUpdateReferralResponse(
  _prev: CompanyFormState,
  formData: FormData,
): Promise<CompanyFormState> {
  const companyId = await getCompanyIdFromServerSession();
  if (!companyId) return { error: "Not signed in." };

  const referralId = String(formData.get("referral_id") ?? "").trim();
  if (!referralId) return { error: "Missing referral." };

  const stageRaw = String(formData.get("referral_stage") ?? "new").trim();
  if (!isValidReferralStage(stageRaw)) return { error: "Invalid stage." };

  const presetRaw = String(formData.get("company_reason_preset") ?? "").trim();
  if (!isValidReasonPreset(presetRaw)) return { error: "Invalid reason option." };
  const preset = presetRaw === "" ? null : presetRaw;

  const note = clip(String(formData.get("company_reason_note") ?? ""), 2000) || null;

  if (stageRaw === "rejected") {
    const hasPreset = Boolean(preset);
    const hasNote = (note?.trim().length ?? 0) >= 3;
    if (!hasPreset && !hasNote) {
      return {
        error:
          "For rejections, choose a reason from the list or add a short note (at least 3 characters).",
      };
    }
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Supabase is not configured." };
  }

  const { data: ref, error: refErr } = await admin
    .from("connector_referrals")
    .select("id, role_id")
    .eq("id", referralId)
    .maybeSingle();
  if (refErr || !ref) return { error: "Referral not found." };

  const { data: roleRow, error: roleErr } = await admin
    .from("roles")
    .select("company_id")
    .eq("id", ref.role_id as string)
    .maybeSingle();
  if (roleErr || !roleRow || roleRow.company_id !== companyId) {
    return { error: "Referral not found." };
  }

  const { error: uErr } = await admin
    .from("connector_referrals")
    .update({
      referral_stage: stageRaw,
      company_reason_preset: preset,
      company_reason_note: note,
      company_responded_at: new Date().toISOString(),
    })
    .eq("id", referralId);

  if (uErr) return { error: uErr.message };

  revalidatePath("/company/dashboard");
  revalidatePath("/connect/dashboard");
  revalidatePath("/admin");
  return { ok: true, message: "Submission updated." };
}
