"use client";

import { Fragment, useActionState, useState } from "react";
import {
  adminDeleteCompany,
  adminDeleteProfile,
  adminUpdateCompany,
  adminUpdateProfile,
  type AdminFormState,
} from "@/app/actions/admin";

const initial: AdminFormState = {};

const input =
  "min-h-9 w-full rounded-lg border border-stone-200 bg-white px-2.5 text-sm text-stone-900 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20";
const btn =
  "rounded-lg px-3 py-1.5 text-xs font-semibold transition disabled:opacity-50";
const btnPrimary = `${btn} bg-warm-accent text-white hover:bg-warm-accent-hover`;
const btnGhost = `${btn} border border-stone-200 bg-white text-warm-ink hover:bg-stone-50`;
const btnDanger = `${btn} border border-red-200 bg-red-50 text-red-800 hover:bg-red-100`;

export type AdminCompanyRow = {
  id: string;
  name: string;
  slug: string;
  website: string | null;
  linkedin_url: string | null;
  logo_url: string | null;
  created_at: string;
};

export type AdminUserRow = {
  id: string;
  email: string;
  full_name: string;
  account_role: string;
  company_id: string | null;
  company_name: string | null;
  created_at: string;
  auth_user_id: string | null;
};

type CompanyOption = { id: string; name: string; slug: string };

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
      <p className="mb-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-900" role="status">
        {state.message}
      </p>
    );
  }
  return null;
}

