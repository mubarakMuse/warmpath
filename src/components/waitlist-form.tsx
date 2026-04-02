"use client";

import { useActionState } from "react";
import { joinWaitlist, type WaitlistState } from "@/app/actions/waitlist";

const initial: WaitlistState = {};

type Props = {
  variant?: "hero" | "footer";
};

export function WaitlistForm({ variant = "hero" }: Props) {
  const [state, formAction, pending] = useActionState(joinWaitlist, initial);

  if (state.ok) {
    return (
      <p
        className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-900"
        role="status"
      >
        You’re on the list. We’ll be in touch soon.
      </p>
    );
  }

  const inputClass =
    variant === "hero"
      ? "min-h-12 w-full min-w-0 rounded-xl border border-stone-200 bg-white px-4 text-stone-900 shadow-sm outline-none ring-warm-accent/20 placeholder:text-stone-400 focus:border-warm-accent focus:ring-2"
      : "min-h-11 w-full min-w-0 rounded-lg border border-stone-300 bg-white px-3 text-sm text-stone-900 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20";

  return (
    <form action={formAction} className="flex w-full max-w-md flex-col gap-3 sm:flex-row sm:items-start">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <label htmlFor={`email-${variant}`} className="sr-only">
          Email
        </label>
        <input
          id={`email-${variant}`}
          name="email"
          type="email"
          autoComplete="email"
          required
          placeholder="you@company.com"
          className={inputClass}
        />
        <label htmlFor={`referrer-${variant}`} className="sr-only">
          Referrer (optional)
        </label>
        <input
          id={`referrer-${variant}`}
          name="referrer"
          type="text"
          maxLength={200}
          placeholder="Referred by (optional)"
          className={
            variant === "hero"
              ? "min-h-10 w-full rounded-xl border border-stone-200 bg-white/80 px-4 text-sm text-stone-800 outline-none placeholder:text-stone-400 focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
              : "hidden"
          }
        />
        {state.error ? (
          <p className="text-sm text-red-700" role="alert">
            {state.error}
          </p>
        ) : null}
      </div>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-12 shrink-0 items-center justify-center rounded-xl bg-warm-accent px-6 text-sm font-semibold text-white shadow-sm transition hover:bg-warm-accent-hover disabled:opacity-60"
      >
        {pending ? "Sending…" : "Request access"}
      </button>
    </form>
  );
}
