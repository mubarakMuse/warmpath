"use client";

import { useActionState } from "react";
import { updateRole, type UpdateRoleState } from "@/app/actions/roles";

const initial: UpdateRoleState = {};

const input =
  "min-h-11 w-full rounded-lg border border-stone-200 bg-white px-3 text-stone-900 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20";
const label = "flex flex-col gap-1.5 text-sm font-medium text-warm-ink";

type RoleSlice = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  match_bonus: string | null;
};

export function EditRoleForm({ role }: { role: RoleSlice }) {
  const [state, action, pending] = useActionState(updateRole, initial);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="role_id" value={role.id} />
      <label className={label}>
        Role title
        <input name="title" required defaultValue={role.title} className={input} />
      </label>
      <label className={label}>
        Location (optional)
        <input name="location" defaultValue={role.location ?? ""} className={input} placeholder="Remote · US" />
      </label>
      <label className={label}>
        Referral bonus — USD (optional)
        <input
          name="match_bonus"
          defaultValue={role.match_bonus ?? ""}
          className={input}
          placeholder="$5,000 USD on hire"
        />
        <span className="text-xs font-normal text-warm-muted">
          Shown on the public page. Use a <strong className="font-medium text-warm-ink">$</strong> amount
          (e.g. $5,000 USD). If you type only numbers, we add <strong className="font-medium text-warm-ink">$</strong>{" "}
          for you.
        </span>
      </label>
      <label className={label}>
        Description (optional)
        <textarea
          name="description"
          rows={5}
          defaultValue={role.description ?? ""}
          className="rounded-lg border border-stone-200 bg-white px-3 py-2 text-stone-900 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
          placeholder="What you’re looking for"
        />
      </label>
      {state.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {state.ok ? (
        <p className="text-sm text-emerald-800" role="status">
          Saved. Public page updated.
        </p>
      ) : null}
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-lg bg-stone-800 px-5 text-sm font-semibold text-white hover:bg-stone-700 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save changes"}
      </button>
    </form>
  );
}
