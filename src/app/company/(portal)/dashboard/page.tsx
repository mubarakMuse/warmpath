import Link from "next/link";
import { redirect } from "next/navigation";
import { PageHeader } from "@/app/components/shell/page-header";
import { SaasCard } from "@/app/components/shell/saas-card";
import {
  fetchReferralsForRoleIds,
  fetchRolesForCompany,
} from "@/lib/company-portal-data";
import { getCompanyIdFromServerSession } from "@/lib/session/company-session";

export const metadata = { title: "Dashboard · Company" };

function StatCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-stone-200 bg-white p-5 shadow-sm">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-stone-500">{label}</p>
      <p className="mt-2 font-serif text-3xl font-semibold text-stone-900">{value}</p>
      {hint ? <p className="mt-2 text-xs text-stone-500">{hint}</p> : null}
    </div>
  );
}

export default async function CompanyDashboardPage() {
  const companyId = await getCompanyIdFromServerSession();
  if (!companyId) redirect("/company/login");

  const { roles, error: rErr } = await fetchRolesForCompany(companyId);
  const roleIds = roles.map((r) => r.id);
  const { referrals, error: refErr } = await fetchReferralsForRoleIds(roleIds);

  const loadError = rErr ?? refErr;

  const activeRoles = roles.filter((r) => r.status === "active").length;
  const needsReview = referrals.filter((r) => r.referral_stage === "new").length;

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
        title="Dashboard"
        description="Overview of open roles and connector submissions. Manage details under Roles and Settings."
      />

      <div className="grid gap-4 sm:grid-cols-3">
        <StatCard label="Active roles" value={activeRoles} hint={`${roles.length} total roles`} />
        <StatCard label="Submissions" value={referrals.length} hint="All time for your roles" />
        <StatCard
          label="Needs review"
          value={needsReview}
          hint={needsReview > 0 ? "Stage still “New”" : "Nothing waiting"}
        />
      </div>

      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <SaasCard>
          <h2 className="text-sm font-semibold text-stone-900">Roles & referrals</h2>
          <p className="mt-1 text-sm text-stone-600">
            View every opening, public links, and submissions. Update pipeline stages from each referral.
          </p>
          <Link
            href="/company/roles"
            className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-amber-800 px-4 text-sm font-semibold text-white hover:bg-amber-900"
          >
            Go to roles
          </Link>
        </SaasCard>
        <SaasCard>
          <h2 className="text-sm font-semibold text-stone-900">Company profile</h2>
          <p className="mt-1 text-sm text-stone-600">
            Name, slug, and links used on public job pages.
          </p>
          <Link
            href="/company/settings"
            className="mt-4 inline-flex min-h-10 items-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-800 hover:bg-stone-50"
          >
            Open settings
          </Link>
        </SaasCard>
      </div>
    </>
  );
}
