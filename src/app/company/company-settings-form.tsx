"use client";

import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { companyUpdateDetails, type CompanyFormState } from "@/app/actions/company";
import type { PortalCompany } from "@/app/company/types";

const initial: CompanyFormState = {};

const input =
  "min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20";

function Flash({ s }: { s: CompanyFormState }) {
  if (s.error) return <p className="text-sm text-red-700">{s.error}</p>;
  return null;
}

export function CompanySettingsForm({ company }: { company: PortalCompany }) {
  const [state, action, pending] = useActionState(companyUpdateDetails, initial);
  const [formKey, setFormKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.ok && state.message) {
      toast.success(state.message);
      setFormKey((k) => k + 1);
      router.refresh();
    }
  }, [state, router]);

  return (
    <div>
      <Flash s={state} />
      <form key={formKey} action={action} className="mt-4 grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs font-medium text-stone-700 sm:col-span-2">
          Company name
          <input name="name" required defaultValue={company.name} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-stone-700 sm:col-span-2">
          URL slug
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
        <label className="flex flex-col gap-1 text-xs font-medium text-stone-700 sm:col-span-2">
          Logo URL
          <input name="logo_url" type="url" defaultValue={company.logo_url ?? ""} className={input} />
        </label>
        <label className="flex flex-col gap-1 text-xs font-medium text-stone-700 sm:col-span-2">
          Short description
          <textarea name="description" rows={4} defaultValue={company.description ?? ""} className={input} />
        </label>
        <div className="sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="rounded-lg bg-amber-800 px-5 py-2.5 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Save changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
