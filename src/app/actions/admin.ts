"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getAdminSessionProfile } from "@/lib/admin/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import { normalizeReferralBonusForStorage } from "@/lib/referral-bonus";
import {
  fetchCompanySnapshot,
  getPrimaryCompanyIdForProfile,
  profileHasCompanyMembership,
  setProfilePrimaryCompany,
} from "@/lib/admin/profile-companies";
import { makeCompanySlug, makeRoleSlug } from "@/lib/slug";

export type AdminFormState = { error?: string; ok?: boolean; message?: string };

function clip(s: string, max: number) {
  return s.trim().slice(0, max);
}

export async function adminCreateCompany(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await getAdminSessionProfile())) return { error: "Not authorized." };

  const name = String(formData.get("name") ?? "").trim();
  if (name.length < 2) return { error: "Company name is required." };

  let slug = String(formData.get("slug") ?? "").trim() || makeCompanySlug(name);
  const website = clip(String(formData.get("website") ?? ""), 500) || null;
  const linkedin_url = clip(String(formData.get("linkedin_url") ?? ""), 500) || null;
  const logo_url = clip(String(formData.get("logo_url") ?? ""), 500) || null;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Server is not configured." };
  }

  for (let attempt = 0; attempt < 6; attempt++) {
    const { error } = await admin.from("companies").insert({
      name,
      slug,
      website,
      linkedin_url,
      logo_url,
    });
    if (!error) {
      revalidatePath("/admin");
      revalidatePath("/admin/dashboard");
      return { ok: true, message: `Company created (slug: ${slug}).` };
    }
    if (error.code === "23505") {
      slug = `${makeCompanySlug(name)}-${attempt + 2}`;
      continue;
    }
    return { error: error.message };
  }

  return { error: "Could not create a unique company slug." };
}

/** After a hiring manager signs up, attach them to a company and refresh company fields on their roles. */
export async function adminAssignProfileToCompany(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await getAdminSessionProfile())) return { error: "Not authorized." };

  const profileId = String(formData.get("profile_id") ?? "").trim();
  const companyIdRaw = String(formData.get("company_id") ?? "").trim();

  if (!profileId) return { error: "Choose a hiring manager." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Server is not configured." };
  }

  const { data: profile, error: pErr } = await admin
    .from("profiles")
    .select("id, account_role, full_name, linkedin_url, avatar_url")
    .eq("id", profileId)
    .maybeSingle();

  if (pErr || !profile) return { error: "Profile not found." };
  if (profile.account_role !== "hirer" && profile.account_role !== "admin") {
    return { error: "Only hiring managers or admins can be assigned to a company." };
  }

  const companyId = companyIdRaw.length > 0 ? companyIdRaw : null;
  let co: {
    id: string;
    name: string;
    website: string | null;
    linkedin_url: string | null;
    logo_url: string | null;
  } | null = null;

  if (companyId) {
    const { data: row, error: cErr } = await admin
      .from("companies")
      .select("id, name, website, linkedin_url, logo_url")
      .eq("id", companyId)
      .maybeSingle();
    if (cErr || !row) return { error: "Invalid company." };
    co = row;
  }

  try {
    await setProfilePrimaryCompany(admin, profileId, companyId);
  } catch (e) {
    return { error: e instanceof Error ? e.message : "Could not update company links." };
  }

  const { error: uErr } = await admin
    .from("roles")
    .update({
      hirer_full_name: profile.full_name,
      hirer_linkedin_url: profile.linkedin_url,
      hirer_avatar_url: profile.avatar_url,
    })
    .eq("hirer_id", profileId);
  if (uErr) return { error: uErr.message };

  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
  return {
    ok: true,
    message: co
      ? `Primary company set to ${co.name}. Existing roles keep their own organization until you edit them.`
      : "Company links cleared for this hiring manager.",
  };
}

async function syncHirerDisplayOnRoles(
  admin: ReturnType<typeof createAdminClient>,
  profileId: string,
) {
  const { data: profile, error: pErr } = await admin
    .from("profiles")
    .select("full_name, linkedin_url, avatar_url")
    .eq("id", profileId)
    .maybeSingle();
  if (pErr || !profile) return;
  await admin
    .from("roles")
    .update({
      hirer_full_name: profile.full_name,
      hirer_linkedin_url: profile.linkedin_url,
      hirer_avatar_url: profile.avatar_url,
    })
    .eq("hirer_id", profileId);
}

