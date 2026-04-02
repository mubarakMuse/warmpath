"use client";

import { useActionState } from "react";
import {
  adminAssignHirerToRole,
  adminAssignProfileToCompany,
  adminCreateCompany,
  adminCreateRole,
  type AdminFormState,
} from "@/app/actions/admin";

const companyInitial: AdminFormState = {};
const assignCompanyInitial: AdminFormState = {};
const assignInitial: AdminFormState = {};

type CompanyRow = { id: string; name: string; slug: string };
type HirerRow = { id: string; email: string; full_name: string };
type UnassignedRoleRow = { id: string; title: string; slug: string };

export function AdminClient({
  companies,
  hirers,
  unassignedRoles,
  roleError,
}: {
  companies: CompanyRow[];
  hirers: HirerRow[];
  unassignedRoles: UnassignedRoleRow[];
  roleError: string | null;
}) {
  const [cState, cAction, cPending] = useActionState(adminCreateCompany, companyInitial);
  const [coState, coAction, coPending] = useActionState(
    adminAssignProfileToCompany,
    assignCompanyInitial,
  );
  const [aState, aAction, aPending] = useActionState(adminAssignHirerToRole, assignInitial);

  return (
    <div className="space-y-16">
      <section>
        <h2 className="font-serif text-xl font-semibold text-warm-ink">Create company</h2>
        <p className="mt-1 text-sm text-warm-muted">
          Organizations you link to hiring managers and to unassigned roles (branding on the public
          role page).
        </p>
        <form action={cAction} className="mt-6 grid max-w-lg gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-warm-ink">Name</span>
            <input
              name="name"
              required
              className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-warm-ink">Slug (optional)</span>
            <input
              name="slug"
              placeholder="auto from name"
              className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-warm-ink">Website</span>
            <input
              name="website"
              type="url"
              placeholder="https://"
              className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-warm-ink">LinkedIn URL</span>
            <input
              name="linkedin_url"
              className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-warm-ink">Logo URL</span>
            <input
              name="logo_url"
              type="url"
              placeholder="https://"
              className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
            />
          </label>
          {cState.error ? (
            <p className="text-sm text-red-700" role="alert">
              {cState.error}
            </p>
          ) : null}
          {cState.ok && cState.message ? (
            <p className="text-sm text-green-800" role="status">
              {cState.message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={cPending}
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-lg bg-warm-accent px-5 text-sm font-semibold text-white hover:bg-warm-accent-hover disabled:opacity-60"
          >
            {cPending ? "Saving…" : "Create company"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold text-warm-ink">Set hiring manager primary company</h2>
        <p className="mt-1 text-sm text-warm-muted">
          After someone signs up at{" "}
          <strong className="font-medium text-warm-ink">/hire/sign-up</strong>, link them to an
          organization. This sets their <strong>primary</strong> company (default for new roles). Each role
          still has its own <span className="font-mono text-xs">company_id</span>—change a role if they hire
          for a different org. Saving here does not rewrite company on existing roles.
        </p>
        <form action={coAction} className="mt-6 grid max-w-lg gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-warm-ink">Hiring manager</span>
            <select
              name="profile_id"
              required
              className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
            >
              <option value="">— Select —</option>
              {hirers.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.full_name} ({h.email})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-warm-ink">Company</span>
            <select
              name="company_id"
              className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
            >
              <option value="">— Clear company —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.slug})
                </option>
              ))}
            </select>
          </label>
          {coState.error ? (
            <p className="text-sm text-red-700" role="alert">
              {coState.error}
            </p>
          ) : null}
          {coState.ok && coState.message ? (
            <p className="text-sm text-green-800" role="status">
              {coState.message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={coPending}
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-lg bg-warm-accent px-5 text-sm font-semibold text-white hover:bg-warm-accent-hover disabled:opacity-60"
          >
            {coPending ? "Saving…" : "Save assignment"}
          </button>
        </form>
      </section>

      <section>
        <h2 className="font-serif text-xl font-semibold text-warm-ink">Create role</h2>
        <p className="mt-1 text-sm text-warm-muted">
          Leave hiring manager empty to create a <strong>draft</strong> role first; assign someone
          after they sign up. If you pick a hirer, you can set status and you’ll jump to their hiring
          view.
        </p>
        {roleError ? (
          <p className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
            {roleError}
          </p>
        ) : null}
        <form action={adminCreateRole} className="mt-6 grid max-w-lg gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-warm-ink">Hiring manager (optional)</span>
            <select
              name="hirer_id"
              className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
            >
              <option value="">— Unassigned (draft) —</option>
              {hirers.map((h) => (
                <option key={h.id} value={h.id}>
                  {h.full_name} ({h.email})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-warm-ink">Company on role (if unassigned)</span>
            <select
              name="role_company_id"
              className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
            >
              <option value="">— None —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
            <span className="text-xs font-normal text-warm-muted">
              When a hiring manager is selected: optional override for which org this job belongs to (they
              must already be linked to that company). Leave blank to use their primary company. When no
              hirer: branding for the draft role only.
            </span>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-warm-ink">Title</span>
            <input
              name="title"
              required
              className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-warm-ink">Description</span>
            <textarea
              name="description"
              rows={4}
              className="rounded-lg border border-stone-200 bg-white px-3 py-2 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-warm-ink">Location</span>
            <input
              name="location"
              className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-warm-ink">Referral bonus — USD (optional)</span>
            <input
              name="match_bonus"
              placeholder="$5,000 USD on hire"
              className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-warm-ink">Initial status (only if hiring manager selected)</span>
            <select
              name="status"
              className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
            >
              <option value="draft">draft (not public)</option>
              <option value="getting_started">getting_started (public)</option>
              <option value="sourcing">sourcing</option>
              <option value="closed">closed</option>
            </select>
            <span className="text-xs font-normal text-warm-muted">
              Unassigned roles are always created as draft.
            </span>
          </label>
          <button
            type="submit"
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-lg bg-stone-800 px-5 text-sm font-semibold text-white hover:bg-stone-700"
          >
            Create role
          </button>
        </form>
      </section>

      {unassignedRoles.length > 0 ? (
        <section>
          <h2 className="font-serif text-xl font-semibold text-warm-ink">Assign hiring manager to role</h2>
          <p className="mt-1 text-sm text-warm-muted">
            Link a signed-up hiring manager to a draft role. Optionally publish immediately
            (getting_started).
          </p>
          <form action={aAction} className="mt-6 grid max-w-lg gap-4">
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-warm-ink">Role</span>
              <select
                name="role_id"
                required
                className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
              >
                <option value="">— Select —</option>
                {unassignedRoles.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title} ({r.slug})
                  </option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-warm-ink">Hiring manager</span>
              <select
                name="hirer_id"
                required
                className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
              >
                <option value="">— Select —</option>
                {hirers.map((h) => (
                  <option key={h.id} value={h.id}>
                    {h.full_name} ({h.email})
                  </option>
                ))}
              </select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" name="publish" className="rounded border-stone-300" />
              <span className="text-warm-ink">Publish (getting_started) — public page goes live</span>
            </label>
            {aState.error ? (
              <p className="text-sm text-red-700" role="alert">
                {aState.error}
              </p>
            ) : null}
            {aState.ok && aState.message ? (
              <p className="text-sm text-green-800" role="status">
                {aState.message}
              </p>
            ) : null}
            <button
              type="submit"
              disabled={aPending}
              className="inline-flex min-h-11 w-fit items-center justify-center rounded-lg bg-warm-accent px-5 text-sm font-semibold text-white hover:bg-warm-accent-hover disabled:opacity-60"
            >
              {aPending ? "Saving…" : "Assign"}
            </button>
          </form>
        </section>
      ) : null}
    </div>
  );
}
