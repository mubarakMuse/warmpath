"use client";

import { useActionState } from "react";
import { createRole, type CreateRoleState } from "@/app/actions/roles";

const initial: CreateRoleState = {};

export function CreateRoleForm({
  companies,
  defaultCompanyId,
}: {
  companies: { id: string; name: string; is_primary: boolean }[];
  defaultCompanyId: string;
}) {
  const [state, action, pending] = useActionState(createRole, initial);

  const input =
    "min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-stone-900 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20";
  const label = "flex flex-col gap-1.5 text-sm font-medium text-warm-ink";

  return (
    <form action={action} className="mx-auto max-w-xl space-y-5">
      <p className="rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-warm-muted">
        You’ll be the <strong className="text-warm-ink">hiring manager</strong> on this role.
      </p>

      {companies.length > 0 ? (
        <label className={label}>
          Organization
          <select name="company_id" defaultValue={defaultCompanyId} className={input}>
            <option value="">Use primary organization (default)</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
                {c.is_primary ? " · primary" : ""}
              </option>
            ))}
          </select>
          <span className="text-xs font-normal text-warm-muted">
            Public page uses this company’s name, logo, and links.
          </span>
        </label>
      ) : null}

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
          <strong className="font-medium text-warm-ink">$</strong> prefix.
        </span>
      </label>
      <label className={label}>
        What you’re looking for (optional)
        <textarea
          name="description"
          rows={6}
          placeholder={"Scope, stack, seniority, team size.\n\nUse a blank line between paragraphs.\nSingle line breaks are kept on the public page."}
          className="rounded-lg border border-stone-200 bg-white px-3 py-2 font-sans text-sm text-stone-900 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
        />
        <span className="text-xs font-normal text-warm-muted">
          Tip: press Enter twice between paragraphs; one Enter starts a new line inside the same block.
        </span>
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
        {pending ? "Creating…" : "Create role"}
      </button>
    </form>
  );
}
