"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSessionProfile } from "@/lib/admin/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeReferralBonusForStorage } from "@/lib/referral-bonus";
import { makeRoleSlug } from "@/lib/slug";
import {
  getPrimaryCompanyIdForProfile,
  profileHasCompanyMembership,
} from "@/lib/admin/profile-companies";
import { getProfileIdFromSession } from "@/lib/session/profile";

export type CreateRoleState = { error?: string };
export type UpdateRoleState = { error?: string; ok?: boolean };

function clip(s: string, max: number) {
  return s.trim().slice(0, max);
}

export async function createRole(_prev: CreateRoleState, formData: FormData) {
  const hirerId = await getProfileIdFromSession();
  if (!hirerId) redirect("/hire/sign-up");

  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const location = clip(String(formData.get("location") ?? ""), 300) || null;
  const match_bonus = normalizeReferralBonusForStorage(String(formData.get("match_bonus") ?? ""), 500);
  const companyIdRaw = String(formData.get("company_id") ?? "").trim();

  if (title.length < 2) return { error: "Add a role title (at least 2 characters)." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Server is not configured (missing Supabase service role key)." };
  }

  const { error: pErr } = await admin.from("profiles").select("id").eq("id", hirerId).single();

  if (pErr) return { error: pErr.message ?? "Could not load your profile." };

  const primaryCompanyId = await getPrimaryCompanyIdForProfile(admin, hirerId);
  const effectiveCompanyId = companyIdRaw.length > 0 ? companyIdRaw : primaryCompanyId;
  if (
    effectiveCompanyId &&
    !(await profileHasCompanyMembership(admin, hirerId, effectiveCompanyId))
  ) {
    return { error: "Choose an organization you’re linked to, or leave the default." };
  }

  let slug = makeRoleSlug(title);
  let roleId: string | null = null;

  for (let attempt = 0; attempt < 8; attempt++) {
    const { data, error } = await admin
      .from("roles")
      .insert({
        hirer_id: hirerId,
        title,
        description,
        slug,
        status: "getting_started",
        location,
        match_bonus,
        company_id: effectiveCompanyId,
      })
      .select("id")
      .single();

    if (!error && data?.id) {
      roleId = data.id;
      break;
    }
    if (error?.code === "23505") {
      slug = makeRoleSlug(title);
      continue;
    }
    return { error: error?.message ?? "Could not create role." };
  }

  if (!roleId) return { error: "Could not generate a unique link. Try again." };

  redirect(`/hire/roles/${roleId}`);
}

export async function updateRole(_prev: UpdateRoleState, formData: FormData): Promise<UpdateRoleState> {
  const profileId = await getProfileIdFromSession();
  if (!profileId) redirect("/hire/sign-up");

  const roleId = String(formData.get("role_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const location = clip(String(formData.get("location") ?? ""), 300) || null;
  const match_bonus = normalizeReferralBonusForStorage(String(formData.get("match_bonus") ?? ""), 500);
  const companyIdRaw = String(formData.get("company_id") ?? "").trim();
  const hirerIdRaw = String(formData.get("hirer_id") ?? "").trim();

  if (!roleId) return { error: "Missing role." };
  if (title.length < 2) return { error: "Add a role title (at least 2 characters)." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Server is not configured (missing Supabase service role key)." };
  }

  const adminSess = await getAdminSessionProfile();
  const { data: row, error: rErr } = await admin
    .from("roles")
    .select("hirer_id, slug, company_id")
    .eq("id", roleId)
    .maybeSingle();

  if (rErr || !row) return { error: "Role not found." };
  const isAdmin = !!adminSess;
  const isOwner = row.hirer_id === profileId;
  if (!isAdmin && !isOwner) return { error: "Not authorized." };
  if (!row.hirer_id && !isAdmin) return { error: "Only an admin can edit this draft role." };

  let targetHirerId = (row.hirer_id as string | null) ?? null;
  if (isAdmin && formData.has("hirer_id")) {
    if (hirerIdRaw.length > 0) {
      const { data: hp, error: hpErr } = await admin
        .from("profiles")
        .select("id, account_role")
        .eq("id", hirerIdRaw)
        .maybeSingle();
      if (hpErr || !hp) return { error: "Hiring manager not found." };
      if (hp.account_role !== "hirer" && hp.account_role !== "admin") {
        return { error: "Only hirer or admin accounts can own a role." };
      }
      targetHirerId = hirerIdRaw;
    } else {
      targetHirerId = null;
    }
  }

  const targetCompanyId: string | null = companyIdRaw.length > 0 ? companyIdRaw : null;

  if (!isAdmin) {
    if (targetCompanyId) {
      const prevCo = row.company_id as string | null;
      const unchanged = targetCompanyId === prevCo;
      const member = await profileHasCompanyMembership(admin, profileId, targetCompanyId);
      if (!unchanged && !member) {
        return { error: "You’re not linked to that organization." };
      }
    }
  } else if (targetHirerId && targetCompanyId) {
    if (!(await profileHasCompanyMembership(admin, targetHirerId, targetCompanyId))) {
      return {
        error: "That hiring manager isn’t linked to the selected company. Pick another org or manager.",
      };
    }
  }

  const patch: Record<string, unknown> = {
    title,
    description,
    location,
    match_bonus,
    company_id: targetCompanyId,
  };
  if (isAdmin) {
    patch.hirer_id = targetHirerId;
    if (targetHirerId === null) {
      patch.status = "draft";
    }
  }

  const { error: uErr } = await admin.from("roles").update(patch).eq("id", roleId);

  if (uErr) return { error: uErr.message };

  revalidatePath(`/hire/roles/${roleId}`);
  revalidatePath(`/r/${row.slug}`);
  revalidatePath("/hire/dashboard");
  return { ok: true };
}