async function refreshRolesCompanySnapshotByCompanyId(
  admin: ReturnType<typeof createAdminClient>,
  companyId: string,
) {
  const co = await fetchCompanySnapshot(admin, companyId);
  if (!co) return;
  await admin
    .from("roles")
    .update({
      company_name: co.name,
      company_website: co.website,
      company_linkedin_url: co.linkedin_url,
      company_logo_url: co.logo_url,
    })
    .eq("company_id", companyId);
}

export async function adminUpdateCompany(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await getAdminSessionProfile())) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  if (!id) return { error: "Missing company." };
  if (name.length < 2) return { error: "Company name is required." };

  let slug = String(formData.get("slug") ?? "").trim() || makeCompanySlug(name);
  const website = clip(String(formData.get("website") ?? ""), 500) || null;
  const linkedin_url = clip(String(formData.get("linkedin_url") ?? ""), 500) || null;
  const logo_url = clip(String(formData.get("logo_url") ?? ""), 500) || null;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Server is not configured." };
  }

  for (let attempt = 0; attempt < 6; attempt++) {
    const { error } = await admin
      .from("companies")
      .update({ name, slug, website, linkedin_url, logo_url })
      .eq("id", id);
    if (!error) {
      await refreshRolesCompanySnapshotByCompanyId(admin, id);
      revalidatePath("/admin");
      revalidatePath("/admin/dashboard");
      return { ok: true, message: "Company updated." };
    }
    if (error.code === "23505") {
      slug = `${makeCompanySlug(name)}-${attempt + 2}`;
      continue;
    }
    return { error: error.message };
  }
  return { error: "Could not save (slug conflict)." };
}

export async function adminDeleteCompany(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await getAdminSessionProfile())) return { error: "Not authorized." };
  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing company." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Server is not configured." };
  }

  const { error } = await admin.from("companies").delete().eq("id", id);
  if (error) return { error: error.message };
  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
  return { ok: true, message: "Company deleted." };
}

const PROFILE_ROLES = new Set(["hirer", "connector", "admin"]);

export async function adminUpdateProfile(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const sess = await getAdminSessionProfile();
  if (!sess) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "").trim();
  const full_name = String(formData.get("full_name") ?? "").trim();
  const account_role = String(formData.get("account_role") ?? "").trim();
  const companyIdRaw = String(formData.get("company_id") ?? "").trim();

  if (!id) return { error: "Missing profile." };
  if (full_name.length < 2) return { error: "Name is required." };
  if (!PROFILE_ROLES.has(account_role)) return { error: "Invalid role." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Server is not configured." };
  }

  const { data: existing, error: exErr } = await admin
    .from("profiles")
    .select("id, account_role")
    .eq("id", id)
    .maybeSingle();
  if (exErr || !existing) return { error: "Profile not found." };

  if (account_role === "connector" && existing.account_role !== "connector") {
    const { count, error: cErr } = await admin
      .from("roles")
      .select("id", { count: "exact", head: true })
      .eq("hirer_id", id);
    if (cErr) return { error: cErr.message };
    if ((count ?? 0) > 0) {
      return {
        error:
          "This user still owns hiring roles. Reassign or delete those roles before changing them to a connector.",
      };
    }
  }

  const selectedCompanyId =
    account_role === "hirer" || account_role === "admin"
      ? companyIdRaw.length > 0
        ? companyIdRaw
        : null
      : null;

  if (selectedCompanyId) {
    const { data: co, error: cErr } = await admin
      .from("companies")
      .select("id")
      .eq("id", selectedCompanyId)
      .maybeSingle();
    if (cErr || !co) return { error: "Invalid company." };
  }

  const { error: uErr } = await admin
    .from("profiles")
    .update({
      full_name,
      account_role,
    })
    .eq("id", id);

  if (uErr) return { error: uErr.message };

  if (account_role === "hirer" || account_role === "admin") {
    try {
      await setProfilePrimaryCompany(admin, id, selectedCompanyId);
    } catch (e) {
      return { error: e instanceof Error ? e.message : "Could not update company links." };
    }
    await syncHirerDisplayOnRoles(admin, id);
  } else {
    await admin.from("profile_companies").delete().eq("profile_id", id);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
  return { ok: true, message: "Profile updated." };
}

