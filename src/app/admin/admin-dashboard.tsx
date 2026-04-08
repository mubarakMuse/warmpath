"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  adminCreateCompany,
  adminCreateConnector,
  adminCreateRole,
  adminLogout,
  adminUpdateCompany,
  adminUpdateConnector,
  adminUpdateRole,
  type FormState,
} from "@/app/actions/admin";
import { ensureHttpsUrl } from "@/lib/ensure-https-url";
import { toast } from "sonner";

const initial: FormState = {};

export type RoleRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  location: string | null;
  description: string | null;
  referral_bonus?: string | null;
};

export type CompanyRow = {
  id: string;
  name: string;
  slug: string;
  access_code: string;
  logo_url: string | null;
  linkedin_url: string | null;
  website: string | null;
  description: string | null;
  roles: RoleRow[] | null;
};

export type ConnectorRow = {
  id: string;
  full_name: string;
  role_title: string | null;
  email: string | null;
  linkedin_url: string | null;
  access_code: string;
  created_at: string;
};

export type WaitlistRow = {
  id: string;
  kind: string;
  company_name: string | null;
  email: string | null;
  created_at: string;
};

const input =
  "min-h-10 w-full rounded-md border border-stone-200 bg-white px-3 py-2 font-sans text-sm outline-none focus:border-amber-700 focus:ring-1 focus:ring-amber-700/30";

const btnCode =
  "inline-flex items-center rounded-md border border-stone-400 bg-stone-100 px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-stone-800 shadow-sm transition hover:bg-stone-200 hover:border-stone-500 disabled:cursor-not-allowed disabled:opacity-45";

const btnCodeGhost =
  "inline-flex items-center rounded-md border border-dashed border-stone-400 bg-transparent px-2.5 py-1.5 font-mono text-[11px] font-semibold uppercase tracking-wide text-stone-700 transition hover:bg-stone-100 disabled:opacity-45";

function findRole(companies: CompanyRow[], roleId: string): RoleRow | null {
  for (const c of companies) {
    const r = (c.roles ?? []).find((x) => x.id === roleId);
    if (r) return r;
  }
  return null;
}

