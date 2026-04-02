"use client";

import { useActionState } from "react";
import { updateHirerProfile, type ProfileSettingsState } from "@/app/actions/profile";

const initial: ProfileSettingsState = {};

type Props = {
  defaults: {
    full_name: string;
    email: string;
    linkedin_url: string | null;
    avatar_url: string | null;
    company_name: string | null;
    company_website: string | null;
    company_linkedin_url: string | null;
    company_logo_url: string | null;
  };
};

export function HirerSettingsForm({ defaults }: Props) {
  const [state, action, pending] = useActionState(updateHirerProfile, initial);

  const input =
    "min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-stone-900 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20";
  const label = "flex flex-col gap-1.5 text-sm font-medium text-warm-ink";

  return (
    <form action={action} className="mx-auto max-w-xl space-y-6">
      {state.ok ? (
        <p
          className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
          role="status"
        >
          Saved. Open role pages now show this info (existing roles updated too).
        </p>
      ) : null}

      <label className={label}>
        Work email
        <input type="text" readOnly value={defaults.email} className={`${input} bg-stone-50`} />
        <span className="text-xs font-normal text-warm-muted">Contact support to change email.</span>
      </label>

      <label className={label}>
        Your name
        <input name="full_name" required defaultValue={defaults.full_name} className={input} />
      </label>

      <label className={label}>
        Your LinkedIn profile URL
        <input
          name="linkedin_url"
          type="url"
          defaultValue={defaults.linkedin_url ?? ""}
          placeholder="https://www.linkedin.com/in/yourname"
          className={input}
        />
      </label>

      <label className={label}>
        Profile photo URL (optional)
        <input
          name="avatar_url"
          type="url"
          defaultValue={defaults.avatar_url ?? ""}
          placeholder="Image URL from your LinkedIn profile (right-click → copy image address)"
          className={input}
        />
        <span className="text-xs font-normal text-warm-muted">
          LinkedIn image links can expire; re-paste if a photo stops loading.
        </span>
      </label>

      <div className="border-t border-stone-200 pt-6">
        <h2 className="text-sm font-semibold text-warm-ink">Company</h2>
        <p className="mt-1 text-xs text-warm-muted">
          Shown on every public role page so referrers know who they’re helping hire.
        </p>
      </div>

      <label className={label}>
        Company name
        <input
          name="company_name"
          defaultValue={defaults.company_name ?? ""}
          placeholder="Acme Inc."
          className={input}
        />
      </label>

      <label className={label}>
        Company website
        <input
          name="company_website"
          type="url"
          defaultValue={defaults.company_website ?? ""}
          placeholder="https://acme.com"
          className={input}
        />
      </label>

      <label className={label}>
        Company LinkedIn page
        <input
          name="company_linkedin_url"
          type="url"
          defaultValue={defaults.company_linkedin_url ?? ""}
          placeholder="https://www.linkedin.com/company/…"
          className={input}
        />
      </label>

      <label className={label}>
        Company logo image URL (optional)
        <input
          name="company_logo_url"
          type="url"
          defaultValue={defaults.company_logo_url ?? ""}
          placeholder="From your company LinkedIn page"
          className={input}
        />
      </label>

      {state.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-warm-accent px-5 text-sm font-semibold text-white hover:bg-warm-accent-hover disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
