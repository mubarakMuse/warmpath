import {
  AdminDashboard,
  type CompanyRow,
  type ConnectorRow,
  type WaitlistRow,
} from "@/app/admin/admin-dashboard";
import { PageHeader } from "@/app/components/shell/page-header";
import { SaasCard } from "@/app/components/shell/saas-card";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata = { title: "Admin" };

export default async function AdminHomePage() {
  let loadError: string | null = null;
  let companies: CompanyRow[] = [];
  let connectors: ConnectorRow[] = [];
  let waitlist: WaitlistRow[] = [];

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("companies")
      .select(
        `
        id,
        name,
        slug,
        access_code,
        logo_url,
        linkedin_url,
        website,
        description,
        roles ( id, title, slug, status, location, description, referral_bonus )
      `,
      )
      .order("name");

    if (error) loadError = `Could not load companies: ${error.message}. Run the SQL migration and check Supabase keys.`;
    else companies = (data ?? []) as CompanyRow[];

    const { data: connData, error: connErr } = await admin
      .from("connectors")
      .select("id, full_name, role_title, email, linkedin_url, access_code, created_at")
      .order("created_at", { ascending: false });
    if (!connErr && connData) connectors = connData as ConnectorRow[];

    const { data: wlData, error: wlErr } = await admin
      .from("waitlist")
      .select("id, kind, company_name, email, created_at")
      .order("created_at", { ascending: false })
      .limit(200);
    if (!wlErr && wlData) waitlist = wlData as WaitlistRow[];
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Supabase is not configured.";
  }

  if (loadError) {
    return (
      <SaasCard className="border-red-200 bg-red-50/50">
        <p className="text-sm text-red-800">{loadError}</p>
      </SaasCard>
    );
  }

  return (
    <>
      <PageHeader
        title="Admin"
        description="Manage companies, roles, connectors, and the landing waitlist — same layout and patterns as the company and connector portals."
      />
      <AdminDashboard companies={companies} connectors={connectors} waitlist={waitlist} />
    </>
  );
}