export async function adminDeleteProfile(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const sess = await getAdminSessionProfile();
  if (!sess) return { error: "Not authorized." };

  const id = String(formData.get("id") ?? "").trim();
  if (!id) return { error: "Missing profile." };
  if (id === sess.id) return { error: "You can’t delete your own admin account." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Server is not configured." };
  }

  const { data: row, error: gErr } = await admin
    .from("profiles")
    .select("auth_user_id")
    .eq("id", id)
    .maybeSingle();
  if (gErr || !row) return { error: "Profile not found." };

  const authUserId = row.auth_user_id as string | null;

  const { error: dErr } = await admin.from("profiles").delete().eq("id", id);
  if (dErr) return { error: dErr.message };

  if (authUserId) {
    const { error: authErr } = await admin.auth.admin.deleteUser(authUserId);
    if (authErr) {
      return {
        ok: true,
        message: "Profile removed. Auth user could not be deleted automatically—remove it in Supabase if needed.",
      };
    }
  }

  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
  return { ok: true, message: "Profile deleted." };
}

function roleStatusSet() {
  return new Set([
    "draft",
    "getting_started",
    "sourcing",
    "screening",
    "interviewing",
    "on_hold",
    "closed",
  ]);
}

/** Create a role with or without a hiring manager. Unassigned roles stay draft until you assign someone. */
export async function adminCreateRole(formData: FormData) {
  if (!(await getAdminSessionProfile())) {
    redirect("/login?error=admin");
  }

  const hirerIdRaw = String(formData.get("hirer_id") ?? "").trim();
  const roleCompanyIdRaw = String(formData.get("role_company_id") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  const location = clip(String(formData.get("location") ?? ""), 300) || null;
  const match_bonus = normalizeReferralBonusForStorage(String(formData.get("match_bonus") ?? ""), 500);
  const statusRaw = String(formData.get("status") ?? "draft").trim();

  const hirerId = hirerIdRaw.length > 0 ? hirerIdRaw : null;

  if (title.length < 2) {
    redirect(`/admin/dashboard?role_error=${encodeURIComponent("Role title required.")}`);
  }

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    redirect(`/admin/dashboard?role_error=${encodeURIComponent("Server is not configured.")}`);
  }

  const allowed = roleStatusSet();
  let status = allowed.has(statusRaw) ? statusRaw : "draft";
  if (!hirerId) {
    status = "draft";
  }

  let display: {
    hirer_full_name: string | null;
    hirer_linkedin_url: string | null;
    hirer_avatar_url: string | null;
    company_name: string | null;
    company_website: string | null;
    company_linkedin_url: string | null;
    company_logo_url: string | null;
    company_id: string | null;
  };

  if (hirerId) {
    const { data: profile, error: pErr } = await admin
      .from("profiles")
      .select(
        "id, full_name, linkedin_url, avatar_url, company_name, company_website, company_linkedin_url, company_logo_url",
      )
      .eq("id", hirerId)
      .maybeSingle();

    if (pErr || !profile) {
      redirect(`/admin/dashboard?role_error=${encodeURIComponent("Hirer profile not found.")}`);
    }

    const explicitCo = roleCompanyIdRaw.length > 0 ? roleCompanyIdRaw : null;
    const primaryId = await getPrimaryCompanyIdForProfile(admin, hirerId);
    const effectiveCoId = explicitCo ?? primaryId;

    if (explicitCo && !(await profileHasCompanyMembership(admin, hirerId, explicitCo))) {
      redirect(
        `/admin/dashboard?role_error=${encodeURIComponent("That hiring manager is not linked to the selected company. Add the company to their profile first, or pick another org.")}`,
      );
    }

    const companyRow = effectiveCoId ? await fetchCompanySnapshot(admin, effectiveCoId) : null;
    if (effectiveCoId && !companyRow) {
      redirect(`/admin/dashboard?role_error=${encodeURIComponent("Invalid company for this role.")}`);
    }

    display = {
      hirer_full_name: profile.full_name,
      hirer_linkedin_url: profile.linkedin_url,
      hirer_avatar_url: profile.avatar_url,
      company_name: companyRow?.name ?? profile.company_name,
      company_website: companyRow?.website ?? profile.company_website,
      company_linkedin_url: companyRow?.linkedin_url ?? profile.company_linkedin_url,
      company_logo_url: companyRow?.logo_url ?? profile.company_logo_url,
      company_id: effectiveCoId,
    };
  } else if (roleCompanyIdRaw.length > 0) {
    const { data: co, error: cErr } = await admin
      .from("companies")
      .select("id, name, website, linkedin_url, logo_url")
      .eq("id", roleCompanyIdRaw)
      .maybeSingle();

    if (cErr || !co) {
      redirect(`/admin/dashboard?role_error=${encodeURIComponent("Invalid company for this role.")}`);
    }

    display = {
      hirer_full_name: null,
      hirer_linkedin_url: null,
      hirer_avatar_url: null,
      company_name: co.name,
      company_website: co.website,
      company_linkedin_url: co.linkedin_url,
      company_logo_url: co.logo_url,
      company_id: co.id,
    };
  } else {
    display = {
      hirer_full_name: null,
      hirer_linkedin_url: null,
      hirer_avatar_url: null,
      company_name: null,
      company_website: null,
      company_linkedin_url: null,
      company_logo_url: null,
      company_id: null,
    };
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
        status,
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
    redirect(`/admin/dashboard?role_error=${encodeURIComponent(error?.message ?? "Could not create role.")}`);
  }

  if (!roleId) {
    redirect(`/admin/dashboard?role_error=${encodeURIComponent("Could not generate a unique role slug.")}`);
  }

  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
  redirect(hirerId ? `/hire/roles/${roleId}` : `/hire/roles/${roleId}?new=1`);
}

