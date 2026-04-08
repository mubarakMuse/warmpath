"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { companyCodeLogin, type CompanyFormState } from "@/app/actions/company";

const initial: CompanyFormState = {};

export function CompanyLoginForm() {
  const [state, formAction, pending] = useActionState(companyCodeLogin, initial);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <form action={formAction} className="mx-auto mt-8 max-w-sm space-y-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-stone-800">Company access code</span>
        <input
          name="access_code"
          required
          autoComplete="off"
          className="min-h-11 rounded-lg border border-stone-200 px-3 font-mono text-sm uppercase tracking-wide outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
          placeholder="From your admin"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 w-full rounded-lg bg-amber-800 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Continue"}
      </button>
    </form>
  );
}
