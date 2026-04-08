"use client";

import { useActionState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { companyUpdateReferralResponse, type CompanyFormState } from "@/app/actions/company";
import { REASON_PRESETS, REFERRAL_STAGES, referralStageLabel } from "@/lib/referral-response";

const initial: CompanyFormState = {};

const selectClass =
  "min-h-9 w-full rounded-lg border border-stone-200 bg-white px-2 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20";

function stageBadgeClass(stage: string): string {
  switch (stage) {
    case "rejected":
      return "bg-red-100 text-red-900";
    case "hired":
      return "bg-emerald-100 text-emerald-900";
    case "offer":
      return "bg-violet-100 text-violet-900";
    case "interviewing":
      return "bg-sky-100 text-sky-900";
    case "reviewing":
      return "bg-amber-100 text-amber-900";
    default:
      return "bg-stone-100 text-stone-700";
  }
}

export function ReferralResponseForm({
  referralId,
  referralStage,
  reasonPreset,
  reasonNote,
  respondedAt,
}: {
  referralId: string;
  referralStage: string;
  reasonPreset: string | null;
  reasonNote: string | null;
  respondedAt: string | null;
}) {
  const [state, action, pending] = useActionState(companyUpdateReferralResponse, initial);
  const router = useRouter();

  useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.ok && state.message) {
      toast.success(state.message);
      router.refresh();
    }
  }, [state, router]);

  return (
    <form action={action} className="mt-4 space-y-3 border-t border-stone-100 pt-4">
      <input type="hidden" name="referral_id" value={referralId} />
      <div className="flex flex-wrap items-center gap-2">
        <span
          className={`inline-flex rounded-full px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${stageBadgeClass(referralStage)}`}
        >
          {referralStageLabel(referralStage)}
        </span>
        {respondedAt ? (
          <span className="text-[11px] text-stone-400">
            Updated{" "}
            {new Date(respondedAt).toLocaleString(undefined, {
              dateStyle: "medium",
              timeStyle: "short",
            })}
          </span>
        ) : null}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-medium text-stone-600">
          Stage
          <select name="referral_stage" className={`${selectClass} mt-1`} defaultValue={referralStage}>
            {REFERRAL_STAGES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-xs font-medium text-stone-600">
          Reason (preset)
          <select
            name="company_reason_preset"
            className={`${selectClass} mt-1`}
            defaultValue={reasonPreset ?? ""}
          >
            {REASON_PRESETS.map((p) => (
              <option key={p.value || "none"} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="block text-xs font-medium text-stone-600">
        Notes (optional; use for “Other” or extra detail)
        <textarea
          name="company_reason_note"
          rows={2}
          className="mt-1 min-h-[4rem] w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
          defaultValue={reasonNote ?? ""}
          placeholder="Free-text context for the connector…"
        />
      </label>
      <p className="text-[11px] text-stone-500">
        If you mark this as <span className="font-medium">Rejected</span>, choose a preset or add a short note so
        the connector understands why.
      </p>
      <button
        type="submit"
        disabled={pending}
        className="rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save response"}
      </button>
    </form>
  );
}
