"use client";

import { useActionState, useEffect, useMemo, useState, Fragment } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  companyCreateRole,
  companyLogout,
  companyUpdateDetails,
  companyUpdateRole,
  type CompanyFormState,
} from "@/app/actions/company";
import { CopyPublicLinkButton } from "@/app/connect/copy-public-link-button";
import { ReferralResponseForm } from "@/app/company/referral-response-form";
import { ensureHttpsUrl } from "@/lib/ensure-https-url";
import { relationshipDisplay } from "@/lib/relationship-options";

const initial: CompanyFormState = {};

const input =
  "min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20";

export type PortalCompany = {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  linkedin_url: string | null;
  website: string | null;
  description: string | null;
  access_code: string;
};

export type PortalRole = {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  location: string | null;
  status: string;
  referral_bonus?: string | null;
};

export type CompanyReferralRow = {
  id: string;
  role_id: string;
  created_at: string;
  candidate_linkedin_url: string;
  fit_description: string;
  candidate_name: string | null;
  candidate_email: string | null;
  relationship_type: string | null;
  relationship_other: string | null;
  connector_name: string | null;
  connector_linkedin_url: string | null;
  referral_stage: string;
  company_reason_preset: string | null;
  company_reason_note: string | null;
  company_responded_at: string | null;
};

function Flash({ s }: { s: CompanyFormState }) {
  if (s.error) return <p className="text-sm text-red-700">{s.error}</p>;
  return null;
}

