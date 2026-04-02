"use client";

import { useActionState, useState } from "react";
import { submitApplication, type SubmitState } from "@/app/actions/submit";
import { LINKEDIN_OPEN_MY_PROFILE, linkedInPeopleSearchUrl } from "@/lib/linkedin";
import { RoleApplyAuthGate } from "@/components/role-apply-auth-gate";

const initial: SubmitState = {};

type Props = {
  roleId: string;
  roleTitle: string;
  panelTitle: string;
  matchBonus?: string | null;
  accepting: boolean;
  /** When set, user is signed in; email comes from the session (not the form). */
  submitterEmail: string | null;
  returnPath: string;
  /** Shown after success (e.g. connector activity dashboard). */
  activityDashboardHref?: string | null;
};

function OutLink({
  href,
  children,
  className = "",
}: {
  href: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className={className}>
      {children}
    </a>
  );
}

function IconSpark() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z"
      />
    </svg>
  );
}

function IconUser() {
  return (
    <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} aria-hidden>
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z"
      />
    </svg>
  );
}

function IconChevron() {
  return (
    <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}

function LinkedInMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}

export function ApplyForm({
  roleId,
  roleTitle,
  panelTitle,
  matchBonus,
  accepting,
  submitterEmail,
  returnPath,
  activityDashboardHref,
}: Props) {
  const [kind, setKind] = useState<"self" | "referral" | null>(null);
  const [state, action, pending] = useActionState(submitApplication, initial);

  const peopleSearchUrl = linkedInPeopleSearchUrl(roleTitle);
  const bonusShort = matchBonus?.trim() || null;

  if (!accepting) {
    return (
      <p className="rounded-2xl border border-stone-200 bg-stone-50 px-4 py-4 text-sm leading-relaxed text-warm-muted">
        This role isn’t accepting new responses right now. If you already submitted, the team may
        still follow up.
      </p>
    );
  }

  if (!submitterEmail) {
    return <RoleApplyAuthGate returnPath={returnPath} />;
  }

  if (state.ok) {
    return (
      <div
        className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-5 text-sm text-emerald-900 shadow-sm"
        role="status"
      >
        <p>
          Thanks—your response was submitted for <strong>{roleTitle}</strong>. The hiring team will
          follow up if there’s a fit.
        </p>
        {activityDashboardHref ? (
          <p className="mt-3">
            <a
              href={activityDashboardHref}
              className="font-semibold text-warm-accent underline hover:text-warm-accent-hover"
            >
              View your activity
            </a>
          </p>
        ) : null}
      </div>
    );
  }

  const inputPanel =
    "min-h-11 w-full rounded-xl border border-stone-200 bg-white px-3 text-stone-900 shadow-sm outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/25";
  const labelPanel = "flex flex-col gap-1.5 text-sm font-medium text-warm-ink";

  const actionRow =
    "group flex w-full items-center gap-4 rounded-2xl border border-stone-200 bg-white p-4 text-left shadow-sm transition hover:border-warm-accent/50 hover:shadow-md focus-visible:outline focus-visible:ring-2 focus-visible:ring-warm-accent/30";

  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold tracking-tight text-warm-ink sm:text-xl">{panelTitle}</h2>

      {kind === null ? (
        <div className="space-y-3">
          <button type="button" className={actionRow} onClick={() => setKind("referral")}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-warm-accent">
              <IconSpark />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-warm-ink">I know a potential fit</span>
                {bonusShort ? (
                  <span className="rounded-full bg-stone-100 px-2.5 py-0.5 text-xs font-bold text-warm-ink">
                    {bonusShort.length > 28 ? `${bonusShort.slice(0, 28)}…` : bonusShort}
                  </span>
                ) : null}
              </div>
              <p className="mt-0.5 text-xs text-warm-muted">
                Suggest someone from your network with a short note on why they fit.
              </p>
            </div>
            <span className="text-stone-300 group-hover:text-warm-accent">
              <IconChevron />
            </span>
          </button>

          <button type="button" className={actionRow} onClick={() => setKind("self")}>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-warm-accent">
              <IconUser />
            </div>
            <div className="min-w-0 flex-1">
              <span className="font-semibold text-warm-ink">I&apos;m interested</span>
              <p className="mt-0.5 text-xs text-warm-muted">Suggest yourself as a candidate.</p>
            </div>
            <span className="text-stone-300 group-hover:text-warm-accent">
              <IconChevron />
            </span>
          </button>

          <OutLink
            href={peopleSearchUrl}
            className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-warm-accent bg-warm-accent px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-warm-accent-hover"
          >
            <LinkedInMark className="h-5 w-5" />
            See ideas from my LinkedIn network
          </OutLink>

          <p className="text-center text-xs text-warm-muted">
            Uses this job title as the search keyword with a 1st-degree filter. Opens LinkedIn in a
            new tab.
          </p>

          <p className="text-center text-xs text-warm-muted/90">
            Referral bonuses are set by the hiring team and paid outside Warmpath unless you agree
            otherwise with them.
          </p>
        </div>
      ) : (
        <form action={action} className="space-y-5">
          <input type="hidden" name="role_id" value={roleId} />
          <input type="hidden" name="kind" value={kind} />

          <button
            type="button"
            onClick={() => setKind(null)}
            className="text-sm font-medium text-warm-muted hover:text-warm-accent"
          >
            ← Back to options
          </button>

          <p className="rounded-xl border border-stone-200 bg-stone-50 px-3 py-2 text-xs text-warm-muted">
            Submitting as <span className="font-mono font-medium text-warm-ink">{submitterEmail}</span>
            . To use another address, log out and sign in again.
          </p>

          {kind === "self" ? (
            <>
              <label className={labelPanel}>
                Your name
                <input name="submitter_name" required autoComplete="name" className={inputPanel} />
              </label>
              <label className={labelPanel}>
                LinkedIn URL (optional)
                <input
                  type="url"
                  name="self_linkedin_url"
                  placeholder="https://linkedin.com/in/…"
                  className={inputPanel}
                />
                <span className="text-xs font-normal text-warm-muted">
                  <OutLink href={LINKEDIN_OPEN_MY_PROFILE} className="font-medium text-warm-accent hover:underline">
                    Open your LinkedIn profile
                  </OutLink>{" "}
                  (new tab)
                </span>
              </label>
              <label className={labelPanel}>
                Why you’re a fit (optional)
                <textarea
                  name="self_pitch"
                  rows={4}
                  placeholder="A few sentences on relevant experience."
                  className={`${inputPanel} py-2`}
                />
              </label>
            </>
          ) : (
            <>
              <p className="text-xs text-warm-muted">
                <OutLink href={peopleSearchUrl} className="font-medium text-warm-accent hover:underline">
                  Search LinkedIn (1st-degree) using this role title
                </OutLink>
              </p>
              <label className={labelPanel}>
                Candidate name
                <input name="candidate_name" required className={inputPanel} placeholder="Full name" />
              </label>
              <label className={labelPanel}>
                Their email (optional)
                <input
                  name="candidate_email"
                  type="email"
                  autoComplete="email"
                  className={inputPanel}
                  placeholder="so they can see this intro on Warmpath"
                />
                <span className="text-xs font-normal text-warm-muted">
                  If they sign in with this address, it appears under &quot;Jobs you were referred
                  to&quot; on their dashboard.
                </span>
              </label>
              <label className={labelPanel}>
                Why they’re a strong fit
                <textarea
                  name="why_fit"
                  required
                  rows={4}
                  placeholder="Strengths, scope they’ve owned, culture fit…"
                  className={`${inputPanel} py-2`}
                />
              </label>
              <label className={labelPanel}>
                How you know them
                <input
                  name="relationship"
                  required
                  className={inputPanel}
                  placeholder="e.g. Worked together at Acme"
                />
              </label>
              <label className={labelPanel}>
                Their LinkedIn URL (optional)
                <input
                  type="url"
                  name="candidate_linkedin_url"
                  placeholder="https://linkedin.com/in/…"
                  className={inputPanel}
                />
              </label>
            </>
          )}

          {state.error ? (
            <p className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
              {state.error}
            </p>
          ) : null}

          <button
            type="submit"
            disabled={pending}
            className="inline-flex min-h-12 w-full items-center justify-center rounded-2xl bg-warm-accent px-5 text-sm font-bold text-white shadow-sm transition hover:bg-warm-accent-hover disabled:opacity-60"
          >
            {pending ? "Submitting…" : "Submit"}
          </button>
        </form>
      )}
    </div>
  );
}
