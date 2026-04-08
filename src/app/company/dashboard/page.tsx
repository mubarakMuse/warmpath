import { redirect } from "next/navigation";
import {
  CompanyPortal,
  type CompanyReferralRow,
  type PortalCompany,
  type PortalRole,
} from "@/app/company/company-portal";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCompanyIdFromServerSession } from "@/lib/session/company-session";
import { getSiteBaseUrl } from "@/lib/site-base-url";

export const metadata = { title: "Company dashboard" };

function connectorFromEmbed(
  embed:
    | { full_name: string; linkedin_url?: string | null }
    | { full_name: string; linkedin_url?: string | null }[]
    | null
    | undefined,
): { name: string | null; linkedin_url: string | null } {
  if (!embed) return { name: null, linkedin_url: null };
  const row = Array.isArray(embed) ? embed[0] : embed;
  return {
    name: row?.full_name ?? null,
    linkedin_url: row?.linkedin_url ?? null,
  };
}

export default async function CompanyDashboardPage() {
  const companyId = await getCompanyIdFromServerSession();
  if (!companyId) redirect("/company/login");

  let loadError: string | null = null;
  let company: PortalCompany | null = null;
  let roles: PortalRole[] = [];
  let referrals: CompanyReferralRow[] = [];

  try {
    const admin = createAdminClient();
    const { data: co, error: cErr } = await admin
      .from("companies")
      .select("id, name, slug, logo_url, linkedin_url, website, description, access_code")
      .eq("id", companyId)
      .maybeSingle();

    if (cErr || !co) {
      redirect("/company/login");
    }

    company = co as PortalCompany;

    const { data: roleRows, error: rErr } = await admin
      .from("roles")
      .select("id, title, slug, description, location, status, referral_bonus")
      .eq("company_id", companyId)
      .order("created_at", { ascending: false });

    if (rErr) loadError = rErr.message;
    else roles = (roleRows ?? []) as PortalRole[];

    const roleIds = roles.map((r) => r.id);
    if (roleIds.length > 0 && !loadError) {
      const { data: refRows, error: refErr } = await admin
        .from("connector_referrals")
        .select(
          `
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
        `,
        )
        .in("role_id", roleIds)
        .order("created_at", { ascending: false });

      if (refErr) {
        if (refErr.code === "42P01" || refErr.message.includes("does not exist")) {
          referrals = [];
        } else {
          loadError = refErr.message;
        }
      } else {
        referrals = (refRows ?? []).map((x) => {
          const conn = connectorFromEmbed(
            x.connectors as
              | { full_name: string; linkedin_url?: string | null }
              | { full_name: string; linkedin_url?: string | null }[]
              | null
              | undefined,
          );
          return {
            id: x.id as string,
            role_id: x.role_id as string,
            created_at: x.created_at as string,
            candidate_linkedin_url: x.candidate_linkedin_url as string,
            fit_description: x.fit_description as string,
            candidate_name: (x as { candidate_name?: string | null }).candidate_name ?? null,
            candidate_email: (x as { candidate_email?: string | null }).candidate_email ?? null,
            relationship_type: (x as { relationship_type?: string | null }).relationship_type ?? null,
            relationship_other: (x as { relationship_other?: string | null }).relationship_other ?? null,
            connector_name: conn.name,
            connector_linkedin_url: conn.linkedin_url,
            referral_stage:
              (x as { referral_stage?: string | null }).referral_stage?.trim() || "new",
            company_reason_preset:
              (x as { company_reason_preset?: string | null }).company_reason_preset ?? null,
            company_reason_note:
              (x as { company_reason_note?: string | null }).company_reason_note ?? null,
            company_responded_at:
              (x as { company_responded_at?: string | null }).company_responded_at ?? null,
          };
        });
      }
    }
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Configuration error";
  }

  if (loadError) {
    return <p className="p-8 text-center text-sm text-red-800">{loadError}</p>;
  }

  if (!company) redirect("/company/login");

  const siteBaseUrl = await getSiteBaseUrl();

  return (
    <div className="min-h-dvh bg-[#faf8f5]">
      <CompanyPortal company={company} roles={roles} referrals={referrals} siteBaseUrl={siteBaseUrl} />
    </div>
  );
}