export function CompanyPortal({
  company,
  roles,
  referrals,
  siteBaseUrl,
}: {
  company: PortalCompany;
  roles: PortalRole[];
  referrals: CompanyReferralRow[];
  siteBaseUrl: string;
}) {
  const [coState, coAction, coPending] = useActionState(companyUpdateDetails, initial);
  const [crState, crAction, crPending] = useActionState(companyCreateRole, initial);
  const [urState, urAction, urPending] = useActionState(companyUpdateRole, initial);
  const [editId, setEditId] = useState<string | null>(null);
  const [showRoleManagement, setShowRoleManagement] = useState(false);
  const [coFormKey, setCoFormKey] = useState(0);
  const [crFormKey, setCrFormKey] = useState(0);
  const router = useRouter();

  const referralsByRole = useMemo(() => {
    const m = new Map<string, CompanyReferralRow[]>();
    for (const r of roles) m.set(r.id, []);
    for (const ref of referrals) {
      const list = m.get(ref.role_id);
      if (list) list.push(ref);
    }
    return m;
  }, [roles, referrals]);

  useEffect(() => {
    if (coState.error) toast.error(coState.error);
    else if (coState.ok && coState.message) {
      toast.success(coState.message);
      setCoFormKey((k) => k + 1);
      router.refresh();
    }
  }, [coState, router]);

  useEffect(() => {
    if (crState.error) toast.error(crState.error);
    else if (crState.ok && crState.message) {
      toast.success(crState.message);
      setCrFormKey((k) => k + 1);
      router.refresh();
    }
  }, [crState, router]);

  useEffect(() => {
    if (urState.error) toast.error(urState.error);
    else if (urState.ok && urState.message) {
      toast.success(urState.message);
      setEditId(null);
      router.refresh();
    }
  }, [urState, router]);

  return (
    <div className="mx-auto max-w-3xl space-y-10 px-6 py-10">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-2xl font-semibold text-stone-900">{company.name}</h1>
          <p className="text-xs text-stone-500">
            Access code: <span className="font-mono font-medium text-stone-800">{company.access_code}</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/" className="text-sm text-amber-800 hover:underline">
            Home
          </Link>
          <form action={companyLogout}>
            <button type="submit" className="text-sm text-stone-500 hover:text-stone-800">
              Sign out
            </button>
          </form>
        </div>
      </div>

      <section className="rounded-xl border border-amber-200/60 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-stone-900">Your company profile</h2>
        <p className="mt-1 text-sm text-stone-600">
          Name, links, and description — shown on public job pages where relevant.
        </p>
        <div className="mt-3">
          <Flash s={coState} />
        </div>
        <form key={coFormKey} action={coAction} className="mt-4 grid gap-3">
          <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
            Name
            <input name="name" required defaultValue={company.name} className={input} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
            Slug
            <input name="slug" required defaultValue={company.slug} className={input} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
            Website
            <input name="website" type="url" defaultValue={company.website ?? ""} className={input} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
            LinkedIn URL
            <input name="linkedin_url" defaultValue={company.linkedin_url ?? ""} className={input} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
            Logo URL
            <input name="logo_url" type="url" defaultValue={company.logo_url ?? ""} className={input} />
          </label>
          <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
            Short description
            <textarea name="description" rows={3} defaultValue={company.description ?? ""} className={input} />
          </label>
          <button
            type="submit"
            disabled={coPending}
            className="w-fit rounded-lg bg-amber-800 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
          >
            {coPending ? "Saving…" : "Save company"}
          </button>
        </form>
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="font-semibold text-stone-900">Roles & connector submissions</h2>
        <p className="mt-1 text-sm text-stone-600">
          Public job pages omit referral bonuses. Connectors submit candidates against active roles; submissions
          appear below per role.
        </p>

        {roles.length === 0 ? (
          <p className="mt-6 text-sm text-stone-500">
            No roles yet. Use <span className="font-medium text-stone-700">Add or edit roles</span> below to
            create one.
          </p>
        ) : (
          <ul className="mt-6 space-y-8">
            {roles.map((r) => {
              const publicUrl = `${siteBaseUrl}/r/${encodeURIComponent(r.slug)}`;
              const subs = referralsByRole.get(r.id) ?? [];
              return (
                <li key={r.id} className="border-t border-stone-100 pt-6 first:border-t-0 first:pt-0">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="text-lg font-semibold text-stone-900">{r.title}</h3>
                      <p className="mt-0.5 text-sm text-stone-500">
                        <span className="font-medium capitalize text-stone-700">{r.status}</span>
                        {r.location ? ` · ${r.location}` : null}
                      </p>
                    </div>
                    <a
                      href={publicUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="shrink-0 text-sm font-medium text-amber-800 hover:underline"
                    >
                      View public page →
                    </a>
                  </div>

                  {r.description ? (
                    <div className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">
                      {r.description}
                    </div>
                  ) : (
                    <p className="mt-4 text-sm text-stone-400">No role description.</p>
                  )}

                  {r.referral_bonus ? (
                    <div className="mt-4 rounded-lg border border-amber-200/80 bg-amber-50/50 px-3 py-2">
                      <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-900/80">
                        Referral bonus
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-stone-800">{r.referral_bonus}</p>
                    </div>
                  ) : null}

                  <div className="mt-4 rounded-lg border border-stone-200 bg-stone-50/80 p-4">
                    <p className="text-xs font-medium text-stone-700">Public job link</p>
                    <div className="mt-2">
                      <CopyPublicLinkButton url={publicUrl} label="Copy public link" />
                    </div>
                  </div>

                  <div className="mt-6">
                    <h4 className="text-sm font-semibold text-stone-900">
                      Submissions ({subs.length})
                    </h4>
                    {subs.length === 0 ? (
                      <p className="mt-2 text-sm text-stone-500">No referrals for this role yet.</p>
                    ) : (
                      <ul className="mt-3 space-y-4">
                        {subs.map((ref) => {
                          const rel = relationshipDisplay(ref.relationship_type, ref.relationship_other);
                          return (
                            <li
                              key={ref.id}
                              className="rounded-lg border border-stone-200 bg-white px-4 py-3 text-sm shadow-sm"
                            >
                              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
                                <span className="flex flex-wrap items-center gap-x-2 gap-y-1">
                                  {ref.connector_name ? (
                                    <>
                                      From{" "}
                                      <span className="font-medium text-stone-700">{ref.connector_name}</span>
                                      {ensureHttpsUrl(ref.connector_linkedin_url) ? (
                                        <>
                                          <span className="text-stone-300">·</span>
                                          <a
                                            href={ensureHttpsUrl(ref.connector_linkedin_url)!}
                                            className="font-medium text-amber-800 hover:underline"
                                            target="_blank"
                                            rel="noreferrer"
                                          >
                                            Connector LinkedIn
                                          </a>
                                        </>
                                      ) : null}
                                    </>
                                  ) : (
                                    "Connector"
                                  )}
                                </span>
                                <time dateTime={ref.created_at}>
                                  {new Date(ref.created_at).toLocaleString(undefined, {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })}
                                </time>
                              </div>
                              {ref.candidate_name ? (
                                <p className="mt-2 font-medium text-stone-900">{ref.candidate_name}</p>
                              ) : null}
                              {ref.candidate_email ? (
                                <p className="mt-0.5 font-mono text-xs text-stone-600">{ref.candidate_email}</p>
                              ) : null}
                              <p className="mt-2 font-mono text-xs">
                                <a
                                  href={ref.candidate_linkedin_url}
                                  className="text-amber-900 hover:underline"
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {ref.candidate_linkedin_url}
                                </a>
                              </p>
                              {rel ? <p className="mt-2 text-xs text-stone-600">Relationship: {rel}</p> : null}
                              <p className="mt-2 text-stone-700">{ref.fit_description}</p>
                              <ReferralResponseForm
                                referralId={ref.id}
                                referralStage={ref.referral_stage}
                                reasonPreset={ref.company_reason_preset}
                                reasonNote={ref.company_reason_note}
                                respondedAt={ref.company_responded_at}
                              />
                            </li>
                          );
                        })}
                      </ul>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>

      <section className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
        <button
          type="button"
          onClick={() => setShowRoleManagement((v) => !v)}
          className="flex w-full items-center justify-between text-left font-semibold text-stone-900"
        >
          <span>Add or edit roles</span>
          <span className="text-stone-400">{showRoleManagement ? "−" : "+"}</span>
        </button>
        {showRoleManagement ? (
          <div className="mt-4 border-t border-stone-100 pt-4">
            <div className="mb-4">
              <Flash s={urState} />
            </div>
            <ul className="divide-y divide-stone-100">
              {roles.length === 0 ? (
                <li className="py-4 text-sm text-stone-500">No roles yet — add one below.</li>
              ) : (
                roles.map((r) => (
                  <Fragment key={r.id}>
                    <li className="flex flex-wrap items-center justify-between gap-2 py-4">
                      <div>
                        <p className="font-medium text-stone-900">{r.title}</p>
                        <p className="text-xs text-stone-500">
                          {r.status} · {r.slug}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setEditId(editId === r.id ? null : r.id)}
                        className="text-sm font-medium text-amber-800 hover:underline"
                      >
                        {editId === r.id ? "Cancel" : "Edit"}
                      </button>
                    </li>
                    {editId === r.id ? (
                      <li className="border-t border-amber-100 bg-amber-50/40 px-0 py-4">
                        <form action={urAction} className="grid gap-3">
                          <input type="hidden" name="role_id" value={r.id} />
                          <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
                            Title
                            <input name="title" required defaultValue={r.title} className={input} />
                          </label>
                          <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
                            Description
                            <textarea
                              name="description"
                              rows={3}
                              defaultValue={r.description ?? ""}
                              className={input}
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
                            Location
                            <input name="location" defaultValue={r.location ?? ""} className={input} />
                          </label>
                          <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
                            Referral bonus{" "}
                            <span className="font-normal text-stone-500">(connectors only; not on public link)</span>
                            <textarea
                              name="referral_bonus"
                              rows={2}
                              defaultValue={r.referral_bonus ?? ""}
                              className={input}
                              placeholder="e.g. $5k for successful hire"
                            />
                          </label>
                          <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
                            Status
                            <select name="status" className={input} defaultValue={r.status}>
                              <option value="draft">Draft</option>
                              <option value="active">Active</option>
                              <option value="closed">Closed</option>
                            </select>
                          </label>
                          <button
                            type="submit"
                            disabled={urPending}
                            className="w-fit rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                          >
                            {urPending ? "Saving…" : "Save role"}
                          </button>
                        </form>
                      </li>
                    ) : null}
                  </Fragment>
                ))
              )}
            </ul>

            <div className="mt-8 border-t border-stone-200 pt-6">
              <h3 className="text-sm font-semibold text-stone-900">Add role</h3>
              <div className="mt-2">
                <Flash s={crState} />
              </div>
              <form key={crFormKey} action={crAction} className="mt-4 grid gap-3">
                <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
                  Title
                  <input name="title" required className={input} />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
                  Description
                  <textarea name="description" rows={3} className={input} />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
                  Location
                  <input name="location" className={input} />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
                  Referral bonus{" "}
                  <span className="font-normal text-stone-500">(not shown on public job page)</span>
                  <textarea name="referral_bonus" rows={2} className={input} />
                </label>
                <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
                  Status
                  <select name="status" className={input} defaultValue="draft">
                    <option value="draft">Draft</option>
                    <option value="active">Active</option>
                    <option value="closed">Closed</option>
                  </select>
                </label>
                <button
                  type="submit"
                  disabled={crPending}
                  className="w-fit rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white disabled:opacity-60"
                >
                  {crPending ? "Creating…" : "Create role"}
                </button>
              </form>
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
