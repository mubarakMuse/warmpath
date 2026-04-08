import type { CompanyReferralRow, PortalCompany, PortalRole } from "@/app/company/types";
import { createAdminClient } from "@/lib/supabase/admin";

type ConnectorEmbed =
  | { full_name: string; linkedin_url?: string | null }
  | { full_name: string; linkedin_url?: string | null }[]
  | null
  | undefined;

export function connectorFromEmbed(embed: ConnectorEmbed): {
  name: string | null;
  linkedin_url: string | null;
} {
  if (!embed) return { name: null, linkedin_url: null };
  const row = Array.isArray(embed) ? embed[0] : embed;
  return {
    name: row?.full_name ?? null,
    linkedin_url: row?.linkedin_url ?? null,
  };
}

export function mapReferralRow(x: Record<string, unknown>, conn: ReturnType<typeof connectorFromEmbed>) {
  return {
    id: x.id as string,
    role_id: x.role_id as string,
    created_at: x.created_at as string,
    candidate_linkedin_url: x.candidate_linkedin_url as string,
    fit_description: x.fit_description as string,
    candidate_name: (x.candidate_name as string | null | undefined) ?? null,
    candidate_email: (x.candidate_email as string | null | undefined) ?? null,
    relationship_type: (x.relationship_type as string | null | undefined) ?? null,
    relationship_other: (x.relationship_other as string | null | undefined) ?? null,
    connector_name: conn.name,
    connector_linkedin_url: conn.linkedin_url,
    referral_stage: String(x.referral_stage ?? "new").trim() || "new",
    company_reason_preset: (x.company_reason_preset as string | null | undefined) ?? null,
    company_reason_note: (x.company_reason_note as string | null | undefined) ?? null,
    company_responded_at: (x.company_responded_at as string | null | undefined) ?? null,
  } satisfies CompanyReferralRow;
}

const referralSelect = `
  id,
  role_id,
  created_at,
  candidate_linkedin_url,
  fit_description,
  candidate_name,
  candidate_email,
  relationship_type,
  relationship_other,
  referral_stage,
  company_reason_preset,
  company_reason_note,
  company_responded_at,
  connectors ( full_name, linkedin_url )
`;

export async function fetchCompanyProfile(companyId: string): Promise<PortalCompany | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("companies")
    .select("id, name, slug, logo_url, linkedin_url, website, description, access_code")
    .eq("id", companyId)
    .maybeSingle();
  if (error || !data) return null;
  return data as PortalCompany;
}

export async function fetchRolesForCompany(companyId: string): Promise<{
  roles: PortalRole[];
  error: string | null;
}> {
  const admin = createAdminClient();
  const { data: roleRows, error: rErr } = await admin
    .from("roles")
    .select("id, title, slug, description, location, status, referral_bonus")
    .eq("company_id", companyId)
    .order("created_at", { ascending: false });
  if (rErr) return { roles: [], error: rErr.message };
  return { roles: (roleRows ?? []) as PortalRole[], error: null };
}

export async function fetchReferralsForRoleIds(roleIds: string[]): Promise<{
  referrals: CompanyReferralRow[];
  error: string | null;
}> {
  if (roleIds.length === 0) return { referrals: [], error: null };
  const admin = createAdminClient();
  const { data: refRows, error: refErr } = await admin
    .from("connector_referrals")
    .select(referralSelect)
    .in("role_id", roleIds)
    .order("created_at", { ascending: false });

  if (refErr) {
    if (refErr.code === "42P01" || refErr.message.includes("does not exist")) {
      return { referrals: [], error: null };
    }
    return { referrals: [], error: refErr.message };
  }

  const referrals = (refRows ?? []).map((x) => {
    const row = x as Record<string, unknown>;
    const conn = connectorFromEmbed(row.connectors as ConnectorEmbed);
    return mapReferralRow(row, conn);
  });
  return { referrals, error: null };
}

export async function fetchRoleForCompany(
  companyId: string,
  roleId: string,
): Promise<PortalRole | null> {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("roles")
    .select("id, title, slug, description, location, status, referral_bonus")
    .eq("id", roleId)
    .eq("company_id", companyId)
    .maybeSingle();
  if (error || !data) return null;
  return data as PortalRole;
}

export async function fetchReferralsForRoleId(roleId: string): Promise<{
  referrals: CompanyReferralRow[];
  error: string | null;
}> {
  const admin = createAdminClient();
  const { data: refRows, error: refErr } = await admin
    .from("connector_referrals")
    .select(referralSelect)
    .eq("role_id", roleId)
    .order("created_at", { ascending: false });

  if (refErr) {
    if (refErr.code === "42P01" || refErr.message.includes("does not exist")) {
      return { referrals: [], error: null };
    }
    return { referrals: [], error: refErr.message };
  }

  const referrals = (refRows ?? []).map((x) => {
    const row = x as Record<string, unknown>;
    const conn = connectorFromEmbed(row.connectors as ConnectorEmbed);
    return mapReferralRow(row, conn);
  });
  return { referrals, error: null };
}
