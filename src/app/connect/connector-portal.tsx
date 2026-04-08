"use client";

import Link from "next/link";
import { PageHeader } from "@/app/components/shell/page-header";
import { SaasCard } from "@/app/components/shell/saas-card";
import { relationshipDisplay } from "@/lib/relationship-options";
import { reasonPresetLabel, referralStageBadgeClass, referralStageLabel } from "@/lib/referral-response";

export type ConnectReferralRow = {
  id: string;
  created_at: string;
  candidate_linkedin_url: string;
  fit_description: string;
  candidate_name: string | null;
  candidate_email: string | null;
  relationship_type: string | null;
  relationship_other: string | null;
  role_title: string;
  company_name: string;
  referral_stage: string;
  company_reason_preset: string | null;
  company_reason_note: string | null;
  company_responded_at: string | null;
};

export function ConnectorPortal({ referrals }: { referrals: ConnectReferralRow[] }) {
  return (
    <>
      <PageHeader
        title="Dashboard"
        description="Browse active roles, submit referrals, and track how companies are moving each introduction."
      />

      <SaasCard className="border-amber-200/60 bg-gradient-to-br from-amber-50/80 to-white">
        <h2 className="text-sm font-semibold text-stone-900">Browse open roles</h2>
        <p className="mt-1 text-sm text-stone-600">
          Search roles, open a job for full details and referral bonus, then submit next to the description.
        </p>
        <Link
          href="/connect/roles"
          className="mt-4 inline-flex min-h-10 items-center rounded-lg bg-amber-800 px-5 text-sm font-semibold text-white hover:bg-amber-900"
        >
          Search & view roles
        </Link>
      </SaasCard>

      <SaasCard className="mt-6">
        <h2 className="text-sm font-semibold text-stone-900">Recent submissions</h2>
        <p className="mt-1 text-xs text-stone-500">Newest first. Status updates when the company responds.</p>
        {referrals.length === 0 ? (
          <p className="mt-6 text-sm text-stone-500">Nothing submitted yet.</p>
        ) : (
          <ul className="mt-4 divide-y divide-stone-100">
            {referrals.map((ref) => {
              const rel = relationshipDisplay(ref.relationship_type, ref.relationship_other);
              return (
                <li key={ref.id} className="py-4 first:pt-0">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <p className="text-sm font-medium text-stone-900">
                      {ref.company_name} — {ref.role_title}
                    </p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${referralStageBadgeClass(ref.referral_stage)}`}
                    >
                      {referralStageLabel(ref.referral_stage)}
                    </span>
                  </div>
                  {ref.candidate_name ? (
                    <p className="mt-1 text-sm text-stone-700">Candidate: {ref.candidate_name}</p>
                  ) : null}
                  {ref.candidate_email ? (
                    <p className="mt-0.5 font-mono text-xs text-stone-600">{ref.candidate_email}</p>
                  ) : null}
                  {rel ? <p className="mt-1 text-xs text-stone-500">How you know them: {rel}</p> : null}
                  <p className="mt-1 font-mono text-xs text-amber-900/90">
                    <a href={ref.candidate_linkedin_url} className="hover:underline" target="_blank" rel="noreferrer">
                      {ref.candidate_linkedin_url}
                    </a>
                  </p>
                  <p className="mt-2 text-sm text-stone-600">{ref.fit_description}</p>
                  <div className="mt-3 rounded-lg border border-stone-100 bg-stone-50/80 px-3 py-2 text-xs text-stone-700">
                    {reasonPresetLabel(ref.company_reason_preset) ? (
                      <p className="text-stone-600">
                        <span className="font-medium text-stone-800">Reason:</span>{" "}
                        {reasonPresetLabel(ref.company_reason_preset)}
                      </p>
                    ) : null}
                    {ref.company_reason_note?.trim() ? (
                      <p className="mt-1 whitespace-pre-wrap text-stone-600">{ref.company_reason_note}</p>
                    ) : null}
                    {ref.company_responded_at ? (
                      <p className="mt-1 text-[11px] text-stone-400">
                        Updated{" "}
                        {new Date(ref.company_responded_at).toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs text-stone-400">
                    Submitted{" "}
                    {new Date(ref.created_at).toLocaleString(undefined, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </p>
                </li>
              );
            })}
          </ul>
        )}
      </SaasCard>
    </>
  );
}
