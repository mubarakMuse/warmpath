"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSessionProfile } from "@/lib/admin/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeReferralBonusForStorage } from "@/lib/referral-bonus";
import { makeRoleSlug } from "@/lib/slug";
import {
  fetchCompanySnapshot,
  getPrimaryCompanyIdForProfile,
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

  if (title.length < 2) return { error: "Add a role title (at least 2 characters)." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Server is not configured (missing Supabase service role key)." };
  }

  const { data: profile, error: pErr } = await admin
    .from("profiles")
    .select(
      "full_name, linkedin_url, avatar_url, company_name, company_website, company_linkedin_url, company_logo_url",
    )
    .eq("id", hirerId)
    .single();

  if (pErr || !profile) return { error: pErr?.message ?? "Could not load your profile." };

  const primaryCompanyId = await getPrimaryCompanyIdForProfile(admin, hirerId);
  const companySnap = primaryCompanyId ? await fetchCompanySnapshot(admin, primaryCompanyId) : null;

  let slug = makeRoleSlug(title);
  let roleId: string | null = null;

  const display = {
    hirer_full_name: profile.full_name,
    hirer_linkedin_url: profile.linkedin_url,
    hirer_avatar_url: profile.avatar_url,
    company_name: companySnap?.name ?? profile.company_name,
    company_website: companySnap?.website ?? profile.company_website,
    company_linkedin_url: companySnap?.linkedin_url ?? profile.company_linkedin_url,
    company_logo_url: companySnap?.logo_url ?? profile.company_logo_url,
    company_id: primaryCompanyId,
  };

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
        ...display,
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
    .select("hirer_id, slug")
    .eq("id", roleId)
    .maybeSingle();

  if (rErr || !row) return { error: "Role not found." };
  const isAdmin = !!adminSess;
  const isOwner = row.hirer_id === profileId;
  if (!isAdmin && !isOwner) return { error: "Not authorized." };
  if (!row.hirer_id && !isAdmin) return { error: "Only an admin can edit this draft role." };

  const { error: uErr } = await admin
    .from("roles")
    .update({ title, description, location, match_bonus })
    .eq("id", roleId);

  if (uErr) return { error: uErr.message };

  revalidatePath(`/hire/roles/${roleId}`);
  revalidatePath(`/r/${row.slug}`);
  revalidatePath("/hire/dashboard");
  return { ok: true };
}

