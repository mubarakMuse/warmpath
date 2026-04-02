import { AdminClient } from "@/app/admin/admin-client";
import {
  AdminDataTables,
  type AdminCompanyRow,
  type AdminUserRow,
} from "@/app/admin/admin-data-tables";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAdminSessionProfile } from "@/lib/admin/guard";

export const metadata = {
  title: "Admin dashboard | Warmpath",
  description: "Manage companies, users, and provisioning.",
};

type Props = { searchParams: Promise<{ role_error?: string }> };

export default async function AdminDashboardPage({ searchParams }: Props) {
  const sp = await searchParams;
  let roleError: string | null = null;
  if (sp.role_error) {
    try {
      roleError = decodeURIComponent(sp.role_error);
    } catch {
      roleError = sp.role_error;
    }
  }

  const adminSess = await getAdminSessionProfile();
  const currentAdminId = adminSess?.id ?? "";

  let companies: AdminCompanyRow[] = [];
  let connectors: AdminUserRow[] = [];
  let hirers: AdminUserRow[] = [];
  let unassignedRoles: { id: string; title: string; slug: string }[] = [];

  try {
    const admin = createAdminClient();
    const { data: co } = await admin
      .from("companies")
      .select("id, name, slug, website, linkedin_url, logo_url, created_at")
      .order("name");
    companies = co ?? [];

    const companyNameById = new Map(companies.map((c) => [c.id, c.name]));

    const { data: primaryLinks } = await admin
      .from("profile_companies")
      .select("profile_id, company_id")
      .eq("is_primary", true);
    const primaryCompanyByProfile = new Map(
      (primaryLinks ?? []).map((l) => [l.profile_id as string, l.company_id as string]),
    );

    const { data: conn } = await admin
      .from("profiles")
      .select("id, email, full_name, account_role, created_at, auth_user_id")
      .eq("account_role", "connector")
      .order("created_at", { ascending: false });
    connectors = (conn ?? []).map((r) => {
      const cid = primaryCompanyByProfile.get(r.id) ?? null;
      return {
        ...r,
        company_id: cid,
        company_name: cid ? companyNameById.get(cid) ?? null : null,
      };
    });

    const { data: hi } = await admin
      .from("profiles")
      .select("id, email, full_name, account_role, created_at, auth_user_id")
      .in("account_role", ["hirer", "admin"])
      .order("created_at", { ascending: false });
    hirers = (hi ?? []).map((r) => {
      const cid = primaryCompanyByProfile.get(r.id) ?? null;
      return {
        ...r,
        company_id: cid,
        company_name: cid ? companyNameById.get(cid) ?? null : null,
      };
    });

    const { data: ur } = await admin
      .from("roles")
      .select("id, title, slug")
      .is("hirer_id", null)
      .order("created_at", { ascending: false });
    unassignedRoles = ur ?? [];
  } catch {
    /* env missing */
  }

  const companiesForClient = companies.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
  }));

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold text-warm-ink">Admin dashboard</h1>
      <p className="mt-2 max-w-2xl text-sm text-warm-muted">
        Browse and edit companies, connectors, and hiring accounts. Below that, create companies and
        roles and assign hiring managers the same as before.
      </p>

      <div className="mt-10">
        <AdminDataTables
          companies={companies}
          connectors={connectors}
          hirers={hirers}
          currentAdminId={currentAdminId}
        />
      </div>

      <div className="mt-16 border-t border-stone-200 pt-16">
        <h2 className="font-serif text-2xl font-semibold text-warm-ink">Provisioning</h2>
        <p className="mt-2 max-w-2xl text-sm text-warm-muted">
          Hiring managers sign up at /hire/sign-up; assign them to a company and to draft roles here.
        </p>
        <div className="mt-10">
          <AdminClient
            companies={companiesForClient}
            hirers={hirers.map((h) => ({ id: h.id, email: h.email, full_name: h.full_name }))}
            unassignedRoles={unassignedRoles}
            roleError={roleError}
          />
        </div>
      </div>
    </div>
  );
}
