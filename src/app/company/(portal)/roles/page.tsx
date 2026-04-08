import Link from "next/link";
import { redirect } from "next/navigation";
import { CompanyRoleFormsSection } from "@/app/company/company-role-forms-section";
import { PageHeader } from "@/app/components/shell/page-header";
import { SaasCard } from "@/app/components/shell/saas-card";
import {
  fetchReferralsForRoleIds,
  fetchRolesForCompany,
} from "@/lib/company-portal-data";
import { getCompanyIdFromServerSession } from "@/lib/session/company-session";

export const metadata = { title: "Roles · Company" };

export default async function CompanyRolesPage() {
  const companyId = await getCompanyIdFromServerSession();
  if (!companyId) redirect("/company/login");

  const { roles, error: rErr } = await fetchRolesForCompany(companyId);
  const roleIds = roles.map((r) => r.id);
  const { referrals, error: refErr } = await fetchReferralsForRoleIds(roleIds);
  const loadError = rErr ?? refErr;

  const countByRole = new Map<string, number>();
  for (const r of roles) countByRole.set(r.id, 0);
  for (const ref of referrals) {
    countByRole.set(ref.role_id, (countByRole.get(ref.role_id) ?? 0) + 1);
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
        title="Roles"
        description="Open roles, submission counts, and public links. Add or edit roles at the bottom of this page."
      />

      <SaasCard className="overflow-hidden p-0">
        <div className="border-b border-stone-100 px-6 py-4">
          <h2 className="text-sm font-semibold text-stone-900">All roles</h2>
          <p className="mt-0.5 text-xs text-stone-500">Click a role to review submissions and update stages.</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[32rem] text-left text-sm">
            <thead>
              <tr className="border-b border-stone-100 bg-stone-50/80 text-[11px] font-semibold uppercase tracking-wide text-stone-500">
                <th className="px-6 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Location</th>
                <th className="px-4 py-3 text-right">Submissions</th>
                <th className="px-6 py-3 text-right"> </th>
              </tr>
            </thead>
            <tbody>
              {roles.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-stone-500">
                    No roles yet. Create one in the section below.
                  </td>
                </tr>
              ) : (
                roles.map((r) => (
                  <tr key={r.id} className="border-b border-stone-100 last:border-0 hover:bg-stone-50/50">
                    <td className="px-6 py-4">
                      <p className="font-medium text-stone-900">{r.title}</p>
                      <p className="font-mono text-[11px] text-stone-400">{r.slug}</p>
                    </td>
                    <td className="px-4 py-4">
                      <span className="inline-flex rounded-md bg-stone-100 px-2 py-0.5 text-xs font-medium capitalize text-stone-800">
                        {r.status}
                      </span>
                    </td>
                    <td className="max-w-[10rem] truncate px-4 py-4 text-stone-600">{r.location ?? "—"}</td>
                    <td className="px-4 py-4 text-right tabular-nums text-stone-800">
                      {countByRole.get(r.id) ?? 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/company/roles/${r.id}`}
                        className="font-medium text-amber-800 hover:underline"
                      >
                        Open
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </SaasCard>

      <SaasCard className="mt-8">
        <h2 className="text-sm font-semibold text-stone-900">Role management</h2>
        <p className="mt-1 text-sm text-stone-600">Edit existing roles or create a new one.</p>
        <CompanyRoleFormsSection roles={roles} />
      </SaasCard>
    </>
  );
}
