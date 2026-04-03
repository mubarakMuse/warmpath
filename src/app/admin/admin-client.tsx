"use client";

import { useActionState } from "react";
import {
  adminAssignHirerToRole,
  adminAssignProfileToCompany,
  adminCreateCompany,
  adminCreateRole,
  adminProvisionHirerProfile,
  type AdminFormState,
} from "@/app/actions/admin";
import { AdminRolesTable, type AdminRoleRow } from "@/app/admin/admin-roles-table";

const companyInitial: AdminFormState = {};
const assignCompanyInitial: AdminFormState = {};
const assignInitial: AdminFormState = {};
const provisionInitial: AdminFormState = {};

type CompanyRow = { id: string; name: string; slug: string };
type HirerRow = { id: string; email: string; full_name: string };
type UnassignedRoleRow = { id: string; title: string; slug: string };

export function AdminClient({
  companies,
  hirers,
  rolesForEdit,
  unassignedRoles,
  roleError,
}: {
  companies: CompanyRow[];
  hirers: HirerRow[];
  rolesForEdit: AdminRoleRow[];
  unassignedRoles: UnassignedRoleRow[];
  roleError: string | null;
}) {
  const [cState, cAction, cPending] = useActionState(adminCreateCompany, companyInitial);
  const [coState, coAction, coPending] = useActionState(
    adminAssignProfileToCompany,
    assignCompanyInitial,
  );
  const [aState, aAction, aPending] = useActionState(adminAssignHirerToRole, assignInitial);
  const [pState, pAction, pPending] = useActionState(adminProvisionHirerProfile, provisionInitial);

  return (
    <div className="space-y-16">
      <section>
        <h2 className="font-serif text-xl font-semibold text-warm-ink">Add hiring manager (before signup)</h2>
        <p className="mt-1 text-sm text-warm-muted">
          Creates a <strong className="font-medium text-warm-ink">hirer</strong> profile with no login yet. Use
          the same email when they sign up at <span className="font-mono text-xs">/hire/sign-up</span> (Google or
          magic link) — their account links automatically. You can assign roles and primary company immediately.
        </p>
        <form action={pAction} className="mt-6 grid max-w-lg gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-warm-ink">Full name</span>
            <input
              name="full_name"
              required
              autoComplete="name"
              className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-warm-ink">Work email</span>
            <input
              name="email"
              type="email"
              required
              autoComplete="email"
              className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-warm-ink">LinkedIn profile URL (optional)</span>
            <input
              name="linkedin_url"
              placeholder="https://linkedin.com/in/…"
              className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-warm-ink">Profile photo URL (optional)</span>
            <input
              name="avatar_url"
              type="url"
              placeholder="https://…"
              className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-warm-ink">Primary company (optional)</span>
            <select
              name="company_id"
              className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
            >
              <option value="">— None —</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>
          {pState.error ? (
            <p className="text-sm text-red-700" role="alert">
              {pState.error}
            </p>
          ) : null}
          {pState.ok && pState.message ? (
            <p className="text-sm text-green-800" role="status">
              {pState.message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={pPending}
            className="inline-flex min-h-11 w-fit items-center justify-center rounded-lg bg-warm-accent px-5 text-sm font-semibold text-white hover:bg-warm-accent-hover disabled:opacity-60"
          >
            {pPending ? "Creating…" : "Create hiring profile"}
          </button>
        </form>
      </section>

      <AdminRolesTable roles={rolesForEdit} companies={companies} hirers={hirers} />

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
          Set or change <strong className="font-medium text-warm-ink">primary</strong> company for any hiring
          manager (including profiles you added before signup). Default for new roles they create; each role
          still has its own <span className="font-mono text-xs">company_id</span>.
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
          Leave hiring manager empty for a <strong>draft</strong> role, or pick a hirer (including
          pre-provisioned profiles). If you pick a hirer, you can set status and you’ll jump to their hiring
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
            Link a hiring manager (signed up or pre-provisioned) to a draft role. Optionally publish
            immediately (getting_started).
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
