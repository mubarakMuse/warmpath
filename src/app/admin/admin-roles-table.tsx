"use client";

import { Fragment, useActionState, useState } from "react";
import Link from "next/link";
import { adminUpdateRoleProvisioning, type AdminFormState } from "@/app/actions/admin";

const initial: AdminFormState = {};

const input =
  "min-h-9 w-full rounded-lg border border-stone-200 bg-white px-2.5 text-sm text-stone-900 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20";
const btn =
  "rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50";
const btnGhost = `${btn} border border-stone-200 bg-white text-warm-ink hover:bg-stone-50`;
const btnPrimary = `${btn} bg-warm-accent text-white hover:bg-warm-accent-hover`;

export type AdminRoleRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  hirer_id: string | null;
  hirer_label: string | null;
  company_id: string | null;
  company_name: string | null;
};

type CompanyOpt = { id: string; name: string; slug: string };
type HirerOpt = { id: string; email: string; full_name: string };

const STATUS_OPTIONS = [
  "draft",
  "getting_started",
  "sourcing",
  "screening",
  "interviewing",
  "offer",
  "hired",
  "on_hold",
  "closed",
] as const;

function FormFlash({ state }: { state: AdminFormState }) {
  if (state.error) {
    return (
      <p className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">
        {state.error}
      </p>
    );
  }
  if (state.ok && state.message) {
    return (
      <p
        className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900"
        role="status"
      >
        {state.message}
      </p>
    );
  }
  return null;
}

export function AdminRolesTable({
  roles,
  companies,
  hirers,
}: {
  roles: AdminRoleRow[];
  companies: CompanyOpt[];
  hirers: HirerOpt[];
}) {
  const [uState, uAction, uPending] = useActionState(adminUpdateRoleProvisioning, initial);
  const [editId, setEditId] = useState<string | null>(null);

  if (roles.length === 0) {
    return (
      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-serif text-xl font-semibold text-warm-ink">Edit roles</h2>
        <p className="mt-1 text-sm text-warm-muted">No roles yet. Create one below.</p>
      </section>
    );
  }

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="font-serif text-xl font-semibold text-warm-ink">Edit roles</h2>
      <p className="mt-1 text-sm text-warm-muted">
        Assign or change the <strong>hiring manager</strong> and <strong>company</strong> on any role, and
        adjust pipeline status. Unassigning a hiring manager forces <span className="font-mono text-xs">draft</span>{" "}
        (public page hides until someone is assigned and status is not draft).
      </p>
      <FormFlash state={uState} />
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="border-b border-stone-200 text-xs font-semibold uppercase tracking-wide text-warm-muted">
            <tr>
              <th className="py-3 pr-4">Role</th>
              <th className="py-3 pr-4">Status</th>
              <th className="py-3 pr-4">Hiring manager</th>
              <th className="py-3 pr-4">Company</th>
              <th className="py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {roles.map((r) => (
              <Fragment key={r.id}>
                <tr className="align-middle">
                  <td className="py-3 pr-4">
                    <p className="font-medium text-warm-ink">{r.title}</p>
                    <p className="mt-0.5 font-mono text-xs text-stone-500">/r/{r.slug}</p>
                    <Link
                      href={`/r/${r.slug}`}
                      className="mt-1 inline-block text-xs font-semibold text-warm-accent hover:underline"
                    >
                      Public page →
                    </Link>
                  </td>
                  <td className="py-3 pr-4 capitalize text-warm-muted">{r.status.replace(/_/g, " ")}</td>
                  <td className="max-w-[200px] py-3 pr-4 text-warm-muted">
                    {r.hirer_label ?? <span className="text-stone-400">— unassigned —</span>}
                  </td>
                  <td className="max-w-[180px] py-3 pr-4 text-warm-muted">
                    {r.company_name ?? "—"}
                  </td>
                  <td className="py-3 text-right">
                    <button
                      type="button"
                      className={btnGhost}
                      onClick={() => setEditId(editId === r.id ? null : r.id)}
                    >
                      {editId === r.id ? "Cancel" : "Edit"}
                    </button>
                  </td>
                </tr>
                {editId === r.id ? (
                  <tr>
                    <td colSpan={5} className="bg-amber-50/50 px-4 py-4">
                      <form action={uAction} className="grid max-w-xl gap-3">
                        <input type="hidden" name="role_id" value={r.id} />
                        <label className="flex flex-col gap-1 text-xs font-medium text-warm-ink">
                          Hiring manager
                          <select
                            name="hirer_id"
                            className={input}
                            defaultValue={r.hirer_id ?? ""}
                          >
                            <option value="">— Unassigned (saves as draft) —</option>
                            {hirers.map((h) => (
                              <option key={h.id} value={h.id}>
                                {h.full_name} ({h.email})
                              </option>
                            ))}
                          </select>
                        </label>
                        <label className="flex flex-col gap-1 text-xs font-medium text-warm-ink">
                          Company on this role
                          <select
                            name="role_company_id"
                            className={input}
                            defaultValue={r.company_id ?? ""}
                          >
                            <option value="">— Use hiring manager’s primary company —</option>
                            {companies.map((c) => (
                              <option key={c.id} value={c.id}>
                                {c.name} ({c.slug})
                              </option>
                            ))}
                          </select>
                          <span className="font-normal text-warm-muted">
                            Leave blank to keep this role’s current company if the hiring manager is linked to
                            that org; otherwise their primary company is used. Picking a company requires that
                            link on the hiring manager’s profile.
                          </span>
                        </label>
                        <label className="flex flex-col gap-1 text-xs font-medium text-warm-ink">
                          Pipeline status
                          <select name="status" className={input} defaultValue={r.status}>
                            {STATUS_OPTIONS.map((s) => (
                              <option key={s} value={s}>
                                {s.replace(/_/g, " ")}
                              </option>
                            ))}
                          </select>
                          <span className="font-normal text-warm-muted">
                            Ignored when hiring manager is unassigned (role becomes draft).
                          </span>
                        </label>
                        <button type="submit" disabled={uPending} className={`${btnPrimary} w-fit`}>
                          {uPending ? "Saving…" : "Save role"}
                        </button>
                      </form>
                    </td>
                  </tr>
                ) : null}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