function CompaniesTable({ rows }: { rows: AdminCompanyRow[] }) {
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [uState, uAction, uPending] = useActionState(adminUpdateCompany, initial);
  const [dState, dAction, dPending] = useActionState(adminDeleteCompany, initial);

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="font-serif text-xl font-semibold text-warm-ink">Companies</h2>
      <p className="mt-1 text-sm text-warm-muted">
        View, edit, or delete organizations. Deleting removes hirer–company memberships and clears{" "}
        <span className="font-mono text-xs">roles.company_id</span> for that org.
      </p>
      <FormFlash state={uState} />
      <FormFlash state={dState} />
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="border-b border-stone-200 text-xs font-semibold uppercase tracking-wide text-warm-muted">
            <tr>
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Slug</th>
              <th className="py-3 pr-4">Created</th>
              <th className="py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-warm-muted">
                  No companies yet.
                </td>
              </tr>
            ) : (
              rows.map((c) => (
                <Fragment key={c.id}>
                  <tr className="align-middle">
                    <td className="py-3 pr-4 font-medium text-warm-ink">{c.name}</td>
                    <td className="py-3 pr-4 font-mono text-xs text-stone-500">{c.slug}</td>
                    <td className="py-3 pr-4 text-warm-muted">
                      {new Date(c.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button type="button" className={btnGhost} onClick={() => setViewId(viewId === c.id ? null : c.id)}>
                          {viewId === c.id ? "Hide" : "View"}
                        </button>
                        <button
                          type="button"
                          className={btnGhost}
                          onClick={() => {
                            setEditId(editId === c.id ? null : c.id);
                            setViewId(null);
                          }}
                        >
                          {editId === c.id ? "Cancel edit" : "Edit"}
                        </button>
                        <form action={dAction} className="inline" onSubmit={(e) => {
                          if (!confirm(`Delete company “${c.name}”? This cannot be undone.`)) e.preventDefault();
                        }}>
                          <input type="hidden" name="id" value={c.id} />
                          <button type="submit" disabled={dPending} className={btnDanger}>
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                  {viewId === c.id ? (
                    <tr>
                      <td colSpan={4} className="bg-stone-50 px-4 py-4 text-xs text-warm-muted">
                        <dl className="grid gap-2 sm:grid-cols-2">
                          <div>
                            <dt className="font-semibold text-warm-ink">Website</dt>
                            <dd className="break-all">{c.website ?? "—"}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-warm-ink">LinkedIn</dt>
                            <dd className="break-all">{c.linkedin_url ?? "—"}</dd>
                          </div>
                          <div className="sm:col-span-2">
                            <dt className="font-semibold text-warm-ink">Logo URL</dt>
                            <dd className="break-all">{c.logo_url ?? "—"}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-warm-ink">ID</dt>
                            <dd className="font-mono">{c.id}</dd>
                          </div>
                        </dl>
                      </td>
                    </tr>
                  ) : null}
                  {editId === c.id ? (
                    <tr>
                      <td colSpan={4} className="bg-amber-50/50 px-4 py-4">
                        <form action={uAction} className="grid max-w-xl gap-3">
                          <input type="hidden" name="id" value={c.id} />
                          <label className="flex flex-col gap-1 text-xs font-medium text-warm-ink">
                            Name
                            <input name="name" required defaultValue={c.name} className={input} />
                          </label>
                          <label className="flex flex-col gap-1 text-xs font-medium text-warm-ink">
                            Slug
                            <input name="slug" required defaultValue={c.slug} className={input} />
                          </label>
                          <label className="flex flex-col gap-1 text-xs font-medium text-warm-ink">
                            Website
                            <input name="website" type="url" defaultValue={c.website ?? ""} className={input} />
                          </label>
                          <label className="flex flex-col gap-1 text-xs font-medium text-warm-ink">
                            LinkedIn URL
                            <input name="linkedin_url" defaultValue={c.linkedin_url ?? ""} className={input} />
                          </label>
                          <label className="flex flex-col gap-1 text-xs font-medium text-warm-ink">
                            Logo URL
                            <input name="logo_url" type="url" defaultValue={c.logo_url ?? ""} className={input} />
                          </label>
                          <button type="submit" disabled={uPending} className={`${btnPrimary} w-fit`}>
                            {uPending ? "Saving…" : "Save company"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ProfilesTable({
  title,
  description,
  rows,
  companies,
  currentAdminId,
  mode,
}: {
  title: string;
  description: string;
  rows: AdminUserRow[];
  companies: CompanyOption[];
  currentAdminId: string;
  mode: "connector" | "hirer";
}) {
  const [viewId, setViewId] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [uState, uAction, uPending] = useActionState(adminUpdateProfile, initial);
  const [dState, dAction, dPending] = useActionState(adminDeleteProfile, initial);

  return (
    <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
      <h2 className="font-serif text-xl font-semibold text-warm-ink">{title}</h2>
      <p className="mt-1 text-sm text-warm-muted">{description}</p>
      <FormFlash state={uState} />
      <FormFlash state={dState} />
      <div className="mt-4 overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-stone-200 text-xs font-semibold uppercase tracking-wide text-warm-muted">
            <tr>
              <th className="py-3 pr-4">Name</th>
              <th className="py-3 pr-4">Email</th>
              <th className="py-3 pr-4">Role / company</th>
              <th className="py-3 pr-4">Joined</th>
              <th className="py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="py-8 text-center text-warm-muted">
                  No accounts in this list.
                </td>
              </tr>
            ) : (
              rows.map((p) => (
                <Fragment key={p.id}>
                  <tr className="align-middle">
                    <td className="py-3 pr-4 font-medium text-warm-ink">{p.full_name}</td>
                    <td className="max-w-[200px] truncate py-3 pr-4 font-mono text-xs text-stone-600">
                      {p.email}
                    </td>
                    <td className="py-3 pr-4 text-warm-muted">
                      <span className="capitalize">{p.account_role}</span>
                      {p.company_name ? (
                        <span className="mt-0.5 block text-xs text-stone-500" title="Primary org link">
                          {p.company_name}
                        </span>
                      ) : null}
                    </td>
                    <td className="py-3 pr-4 text-warm-muted">
                      {new Date(p.created_at).toLocaleDateString()}
                    </td>
                    <td className="py-3 text-right">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button type="button" className={btnGhost} onClick={() => setViewId(viewId === p.id ? null : p.id)}>
                          {viewId === p.id ? "Hide" : "View"}
                        </button>
                        <button
                          type="button"
                          className={btnGhost}
                          onClick={() => {
                            setEditId(editId === p.id ? null : p.id);
                            setViewId(null);
                          }}
                        >
                          {editId === p.id ? "Cancel edit" : "Edit"}
                        </button>
                        <form
                          action={dAction}
                          className="inline"
                          onSubmit={(e) => {
                            if (p.id === currentAdminId) {
                              e.preventDefault();
                              return;
                            }
                            if (
                              !confirm(
                                `Delete profile for ${p.email}? This removes their Warmpath data and owned hiring roles (and submissions).`,
                              )
                            ) {
                              e.preventDefault();
                            }
                          }}
                        >
                          <input type="hidden" name="id" value={p.id} />
                          <button
                            type="submit"
                            disabled={dPending || p.id === currentAdminId}
                            className={btnDanger}
                            title={p.id === currentAdminId ? "You can’t delete yourself" : undefined}
                          >
                            Delete
                          </button>
                        </form>
                      </div>
                    </td>
                  </tr>
                  {viewId === p.id ? (
                    <tr>
                      <td colSpan={5} className="bg-stone-50 px-4 py-4 text-xs text-warm-muted">
                        <dl className="grid gap-2 sm:grid-cols-2">
                          <div>
                            <dt className="font-semibold text-warm-ink">Profile ID</dt>
                            <dd className="font-mono">{p.id}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-warm-ink">Auth linked</dt>
                            <dd>{p.auth_user_id ? "Yes (Google / magic link)" : "No (legacy row without auth)"}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-warm-ink">Primary company ID</dt>
                            <dd className="font-mono">{p.company_id ?? "—"}</dd>
                          </div>
                        </dl>
                      </td>
                    </tr>
                  ) : null}
                  {editId === p.id ? (
                    <tr>
                      <td colSpan={5} className="bg-amber-50/50 px-4 py-4">
                        <ProfileEditForm profile={p} companies={companies} mode={mode} formAction={uAction} pending={uPending} />
                      </td>
                    </tr>
                  ) : null}
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function ProfileEditForm({
  profile,
  companies,
  mode,
  formAction,
  pending,
}: {
  profile: AdminUserRow;
  companies: CompanyOption[];
  mode: "connector" | "hirer";
  formAction: (payload: FormData) => void;
  pending: boolean;
}) {
  const [role, setRole] = useState(profile.account_role);
  const showCompany = role === "hirer" || role === "admin";

  return (
    <form action={formAction} className="grid max-w-xl gap-3">
      <input type="hidden" name="id" value={profile.id} />
      <label className="flex flex-col gap-1 text-xs font-medium text-warm-ink">
        Full name
        <input name="full_name" required defaultValue={profile.full_name} className={input} />
      </label>
      <p className="text-xs text-warm-muted">
        Email <span className="font-mono text-warm-ink">{profile.email}</span> is tied to sign-in and
        isn’t editable here.
      </p>
      <label className="flex flex-col gap-1 text-xs font-medium text-warm-ink">
        Account role
        <select
          name="account_role"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          className={input}
        >
          {mode === "connector" ? (
            <>
              <option value="connector">connector</option>
              <option value="hirer">hirer</option>
              <option value="admin">admin</option>
            </>
          ) : (
            <>
              <option value="hirer">hirer</option>
              <option value="admin">admin</option>
              <option value="connector">connector</option>
            </>
          )}
        </select>
      </label>
      {showCompany ? (
        <label className="flex flex-col gap-1 text-xs font-medium text-warm-ink">
          Primary company
          <span className="font-normal text-warm-muted">
            Default org for new roles; hirers can be linked to more than one company over time.
          </span>
          <select name="company_id" className={input} defaultValue={profile.company_id ?? ""}>
            <option value="">— None —</option>
            {companies.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} ({c.slug})
              </option>
            ))}
          </select>
        </label>
      ) : (
        <input type="hidden" name="company_id" value="" />
      )}
      <button type="submit" disabled={pending} className={`${btnPrimary} w-fit`}>
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}

export function AdminDataTables({
  companies,
  connectors,
  hirers,
  currentAdminId,
}: {
  companies: AdminCompanyRow[];
  connectors: AdminUserRow[];
  hirers: AdminUserRow[];
  currentAdminId: string;
}) {
  const companyOptions = companies.map((c) => ({ id: c.id, name: c.name, slug: c.slug }));

  return (
    <div className="space-y-12">
      <CompaniesTable rows={companies} />
      <ProfilesTable
        title="Connectors"
        description="People who sign in on public role pages to apply or refer."
        rows={connectors}
        companies={companyOptions}
        currentAdminId={currentAdminId}
        mode="connector"
      />
      <ProfilesTable
        title="Hiring managers & admins"
        description="Hirer and admin accounts (hiring dashboard and provisioning)."
        rows={hirers}
        companies={companyOptions}
        currentAdminId={currentAdminId}
        mode="hirer"
      />
    </div>
  );
}
