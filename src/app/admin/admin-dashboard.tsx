"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import {
  adminCreateCompany,
  adminCreateConnector,
  adminCreateRole,
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
  "min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 py-2 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20";

const btnPrimary =
  "inline-flex items-center justify-center rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-900 disabled:cursor-not-allowed disabled:opacity-45";

const btnSecondary =
  "inline-flex items-center justify-center rounded-lg border border-stone-300 bg-white px-4 py-2 text-sm font-medium text-stone-800 transition hover:bg-stone-50 disabled:cursor-not-allowed disabled:opacity-45";

const btnGhost =
  "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium text-stone-500 transition hover:bg-stone-100 hover:text-stone-800";

const card = "rounded-xl border border-stone-200/90 bg-white p-6 shadow-sm";

const panelHighlight = "rounded-xl border border-amber-200/80 bg-amber-50/50 p-6";

const panelMuted = "rounded-xl border border-stone-200 bg-stone-50/90 p-6";

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
    <div className="mx-auto max-w-4xl space-y-8">
      <div className="flex flex-wrap gap-2">
        <Link href="/company/login" className={btnSecondary}>
          Company portal
        </Link>
        <Link href="/connect/login" className={btnSecondary}>
          Connector portal
        </Link>
      </div>

      <section className={card}>
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-semibold text-stone-900">Waitlist</h2>
          <span className="text-xs text-stone-500">{waitlist.length} entries</span>
        </div>
        <p className="mt-1 text-xs text-stone-500">Landing signups · newest first</p>
        <ul className="mt-4 max-h-80 space-y-2 overflow-y-auto text-sm">
          {waitlist.length === 0 ? (
            <li className="text-stone-500">No entries yet.</li>
          ) : (
            waitlist.map((w) => (
              <li key={w.id} className="rounded-lg border border-stone-100 bg-stone-50/80 px-3 py-2.5">
                <div className="flex flex-wrap items-center justify-between gap-1 font-medium text-stone-800">
                  <span>{w.company_name || "—"}</span>
                  <span className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">{w.kind}</span>
                </div>
                {w.email ? <p className="mt-1 text-xs text-stone-600">{w.email}</p> : null}
                <p className="mt-1 text-xs text-stone-400">
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

      <div className="flex flex-wrap gap-2 border-b border-stone-200 pb-6">
        <button type="button" onClick={openCreateCompany} className={btnSecondary}>
          {showNewCompany ? "Cancel" : "Create company"}
        </button>
        <button type="button" onClick={openCreateRole} className={btnSecondary} disabled={companies.length === 0}>
          {showNewRole ? "Cancel" : "Create role"}
        </button>
        <button type="button" onClick={openCreateConnector} className={btnSecondary}>
          {showNewConnector ? "Cancel" : "Create connector"}
        </button>
      </div>

      {editingCompany ? (
        <section className={panelHighlight}>
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-stone-900">Edit company · {editingCompany.slug}</span>
            <button type="button" onClick={() => setEditCompanyId(null)} className={btnGhost}>
              Dismiss
            </button>
          </div>
          <form key={editingCompany.id} action={ucAction} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={editingCompany.id} />
            <label className="sm:col-span-2 flex flex-col gap-1 text-xs font-medium text-stone-700">
              Name
              <input name="name" required defaultValue={editingCompany.name} className={input} />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1 text-xs font-medium text-stone-700">
              Slug
              <input name="slug" required defaultValue={editingCompany.slug} className={input} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
              Website
              <input name="website" type="url" defaultValue={editingCompany.website ?? ""} className={input} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
              LinkedIn URL
              <input name="linkedin_url" defaultValue={editingCompany.linkedin_url ?? ""} className={input} />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1 text-xs font-medium text-stone-700">
              Logo URL
              <input name="logo_url" type="url" defaultValue={editingCompany.logo_url ?? ""} className={input} />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1 text-xs font-medium text-stone-700">
              Description
              <textarea
                name="description"
                rows={2}
                defaultValue={editingCompany.description ?? ""}
                className={input}
              />
            </label>
            <div className="sm:col-span-2">
              <button type="submit" disabled={ucPending} className={btnPrimary}>
                {ucPending ? "Saving…" : "Save company"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {editingRole ? (
        <section className={panelHighlight}>
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-stone-900">Edit role · {editingRole.slug}</span>
            <button type="button" onClick={() => setEditRoleId(null)} className={btnGhost}>
              Dismiss
            </button>
          </div>
          <form key={editingRole.id} action={urAction} className="grid gap-3">
            <input type="hidden" name="role_id" value={editingRole.id} />
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
              Title
              <input name="title" required defaultValue={editingRole.title} className={input} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
              Slug
              <input name="slug" required defaultValue={editingRole.slug} className={input} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
              Description
              <textarea
                name="description"
                rows={3}
                defaultValue={editingRole.description ?? ""}
                className={input}
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
              Location
              <input name="location" defaultValue={editingRole.location ?? ""} className={input} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
              Referral bonus
              <textarea
                name="referral_bonus"
                rows={2}
                defaultValue={editingRole.referral_bonus ?? ""}
                className={input}
                placeholder="Connectors and company only — not on public job page"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
              Status
              <select name="status" className={input} defaultValue={editingRole.status}>
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <button type="submit" disabled={urPending} className={btnPrimary}>
              {urPending ? "Saving…" : "Save role"}
            </button>
          </form>
        </section>
      ) : null}

      {showNewCompany ? (
        <section className={panelMuted}>
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-stone-900">New company</span>
            <button type="button" onClick={() => setShowNewCompany(false)} className={btnGhost}>
              Dismiss
            </button>
          </div>
          <form action={cAction} className="grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2 flex flex-col gap-1 text-xs font-medium text-stone-700">
              Name
              <input name="name" required className={input} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
              Slug
              <input name="slug" className={input} placeholder="Auto from name if empty" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
              Website
              <input name="website" type="url" className={input} placeholder="https://" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
              LinkedIn URL
              <input name="linkedin_url" className={input} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
              Logo URL
              <input name="logo_url" type="url" className={input} />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1 text-xs font-medium text-stone-700">
              Description
              <textarea name="description" rows={2} className={input} />
            </label>
            <div className="sm:col-span-2">
              <button type="submit" disabled={cPending} className={btnPrimary}>
                {cPending ? "Creating…" : "Create company"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {showNewConnector ? (
        <section className={panelMuted}>
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-stone-900">New connector</span>
            <button type="button" onClick={() => setShowNewConnector(false)} className={btnGhost}>
              Dismiss
            </button>
          </div>
          <p className="text-sm text-stone-600">
            They sign in at <span className="font-mono text-xs">/connect/login</span> with the access code shown after
            you create them — copy it for them.
          </p>
          <form action={cnAction} className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2 flex flex-col gap-1 text-xs font-medium text-stone-700">
              Full name
              <input name="full_name" required className={input} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
              Role / title
              <input name="role_title" className={input} placeholder="e.g. Engineering Manager" />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
              Email
              <input name="email" type="email" className={input} />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1 text-xs font-medium text-stone-700">
              LinkedIn URL
              <input name="linkedin_url" className={input} placeholder="https://linkedin.com/in/…" />
            </label>
            <div className="sm:col-span-2">
              <button type="submit" disabled={cnPending} className={btnPrimary}>
                {cnPending ? "Creating…" : "Create connector"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      {showNewRole ? (
        <section className={panelMuted}>
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-stone-900">New role</span>
            <button type="button" onClick={() => setShowNewRole(false)} className={btnGhost}>
              Dismiss
            </button>
          </div>
          <form action={rAction} className="grid gap-3 sm:grid-cols-2">
            <label className="sm:col-span-2 flex flex-col gap-1 text-xs font-medium text-stone-700">
              Company
              <select name="company_id" required className={input}>
                <option value="">Select…</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1 text-xs font-medium text-stone-700">
              Title
              <input name="title" required className={input} />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1 text-xs font-medium text-stone-700">
              Description
              <textarea name="description" rows={3} className={input} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
              Location
              <input name="location" className={input} />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1 text-xs font-medium text-stone-700">
              Referral bonus
              <textarea
                name="referral_bonus"
                rows={2}
                className={input}
                placeholder="Internal only — connectors, company, admin"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
              Status
              <select name="status" className={input} defaultValue="draft">
                <option value="draft">Draft</option>
                <option value="active">Active</option>
                <option value="closed">Closed</option>
              </select>
            </label>
            <div className="sm:col-span-2">
              <button type="submit" disabled={rPending} className={btnPrimary}>
                {rPending ? "Creating…" : "Create role"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section>
        <h2 className="text-sm font-semibold text-stone-900">Companies</h2>
        <p className="mt-1 text-xs text-stone-500">Access codes are used on the company portal login.</p>
        <ul className="mt-4 space-y-4">
          {companies.length === 0 ? (
            <li className="text-sm text-stone-500">No companies yet — create one above.</li>
          ) : (
            companies.map((c) => (
              <li key={c.id} className={card}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-stone-900">{c.name}</p>
                    <p className="mt-0.5 font-mono text-xs text-stone-500">{c.slug}</p>
                    <p className="mt-2 text-xs text-stone-600">
                      Access code{" "}
                      <span className="font-mono font-semibold text-stone-900">{c.access_code}</span>
                    </p>
                  </div>
                  <button type="button" onClick={() => startEditCompany(c.id)} className={btnSecondary}>
                    {editCompanyId === c.id ? "Close" : "Edit company"}
                  </button>
                </div>

                <ul className="mt-4 space-y-2 border-t border-stone-100 pt-4">
                  {(c.roles ?? []).length === 0 ? (
                    <li className="text-xs text-stone-500">No roles for this company.</li>
                  ) : (
                    (c.roles ?? []).map((r) => (
                      <li
                        key={r.id}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-stone-100 bg-stone-50/80 px-3 py-2.5"
                      >
                        <div className="min-w-0">
                          <span className="text-sm font-medium text-stone-800">{r.title}</span>
                          <span className="ml-2 text-xs capitalize text-stone-500">
                            {r.status} · {r.slug}
                          </span>
                        </div>
                        <button type="button" onClick={() => startEditRole(r.id)} className={btnSecondary}>
                          {editRoleId === r.id ? "Close" : "Edit role"}
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
        <section className={panelHighlight}>
          <div className="mb-4 flex items-center justify-between gap-2">
            <span className="text-sm font-semibold text-stone-900">Edit connector · {editingConnector.full_name}</span>
            <button type="button" onClick={() => setEditConnectorId(null)} className={btnGhost}>
              Dismiss
            </button>
          </div>
          <form key={editingConnector.id} action={ucnAction} className="grid gap-3 sm:grid-cols-2">
            <input type="hidden" name="id" value={editingConnector.id} />
            <label className="sm:col-span-2 flex flex-col gap-1 text-xs font-medium text-stone-700">
              Full name
              <input name="full_name" required defaultValue={editingConnector.full_name} className={input} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
              Role / title
              <input name="role_title" defaultValue={editingConnector.role_title ?? ""} className={input} />
            </label>
            <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
              Email
              <input name="email" type="email" defaultValue={editingConnector.email ?? ""} className={input} />
            </label>
            <label className="sm:col-span-2 flex flex-col gap-1 text-xs font-medium text-stone-700">
              LinkedIn URL
              <input name="linkedin_url" defaultValue={editingConnector.linkedin_url ?? ""} className={input} />
            </label>
            <p className="sm:col-span-2 text-xs text-stone-500">
              Access code{" "}
              <span className="font-mono font-semibold text-stone-800">{editingConnector.access_code}</span> — create a
              new connector to rotate codes.
            </p>
            <div className="sm:col-span-2">
              <button type="submit" disabled={ucnPending} className={btnPrimary}>
                {ucnPending ? "Saving…" : "Save connector"}
              </button>
            </div>
          </form>
        </section>
      ) : null}

      <section>
        <h2 className="text-sm font-semibold text-stone-900">Connectors</h2>
        <p className="mt-1 text-xs text-stone-500">
          Sign-in at <span className="font-mono">/connect/login</span> with the access code below.
        </p>
        <ul className="mt-4 space-y-4">
          {connectors.length === 0 ? (
            <li className="text-sm text-stone-500">No connectors — create one above or run migration 003.</li>
          ) : (
            connectors.map((x) => (
              <li key={x.id} className={card}>
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-medium text-stone-900">{x.full_name}</p>
                    {x.role_title ? <p className="mt-0.5 text-sm text-stone-600">{x.role_title}</p> : null}
                    {x.email ? <p className="mt-1 text-xs text-stone-600">{x.email}</p> : null}
                    {ensureHttpsUrl(x.linkedin_url) ? (
                      <p className="mt-2 text-xs">
                        <a
                          href={ensureHttpsUrl(x.linkedin_url)!}
                          className="font-medium text-amber-800 hover:underline"
                          target="_blank"
                          rel="noreferrer"
                        >
                          LinkedIn profile
                        </a>
                      </p>
                    ) : null}
                    <p className="mt-2 text-xs text-stone-600">
                      Access code{" "}
                      <span className="font-mono font-semibold text-stone-900">{x.access_code}</span>
                    </p>
                  </div>
                  <button type="button" onClick={() => startEditConnector(x.id)} className={btnSecondary}>
                    {editConnectorId === x.id ? "Close" : "Edit"}
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
