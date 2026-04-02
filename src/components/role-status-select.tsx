"use client";

import { useActionState } from "react";
import { updateRoleStatus, type RoleStatusState } from "@/app/actions/role-status";
import { ROLE_STATUSES, ROLE_STATUS_LABELS, type RoleStatus } from "@/lib/role-status";

const initial: RoleStatusState = {};

type Props = {
  roleId: string;
  slug: string;
  current: RoleStatus;
};

export function RoleStatusSelect({ roleId, slug, current }: Props) {
  const [state, formAction, pending] = useActionState(updateRoleStatus, initial);

  return (
    <form action={formAction} className="max-w-md space-y-2">
      <input type="hidden" name="role_id" value={roleId} />
      <input type="hidden" name="slug" value={slug} />
      <label className="flex flex-col gap-1.5 text-sm font-medium text-warm-ink">
        Hiring stage
        <select
          key={current}
          name="status"
          defaultValue={current}
          disabled={pending}
          onChange={(e) => {
            e.currentTarget.form?.requestSubmit();
          }}
          className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-stone-900 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20 disabled:opacity-60"
        >
          {ROLE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {ROLE_STATUS_LABELS[s]}
            </option>
          ))}
        </select>
      </label>
      {state.error ? (
        <p className="text-sm text-red-700" role="alert">
          {state.error}
        </p>
      ) : null}
      {pending ? (
        <p className="text-xs text-warm-muted" aria-live="polite">
          Updating…
        </p>
      ) : null}
    </form>
  );
}
