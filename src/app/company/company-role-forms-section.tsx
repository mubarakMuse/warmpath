"use client";

import { useActionState, useEffect, useState, Fragment } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  companyCreateRole,
  companyUpdateRole,
  type CompanyFormState,
} from "@/app/actions/company";
import type { PortalRole } from "@/app/company/types";

const initial: CompanyFormState = {};

const input =
  "min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20";

function Flash({ s }: { s: CompanyFormState }) {
  if (s.error) return <p className="text-sm text-red-700">{s.error}</p>;
  return null;
}

export function CompanyRoleFormsSection({ roles }: { roles: PortalRole[] }) {
  const [crState, crAction, crPending] = useActionState(companyCreateRole, initial);
  const [urState, urAction, urPending] = useActionState(companyUpdateRole, initial);
  const [editId, setEditId] = useState<string | null>(null);
  const [crFormKey, setCrFormKey] = useState(0);
  const router = useRouter();

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
    <div className="space-y-10">
      <div>
        <h3 className="text-sm font-semibold text-stone-900">Existing roles</h3>
        <p className="mt-1 text-sm text-stone-600">Edit copy, status, location, or referral bonus.</p>
        <div className="mt-4">
          <Flash s={urState} />
        </div>
        <ul className="mt-4 divide-y divide-stone-100 rounded-xl border border-stone-200 bg-stone-50/50">
          {roles.length === 0 ? (
            <li className="px-4 py-8 text-center text-sm text-stone-500">No roles yet — add one below.</li>
          ) : (
            roles.map((r) => (
              <Fragment key={r.id}>
                <li className="flex flex-wrap items-center justify-between gap-3 px-4 py-4">
                  <div className="min-w-0">
                    <p className="font-medium text-stone-900">{r.title}</p>
                    <p className="text-xs text-stone-500">
                      <span className="capitalize text-stone-700">{r.status}</span> · {r.slug}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setEditId(editId === r.id ? null : r.id)}
                    className="shrink-0 text-sm font-medium text-amber-800 hover:underline"
                  >
                    {editId === r.id ? "Cancel" : "Edit"}
                  </button>
                </li>
                {editId === r.id ? (
                  <li className="border-t border-amber-100 bg-amber-50/30 px-4 py-5">
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
                        <span className="font-normal text-stone-500">(connectors only; not on public page)</span>
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
      </div>

      <div className="border-t border-stone-200 pt-10">
        <h3 className="text-sm font-semibold text-stone-900">Add role</h3>
        <p className="mt-1 text-sm text-stone-600">Create a new opening; set to active when ready for connectors.</p>
        <div className="mt-4">
          <Flash s={crState} />
        </div>
        <form key={crFormKey} action={crAction} className="mt-4 grid max-w-xl gap-3">
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
            Referral bonus <span className="font-normal text-stone-500">(not on public job page)</span>
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
  );
}
