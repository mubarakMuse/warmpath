"use client";

import Link from "next/link";
import { ConnectorProfileModal } from "@/app/connect/connector-profile-modal";
import type { ConnectorMe } from "@/app/connect/types";
import { connectorLogout } from "@/app/actions/connect";
import { ensureHttpsUrl } from "@/lib/ensure-https-url";
import { relationshipDisplay } from "@/lib/relationship-options";
import { reasonPresetLabel, referralStageLabel } from "@/lib/referral-response";

export type { ConnectorMe };

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

export function ConnectorPortal({ me, referrals }: { me: ConnectorMe; referrals: ConnectReferralRow[] }) {
  return (
    <div className="mx-auto max-w-2xl space-y-10 px-6 py-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl font-semibold text-stone-900">Connector dashboard</h1>
          <p className="mt-2 text-sm text-stone-800">
            <span className="font-medium">{me.full_name}</span>
            {me.role_title ? <span className="text-stone-500"> · {me.role_title}</span> : null}
          </p>
          {me.email ? <p className="mt-0.5 truncate text-xs text-stone-500">{me.email}</p> : null}
          {ensureHttpsUrl(me.linkedin_url) ? (
            <p className="mt-1 text-xs">
              <a
                href={ensureHttpsUrl(me.linkedin_url)!}
                className="font-medium text-amber-800 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm">
          <Link href="/" className="font-medium text-amber-800 hover:underline">
            Home
          </Link>
          <ConnectorProfileModal me={me} />
          <form action={connectorLogout} className="inline">
            <button type="submit" className="text-stone-500 hover:text-stone-800">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <section className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-6 shadow-sm">
        <h2 className="font-semibold text-stone-900">Browse open roles</h2>
        <p className="mt-1 text-sm text-stone-600">
          Search every active role, open the job to see details and referral bonus (if any), copy a public link to
          share with candidates, and submit referrals next to the job description.
        </p>
        <Link
          href="/connect/roles"
          className="mt-4 inline-flex min-h-11 items-center rounded-lg bg-amber-800 px-5 text-sm font-semibold text-white hover:bg-amber-900"
        >
          Search & view roles
        </Link>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-stone-900">Your recent submissions</h2>
        {referrals.length === 0 ? (
          <p className="mt-3 text-sm text-stone-500">Nothing submitted yet.</p>
        ) : (
          <ul className="mt-4 space-y-4">
            {referrals.map((ref) => {
              const rel = relationshipDisplay(ref.relationship_type, ref.relationship_other);
              return (
                <li key={ref.id} className="border-b border-stone-100 pb-4 last:border-0 last:pb-0">
                  <p className="text-sm font-medium text-stone-900">
                    {ref.company_name} — {ref.role_title}
                  </p>
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
                    <p className="font-medium text-stone-800">
                      Company status: {referralStageLabel(ref.referral_stage)}
                    </p>
                    {reasonPresetLabel(ref.company_reason_preset) ? (
                      <p className="mt-1 text-stone-600">
                        Reason: {reasonPresetLabel(ref.company_reason_preset)}
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
      </section>
    </div>
  );
}
