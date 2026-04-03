"use client";

import { useActionState, useId, useState } from "react";
import { updateRole, type UpdateRoleState } from "@/app/actions/roles";

const initial: UpdateRoleState = {};

const input =
  "min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm text-stone-900 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20";
const label = "flex flex-col gap-1 text-xs font-medium text-warm-ink";

export type RoleEditModalRole = {
  id: string;
  title: string;
  description: string | null;
  location: string | null;
  match_bonus: string | null;
  company_id: string | null;
  hirer_id: string | null;
};

type CompanyOpt = { id: string; name: string };

type HirerOpt = { id: string; label: string };

export function RoleEditModal({
  role,
  companyOptions,
  hirerOptions,
  isAdmin,
}: {
  role: RoleEditModalRole;
  companyOptions: CompanyOpt[];
  hirerOptions: HirerOpt[];
  isAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(updateRole, initial);
  const titleId = useId();

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex min-h-9 items-center justify-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-semibold text-warm-ink shadow-sm hover:border-warm-accent/50 hover:bg-stone-50"
      >
        Edit details
      </button>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center"
          role="presentation"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-2xl border border-stone-200 bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 border-b border-stone-100 pb-3">
              <h2 id={titleId} className="font-serif text-lg font-semibold text-warm-ink">
                Edit role
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-lg px-2 py-1 text-sm text-warm-muted hover:bg-stone-100 hover:text-warm-ink"
              >
                Close
              </button>
            </div>

            <form action={action} className="mt-4 space-y-3">
              <input type="hidden" name="role_id" value={role.id} />
              {isAdmin ? (
                <label className={label}>
                  Hiring manager
                  <select
                    name="hirer_id"
                    key={`${role.id}-${role.hirer_id ?? "none"}`}
                    defaultValue={role.hirer_id ?? ""}
                    className={input}
                  >
                    <option value="">— Unassigned (draft) —</option>
                    {hirerOptions.map((h) => (
                      <option key={h.id} value={h.id}>
                        {h.label}
                      </option>
                    ))}
                  </select>
                </label>
              ) : null}

              <label className={label}>
                Organization
                <select
                  name="company_id"
                  key={`${role.id}-${role.company_id ?? "none"}`}
                  defaultValue={role.company_id ?? ""}
                  className={input}
                >
                  <option value="">No organization on this role</option>
                  {companyOptions.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className={label}>
                Role title
                <input name="title" required defaultValue={role.title} className={input} />
              </label>
              <label className={label}>
                Location (optional)
                <input name="location" defaultValue={role.location ?? ""} className={input} />
              </label>
              <label className={label}>
                Referral bonus (optional)
                <input name="match_bonus" defaultValue={role.match_bonus ?? ""} className={input} />
              </label>
              <label className={label}>
                Description (optional)
                <textarea
                  name="description"
                  rows={5}
                  defaultValue={role.description ?? ""}
                  className={`${input} py-2 font-sans`}
                  placeholder={"Paragraph one…\n\nParagraph two (blank line between)."}
                />
                <span className="font-normal text-warm-muted">
                  Blank line = new paragraph. Single line break = kept on the public page.
                </span>
              </label>

              {state.error ? (
                <p className="text-sm text-red-700" role="alert">
                  {state.error}
                </p>
              ) : null}
              {state.ok ? (
                <p className="text-sm text-emerald-800" role="status">
                  Saved. You can close this window.
                </p>
              ) : null}

              <div className="flex flex-wrap gap-2 pt-2">
                <button
                  type="submit"
                  disabled={pending}
                  className="inline-flex min-h-10 items-center justify-center rounded-lg bg-warm-accent px-4 text-sm font-semibold text-white hover:bg-warm-accent-hover disabled:opacity-60"
                >
                  {pending ? "Saving…" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex min-h-10 items-center justify-center rounded-lg border border-stone-200 px-4 text-sm font-medium text-warm-muted hover:bg-stone-50"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </>
  );
}
