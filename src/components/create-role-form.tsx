"use client";

import { useActionState } from "react";
import { createRole, type CreateRoleState } from "@/app/actions/roles";

const initial: CreateRoleState = {};

export function CreateRoleForm() {
  const [state, action, pending] = useActionState(createRole, initial);

  const input =
    "min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-stone-900 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20";
  const label = "flex flex-col gap-1.5 text-sm font-medium text-warm-ink";

  return (
    <form action={action} className="mx-auto max-w-xl space-y-5">
      <label className={label}>
        Role title
        <input
          name="title"
          required
          placeholder="Senior Product Designer"
          className={input}
        />
      </label>
      <label className={label}>
        Location (optional)
        <input
          name="location"
          placeholder="Remote · US · or San Francisco hybrid"
          className={input}
        />
      </label>
      <label className={label}>
        Referral bonus — USD (optional)
        <input
          name="match_bonus"
          placeholder="$5,000 USD on hire"
          className={input}
        />
        <span className="text-xs font-normal text-warm-muted">
          Use a <strong className="font-medium text-warm-ink">$</strong> amount. Bare numbers get a{" "}
          <strong className="font-medium text-warm-ink">$</strong> prefix. Payouts are outside Warmpath.
        </span>
      </label>
      <label className={label}>
        What you’re looking for (optional)
        <textarea
          name="description"
          rows={5}
          placeholder="Scope, stack, level—whatever helps people refer well."
          className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-900 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
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
        {pending ? "Creating…" : "Create role & view link"}
      </button>
    </form>
  );
}
