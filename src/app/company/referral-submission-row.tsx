"use client";

import { useState } from "react";
import { ReferralResponseForm } from "@/app/company/referral-response-form";
import type { CompanyReferralRow } from "@/app/company/types";
import { ensureHttpsUrl } from "@/lib/ensure-https-url";
import { relationshipDisplay } from "@/lib/relationship-options";
import { referralStageBadgeClass, referralStageLabel } from "@/lib/referral-response";

export function ReferralSubmissionRow({ referral: row }: { referral: CompanyReferralRow }) {
  const [open, setOpen] = useState(false);
  const rel = relationshipDisplay(row.relationship_type, row.relationship_other);
  const title = row.candidate_name?.trim() || row.candidate_linkedin_url || "Candidate";

  return (
    <li className="overflow-hidden rounded-lg border border-stone-200 bg-white text-sm shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-stone-50"
      >
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${referralStageBadgeClass(row.referral_stage)}`}
        >
          {referralStageLabel(row.referral_stage)}
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate font-medium text-stone-900">{title}</p>
          <p className="truncate text-xs text-stone-500">
            {row.connector_name ? `From ${row.connector_name}` : "Connector"} ·{" "}
            {new Date(row.created_at).toLocaleDateString(undefined, {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </p>
        </div>
        <span className="shrink-0 text-xs font-medium text-amber-800">{open ? "Hide" : "Review"}</span>
      </button>
      {open ? (
        <div className="border-t border-stone-100 bg-stone-50/40 px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
            <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
              {row.connector_name ? (
                <>
                  <span className="font-medium text-stone-700">{row.connector_name}</span>
                  {ensureHttpsUrl(row.connector_linkedin_url) ? (
                    <>
                      <span className="text-stone-300">·</span>
                      <a
                        href={ensureHttpsUrl(row.connector_linkedin_url)!}
                        className="font-medium text-amber-800 hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        LinkedIn
                      </a>
                    </>
                  ) : null}
                </>
              ) : (
                "Connector"
              )}
            </span>
            <time dateTime={row.created_at}>
              {new Date(row.created_at).toLocaleString(undefined, {
                dateStyle: "medium",
                timeStyle: "short",
              })}
            </time>
          </div>
          {row.candidate_name ? (
            <p className="mt-2 font-medium text-stone-900">{row.candidate_name}</p>
          ) : null}
          {row.candidate_email ? (
            <p className="mt-0.5 font-mono text-xs text-stone-600">{row.candidate_email}</p>
          ) : null}
          <p className="mt-2 font-mono text-xs">
            <a
              href={row.candidate_linkedin_url}
              className="text-amber-900 hover:underline"
              target="_blank"
              rel="noreferrer"
            >
              {row.candidate_linkedin_url}
            </a>
          </p>
          {rel ? <p className="mt-2 text-xs text-stone-600">Relationship: {rel}</p> : null}
          <p className="mt-2 text-stone-700">{row.fit_description}</p>
          <ReferralResponseForm
            referralId={row.id}
            referralStage={row.referral_stage}
            reasonPreset={row.company_reason_preset}
            reasonNote={row.company_reason_note}
            respondedAt={row.company_responded_at}
          />
        </div>
      ) : null}
    </li>
  );
}