export async function adminAssignHirerToRole(
  _prev: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  if (!(await getAdminSessionProfile())) return { error: "Not authorized." };

  const roleId = String(formData.get("role_id") ?? "").trim();
  const hirerId = String(formData.get("hirer_id") ?? "").trim();
  const publish = String(formData.get("publish") ?? "").trim() === "on";

  if (!roleId || !hirerId) return { error: "Choose a role and a hiring manager." };

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return { error: "Server is not configured." };
  }

  const { data: role, error: rErr } = await admin
    .from("roles")
    .select("id, hirer_id, company_id")
    .eq("id", roleId)
    .maybeSingle();

  if (rErr || !role) return { error: "Role not found." };
  if (role.hirer_id) return { error: "This role already has a hiring manager." };

  const { data: profile, error: pErr } = await admin
    .from("profiles")
    .select(
      "id, full_name, linkedin_url, avatar_url, company_name, company_website, company_linkedin_url, company_logo_url",
    )
    .eq("id", hirerId)
    .maybeSingle();

  if (pErr || !profile) return { error: "Hirer profile not found." };

  const existingRoleCompanyId = role.company_id as string | null;
  const primaryId = await getPrimaryCompanyIdForProfile(admin, hirerId);
  const effectiveCompanyId = existingRoleCompanyId ?? primaryId ?? null;

  const companyRow = effectiveCompanyId
    ? await fetchCompanySnapshot(admin, effectiveCompanyId)
    : null;

  const display = {
    hirer_id: hirerId,
    hirer_full_name: profile.full_name,
    hirer_linkedin_url: profile.linkedin_url,
    hirer_avatar_url: profile.avatar_url,
    company_name: companyRow?.name ?? profile.company_name,
    company_website: companyRow?.website ?? profile.company_website,
    company_linkedin_url: companyRow?.linkedin_url ?? profile.company_linkedin_url,
    company_logo_url: companyRow?.logo_url ?? profile.company_logo_url,
    company_id: effectiveCompanyId,
    status: publish ? "getting_started" : "draft",
  };

  const { error: upErr } = await admin.from("roles").update(display).eq("id", roleId);

  if (upErr) return { error: upErr.message };

  revalidatePath("/admin");
  revalidatePath("/admin/dashboard");
  revalidatePath(`/hire/roles/${roleId}`);
  return {
    ok: true,
    message: "Hiring manager assigned. They can open this role from their dashboard.",
  };
}