export function AdminDashboard({
  companies,
  connectors,
  waitlist,
}: {
  companies: CompanyRow[];
  connectors: ConnectorRow[];
  waitlist: WaitlistRow[];
}) {
  const [showNewCompany, setShowNewCompany] = useState(false);
  const [showNewRole, setShowNewRole] = useState(false);
  const [showNewConnector, setShowNewConnector] = useState(false);
  const [editCompanyId, setEditCompanyId] = useState<string | null>(null);
  const [editRoleId, setEditRoleId] = useState<string | null>(null);
  const [editConnectorId, setEditConnectorId] = useState<string | null>(null);

  const [cState, cAction, cPending] = useActionState(adminCreateCompany, initial);
  const [rState, rAction, rPending] = useActionState(adminCreateRole, initial);
  const [ucState, ucAction, ucPending] = useActionState(adminUpdateCompany, initial);
  const [urState, urAction, urPending] = useActionState(adminUpdateRole, initial);
  const [cnState, cnAction, cnPending] = useActionState(adminCreateConnector, initial);
  const [ucnState, ucnAction, ucnPending] = useActionState(adminUpdateConnector, initial);

  const editingCompany = editCompanyId ? companies.find((c) => c.id === editCompanyId) : null;
  const editingRole = editRoleId ? findRole(companies, editRoleId) : null;
  const editingConnector = editConnectorId ? connectors.find((x) => x.id === editConnectorId) : null;

  useEffect(() => {
    if (!cState.ok) return;
    const t = window.setTimeout(() => setShowNewCompany(false), 0);
    return () => window.clearTimeout(t);
  }, [cState.ok]);

  useEffect(() => {
    if (!rState.ok) return;
    const t = window.setTimeout(() => setShowNewRole(false), 0);
    return () => window.clearTimeout(t);
  }, [rState.ok]);

  useEffect(() => {
    if (!ucState.ok) return;
    const t = window.setTimeout(() => setEditCompanyId(null), 0);
    return () => window.clearTimeout(t);
  }, [ucState.ok]);

  useEffect(() => {
    if (!urState.ok) return;
    const t = window.setTimeout(() => setEditRoleId(null), 0);
    return () => window.clearTimeout(t);
  }, [urState.ok]);

  useEffect(() => {
    if (!cnState.ok) return;
    const t = window.setTimeout(() => setShowNewConnector(false), 0);
    return () => window.clearTimeout(t);
  }, [cnState.ok]);

  useEffect(() => {
    if (cState.error) toast.error(cState.error);
    else if (cState.ok && cState.message) toast.success(cState.message);
  }, [cState]);

  useEffect(() => {
    if (rState.error) toast.error(rState.error);
    else if (rState.ok && rState.message) toast.success(rState.message);
  }, [rState]);

  useEffect(() => {
    if (ucState.error) toast.error(ucState.error);
    else if (ucState.ok && ucState.message) toast.success(ucState.message);
  }, [ucState]);

  useEffect(() => {
    if (urState.error) toast.error(urState.error);
    else if (urState.ok && urState.message) toast.success(urState.message);
  }, [urState]);

  useEffect(() => {
    if (cnState.error) toast.error(cnState.error);
    else if (cnState.ok && cnState.message) toast.success(cnState.message);
  }, [cnState]);

  useEffect(() => {
    if (!ucnState.ok) return;
    const t = window.setTimeout(() => setEditConnectorId(null), 0);
    return () => window.clearTimeout(t);
  }, [ucnState.ok]);

  useEffect(() => {
    if (ucnState.error) toast.error(ucnState.error);
    else if (ucnState.ok && ucnState.message) toast.success(ucnState.message);
  }, [ucnState]);

  function openCreateCompany() {
    setShowNewCompany((v) => !v);
    setShowNewRole(false);
    setShowNewConnector(false);
    setEditCompanyId(null);
    setEditRoleId(null);
    setEditConnectorId(null);
  }

  function openCreateRole() {
    setShowNewRole((v) => !v);
    setShowNewCompany(false);
    setShowNewConnector(false);
    setEditCompanyId(null);
    setEditRoleId(null);
    setEditConnectorId(null);
  }

  function openCreateConnector() {
    setShowNewConnector((v) => !v);
    setShowNewCompany(false);
    setShowNewRole(false);
    setEditCompanyId(null);
    setEditRoleId(null);
    setEditConnectorId(null);
  }

  function startEditCompany(id: string) {
    setEditCompanyId((cur) => (cur === id ? null : id));
    setEditRoleId(null);
    setEditConnectorId(null);
    setShowNewCompany(false);
    setShowNewRole(false);
    setShowNewConnector(false);
  }

  function startEditRole(id: string) {
    setEditRoleId((cur) => (cur === id ? null : id));
    setEditCompanyId(null);
    setEditConnectorId(null);
    setShowNewCompany(false);
    setShowNewRole(false);
    setShowNewConnector(false);
  }

  function startEditConnector(id: string) {
    setEditConnectorId((cur) => (cur === id ? null : id));
    setEditCompanyId(null);
    setEditRoleId(null);
    setShowNewCompany(false);
    setShowNewRole(false);
    setShowNewConnector(false);
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-stone-900">Admin</h1>
          <p className="text-sm text-stone-600">Companies and roles</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/company/login" className={btnCodeGhost}>
            company_portal
          </Link>
          <Link href="/connect/login" className={btnCodeGhost}>
            connect_portal
          </Link>
          <form action={adminLogout} className="inline">
            <button type="submit" className={btnCodeGhost}>
              sign_out
            </button>
          </form>
        </div>
      </div>

      <section className="rounded-lg border border-stone-200 bg-white p-5 shadow-sm ring-1 ring-stone-100">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-stone-500">
            waitlist
          </h2>
          <span className="text-xs text-stone-400">{waitlist.length} entries</span>
        </div>
        <p className="mt-1 font-mono text-[10px] text-stone-400">Landing signups · newest first</p>
        <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto text-xs">
          {waitlist.length === 0 ? (
            <li className="text-stone-500">No entries yet.</li>
          ) : (
            waitlist.map((w) => (
              <li key={w.id} className="rounded-md border border-stone-100 bg-stone-50/80 px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-1 font-medium text-stone-800">
                  <span>{w.company_name || "—"}</span>
                  <span className="font-mono text-[10px] font-normal uppercase tracking-wide text-stone-500">
                    {w.kind}
                  </span>
                </div>
                {w.email ? <p className="mt-1 font-mono text-[11px] text-stone-600">{w.email}</p> : null}
                <p className="mt-1 text-[10px] text-stone-400">
                  {new Date(w.created_at).toLocaleString(undefined, {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </p>
              </li>
            ))
          )}
        </ul>
      </section>

      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-4">
        <button type="button" onClick={openCreateCompany} className={btnCode}>
          {showNewCompany ? "close_create_company" : "create_company"}
        </button>
        <button type="button" onClick={openCreateRole} className={btnCode} disabled={companies.length === 0}>
          {showNewRole ? "close_create_role" : "create_role"}
        </button>
        <button type="button" onClick={openCreateConnector} className={btnCode}>
          {showNewConnector ? "close_create_connector" : "create_connector"}
        </button>
      </div>

      {editingCompany ? (
        <section className="rounded-lg border border-amber-200/80 bg-amber-50/40 p-5 font-mono text-xs">
          <div className="mb-3 flex items-center justify-between text-stone-600">
            <span className="text-[10px] uppercase tracking-wider">edit_company · {editingCompany.slug}</span>
            <button type="button" onClick={() => setEditCompanyId(null)} className={btnCodeGhost}>
              dismiss
            </button>
          </div>
          <form key={editingCompany.id} action={ucAction} className="mt-3 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={editingCompany.id} />
            <label className="sm:col-span-2 flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">name</span>
              <input name="name" required defaultValue={editingCompany.name} className={input} />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">slug</span>
              <input name="slug" required defaultValue={editingCompany.slug} className={input} />
            </label>
            <label className="flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">website</span>
              <input name="website" type="url" defaultValue={editingCompany.website ?? ""} className={input} />
            </label>
            <label className="flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">linkedin_url</span>
              <input name="linkedin_url" defaultValue={editingCompany.linkedin_url ?? ""} className={input} />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">logo_url</span>
              <input name="logo_url" type="url" defaultValue={editingCompany.logo_url ?? ""} className={input} />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">description</span>
              <textarea
                name="description"
                rows={2}
                defaultValue={editingCompany.description ?? ""}
                className={input}
              />
            </label>
            <div className="sm:col-span-2">
              <button type="submit" disabled={ucPending} className={btnCode}>
                {ucPending ? "saving…" : "save_company"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {editingRole ? (
        <section className="rounded-lg border border-amber-200/80 bg-amber-50/40 p-5 font-mono text-xs">
          <div className="mb-3 flex items-center justify-between text-stone-600">
            <span className="text-[10px] uppercase tracking-wider">edit_role · {editingRole.slug}</span>
            <button type="button" onClick={() => setEditRoleId(null)} className={btnCodeGhost}>
              dismiss
            </button>
          </div>
          <form key={editingRole.id} action={urAction} className="mt-3 grid gap-3">
            <input type="hidden" name="role_id" value={editingRole.id} />
            <label className="flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">title</span>
              <input name="title" required defaultValue={editingRole.title} className={input} />
            </label>
            <label className="flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">slug</span>
              <input name="slug" required defaultValue={editingRole.slug} className={input} />
            </label>
            <label className="flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">description</span>
              <textarea
                name="description"
                rows={3}
                defaultValue={editingRole.description ?? ""}
                className={input}
              />
            </label>
            <label className="flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">location</span>
              <input name="location" defaultValue={editingRole.location ?? ""} className={input} />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">referral_bonus</span>
              <textarea
                name="referral_bonus"
                rows={2}
                defaultValue={editingRole.referral_bonus ?? ""}
                className={input}
                placeholder="Internal: shown to connectors & company only, not on public /r/…"
              />
            </label>
            <label className="flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">status</span>
              <select name="status" className={input} defaultValue={editingRole.status}>
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="closed">closed</option>
              </select>
            </label>
            <button type="submit" disabled={urPending} className={btnCode}>
              {urPending ? "saving…" : "save_role"}
            </button>
          </form>
        </section>
      ) : null}

      {showNewCompany ? (
        <section className="rounded-lg border border-stone-300 bg-stone-50/80 p-5 font-mono text-xs">
          <div className="mb-3 flex items-center justify-between text-stone-600">
            <span className="text-[10px] uppercase tracking-wider">new_company</span>
            <button type="button" onClick={() => setShowNewCompany(false)} className={btnCodeGhost}>
              dismiss
            </button>
          </div>
          <form action={cAction} className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2 flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">name</span>
              <input name="name" required className={input} />
            </label>
            <label className="flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">slug</span>
              <input name="slug" className={input} placeholder="auto from name" />
            </label>
            <label className="flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">website</span>
              <input name="website" type="url" className={input} placeholder="https://" />
            </label>
            <label className="flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">linkedin_url</span>
              <input name="linkedin_url" className={input} />
            </label>
            <label className="flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">logo_url</span>
              <input name="logo_url" type="url" className={input} />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">description</span>
              <textarea name="description" rows={2} className={input} />
            </label>
            <div className="sm:col-span-2">
              <button type="submit" disabled={cPending} className={btnCode}>
                {cPending ? "submitting…" : "submit_create"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {showNewConnector ? (
        <section className="rounded-lg border border-stone-300 bg-stone-50/80 p-5 font-mono text-xs">
          <div className="mb-3 flex items-center justify-between text-stone-600">
            <span className="text-[10px] uppercase tracking-wider">new_connector</span>
            <button type="button" onClick={() => setShowNewConnector(false)} className={btnCodeGhost}>
              dismiss
            </button>
          </div>
          <p className="text-[11px] text-stone-500">
            Creates a person who can sign in at /connect/login and refer candidates to active roles. Access code is
            shown after submit — copy it for them.
          </p>
          <form action={cnAction} className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2 flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">full_name</span>
              <input name="full_name" required className={input} />
            </label>
            <label className="flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">role_title</span>
              <input name="role_title" className={input} placeholder="e.g. Engineering Manager" />
            </label>
            <label className="flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">email</span>
              <input name="email" type="email" className={input} />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">linkedin_url</span>
              <input name="linkedin_url" className={input} placeholder="https://linkedin.com/in/…" />
            </label>
            <div className="sm:col-span-2">
              <button type="submit" disabled={cnPending} className={btnCode}>
                {cnPending ? "submitting…" : "submit_create"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {showNewRole ? (
        <section className="rounded-lg border border-stone-300 bg-stone-50/80 p-5 font-mono text-xs">
          <div className="mb-3 flex items-center justify-between text-stone-600">
            <span className="text-[10px] uppercase tracking-wider">new_role</span>
            <button type="button" onClick={() => setShowNewRole(false)} className={btnCodeGhost}>
              dismiss
            </button>
          </div>
          <form action={rAction} className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2 flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">company_id</span>
              <select name="company_id" required className={input}>
                <option value="">—</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">title</span>
              <input name="title" required className={input} />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">description</span>
              <textarea name="description" rows={3} className={input} />
            </label>
            <label className="flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">location</span>
              <input name="location" className={input} />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">referral_bonus</span>
              <textarea
                name="referral_bonus"
                rows={2}
                className={input}
                placeholder="Internal only (connectors / company / admin)"
              />
            </label>
            <label className="flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">status</span>
              <select name="status" className={input} defaultValue="draft">
                <option value="draft">draft</option>
                <option value="active">active</option>
                <option value="closed">closed</option>
              </select>
            </label>
            <div className="sm:col-span-2">
              <button type="submit" disabled={rPending} className={btnCode}>
                {rPending ? "submitting…" : "submit_create"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section>
        <h2 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-stone-500">
          companies
        </h2>
        <ul className="mt-3 space-y-4">
          {companies.length === 0 ? (
            <li className="font-mono text-xs text-stone-500">{"// no rows"}</li>
          ) : (
            companies.map((c) => (
              <li
                key={c.id}
                className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm ring-1 ring-stone-100"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-stone-900">{c.name}</p>
                    <p className="mt-0.5 font-mono text-[11px] text-stone-500">{c.slug}</p>
                    <p className="mt-1 font-mono text-[11px] text-stone-600">
                      access_code: <span className="font-semibold text-stone-900">{c.access_code}</span>
                    </p>
                  </div>
                  <button type="button" onClick={() => startEditCompany(c.id)} className={btnCode}>
                    {editCompanyId === c.id ? "close_edit" : "edit_company"}
                  </button>
                </div>

                <ul className="mt-4 space-y-2 border-t border-stone-100 pt-3">
                  {(c.roles ?? []).length === 0 ? (
                    <li className="font-mono text-[11px] text-stone-400">{"// no roles"}</li>
                  ) : (
                    (c.roles ?? []).map((r) => (
                      <li
                        key={r.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-md bg-stone-50/90 px-3 py-2"
                      >
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-stone-800">{r.title}</span>
                          <span className="ml-2 font-mono text-[10px] text-stone-500">
                            {r.status} · {r.slug}
                          </span>
                        </div>
                        <button type="button" onClick={() => startEditRole(r.id)} className={btnCode}>
                          {editRoleId === r.id ? "close_edit" : "edit_role"}
                        </button>
                      </li>
                    ))
                  )}
                </ul>
              </li>
            ))
          )}
        </ul>
      </section>

      {editingConnector ? (
        <section className="rounded-lg border border-amber-200/80 bg-amber-50/40 p-5 font-mono text-xs">
          <div className="mb-3 flex items-center justify-between text-stone-600">
            <span className="text-[10px] uppercase tracking-wider">
              edit_connector · {editingConnector.full_name}
            </span>
            <button type="button" onClick={() => setEditConnectorId(null)} className={btnCodeGhost}>
              dismiss
            </button>
          </div>
          <form key={editingConnector.id} action={ucnAction} className="mt-3 grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={editingConnector.id} />
            <label className="sm:col-span-2 flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">full_name</span>
              <input name="full_name" required defaultValue={editingConnector.full_name} className={input} />
            </label>
            <label className="flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">role_title</span>
              <input name="role_title" defaultValue={editingConnector.role_title ?? ""} className={input} />
            </label>
            <label className="flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">email</span>
              <input name="email" type="email" defaultValue={editingConnector.email ?? ""} className={input} />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1 text-stone-700">
              <span className="text-[10px] uppercase text-stone-500">linkedin_url</span>
              <input name="linkedin_url" defaultValue={editingConnector.linkedin_url ?? ""} className={input} />
            </label>
            <p className="sm:col-span-2 text-[10px] text-stone-500">
              access_code:{" "}
              <span className="font-semibold text-stone-800">{editingConnector.access_code}</span> — create a new
              connector to rotate codes
            </p>
            <div className="sm:col-span-2">
              <button type="submit" disabled={ucnPending} className={btnCode}>
                {ucnPending ? "saving…" : "save_connector"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section>
        <h2 className="font-mono text-[11px] font-semibold uppercase tracking-wider text-stone-500">
          connectors
        </h2>
        <p className="mt-1 font-mono text-[10px] text-stone-400">
          Referrers use /connect/login with access_code below.
        </p>
        <ul className="mt-3 space-y-3">
          {connectors.length === 0 ? (
            <li className="font-mono text-xs text-stone-500">{"// none — create_connector or run migration 003"}</li>
          ) : (
            connectors.map((x) => (
              <li
                key={x.id}
                className="rounded-lg border border-stone-200 bg-white p-4 shadow-sm ring-1 ring-stone-100"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-stone-900">{x.full_name}</p>
                    {x.role_title ? <p className="mt-0.5 text-sm text-stone-600">{x.role_title}</p> : null}
                    {x.email ? <p className="mt-1 font-mono text-[11px] text-stone-500">{x.email}</p> : null}
                    {ensureHttpsUrl(x.linkedin_url) ? (
                      <p className="mt-1 font-mono text-[11px]">
                        <a
                          href={ensureHttpsUrl(x.linkedin_url)!}
                          className="text-amber-800 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          LinkedIn
                        </a>
                      </p>
                    ) : null}
                    <p className="mt-2 font-mono text-[11px] text-stone-600">
                      access_code: <span className="font-semibold text-stone-900">{x.access_code}</span>
                    </p>
                  </div>
                  <button type="button" onClick={() => startEditConnector(x.id)} className={btnCode}>
                    {editConnectorId === x.id ? "close_edit" : "edit_connector"}
                  </button>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
    </div>
  );
}
