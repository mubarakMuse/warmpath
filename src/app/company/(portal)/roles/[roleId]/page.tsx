import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { ReferralSubmissionRow } from "@/app/company/referral-submission-row";
import { CopyPublicLinkButton } from "@/app/connect/copy-public-link-button";
import { PageHeader } from "@/app/components/shell/page-header";
import { SaasCard } from "@/app/components/shell/saas-card";
import {
  fetchReferralsForRoleId,
  fetchRoleForCompany,
} from "@/lib/company-portal-data";
import { getCompanyIdFromServerSession } from "@/lib/session/company-session";
import { getSiteBaseUrl } from "@/lib/site-base-url";

export async function generateMetadata({ params }: { params: Promise<{ roleId: string }> }) {
  const { roleId } = await params;
  return { title: `Role · ${roleId.slice(0, 8)}…` };
}

export default async function CompanyRoleDetailPage({ params }: { params: Promise<{ roleId: string }> }) {
  const { roleId } = await params;
  const companyId = await getCompanyIdFromServerSession();
  if (!companyId) redirect("/company/login");

  const role = await fetchRoleForCompany(companyId, roleId);
  if (!role) notFound();

  const { referrals, error: refErr } = await fetchReferralsForRoleId(roleId);
  const siteBaseUrl = await getSiteBaseUrl();
  const publicUrl = `${siteBaseUrl}/r/${encodeURIComponent(role.slug)}`;

  return (
    <>
      <div className="mb-6">
        <Link
          href="/company/roles"
          className="text-sm font-medium text-amber-800 hover:underline"
        >
          ← All roles
        </Link>
      </div>

      <PageHeader
        title={role.title}
        description={[role.status, role.location].filter(Boolean).join(" · ") || undefined}
        action={
          <a
            href={publicUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-10 items-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-semibold text-stone-800 hover:bg-stone-50"
          >
            View public page
          </a>
        }
      />

      {refErr ? (
        <SaasCard className="mb-8 border-red-200 bg-red-50/50">
          <p className="text-sm text-red-800">{refErr}</p>
        </SaasCard>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-5 lg:items-start">
        <SaasCard className="lg:col-span-2">
          <h2 className="text-sm font-semibold text-stone-900">Role details</h2>
          {role.description ? (
            <div className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
              {role.description}
            </div>
          ) : (
            <p className="mt-3 text-sm text-stone-500">No description.</p>
          )}
          {role.referral_bonus ? (
            <div className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50/50 px-3 py-2">
              <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-900/80">
                Referral bonus
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-stone-800">{role.referral_bonus}</p>
            </div>
          ) : null}
          <div className="mt-6 border-t border-stone-100 pt-4">
            <p className="text-xs font-medium text-stone-700">Public job link</p>
            <div className="mt-2">
              <CopyPublicLinkButton url={publicUrl} label="Copy public link" />
            </div>
          </div>
        </SaasCard>

        <SaasCard className="lg:col-span-3">
          <h2 className="text-sm font-semibold text-stone-900">Submissions ({referrals.length})</h2>
          <p className="mt-1 text-xs text-stone-500">
            Expand a row to see full context and update stage or rejection reason.
          </p>
          {referrals.length === 0 ? (
            <p className="mt-6 text-sm text-stone-500">No referrals for this role yet.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {referrals.map((r) => (
                <ReferralSubmissionRow key={r.id} referral={r} />
              ))}
            </ul>
          )}
        </SaasCard>
      </div>
    </>
  );
}
