import type { SupabaseClient } from "@supabase/supabase-js";

export type CompanySnapshot = {
  id: string;
  name: string;
  website: string | null;
  linkedin_url: string | null;
  logo_url: string | null;
};

export async function getPrimaryCompanyIdForProfile(
  admin: SupabaseClient,
  profileId: string,
): Promise<string | null> {
  const { data } = await admin
    .from("profile_companies")
    .select("company_id")
    .eq("profile_id", profileId)
    .eq("is_primary", true)
    .maybeSingle();
  return (data?.company_id as string | undefined) ?? null;
}

export async function profileHasCompanyMembership(
  admin: SupabaseClient,
  profileId: string,
  companyId: string,
): Promise<boolean> {
  const { data } = await admin
    .from("profile_companies")
    .select("company_id")
    .eq("profile_id", profileId)
    .eq("company_id", companyId)
    .maybeSingle();
  return !!data;
}

/** Set primary company (and membership). Passing null removes all company links for the profile. */
export async function setProfilePrimaryCompany(
  admin: SupabaseClient,
  profileId: string,
  companyId: string | null,
) {
  if (!companyId) {
    await admin.from("profile_companies").delete().eq("profile_id", profileId);
    return;
  }

  const { data: row } = await admin
    .from("profile_companies")
    .select("company_id")
    .eq("profile_id", profileId)
    .eq("company_id", companyId)
    .maybeSingle();

  if (!row) {
    const { error } = await admin.from("profile_companies").insert({
      profile_id: profileId,
      company_id: companyId,
      is_primary: false,
    });
    if (error) throw new Error(error.message);
  }

  await admin.from("profile_companies").update({ is_primary: false }).eq("profile_id", profileId);
  const { error: e2 } = await admin
    .from("profile_companies")
    .update({ is_primary: true })
    .eq("profile_id", profileId)
    .eq("company_id", companyId);
  if (e2) throw new Error(e2.message);
}

export async function listCompaniesForProfile(
  admin: SupabaseClient,
  profileId: string,
): Promise<{ id: string; name: string; is_primary: boolean }[]> {
  const { data, error } = await admin
    .from("profile_companies")
    .select("is_primary, companies (id, name)")
    .eq("profile_id", profileId);

  if (error || !data?.length) return [];

  const rows: { id: string; name: string; is_primary: boolean }[] = [];
  for (const row of data) {
    const c = row.companies as { id: string; name: string } | { id: string; name: string }[] | null;
    const co = Array.isArray(c) ? c[0] : c;
    if (co?.id) rows.push({ id: co.id, name: co.name, is_primary: !!row.is_primary });
  }
  rows.sort((a, b) => {
    if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
    return a.name.localeCompare(b.name);
  });
  return rows;
}

export async function fetchCompanySnapshot(
  admin: SupabaseClient,
  companyId: string,
): Promise<CompanySnapshot | null> {
  const { data, error } = await admin
    .from("companies")
    .select("id, name, website, linkedin_url, logo_url")
    .eq("id", companyId)
    .maybeSingle();
  if (error || !data) return null;
  return data as CompanySnapshot;
}
