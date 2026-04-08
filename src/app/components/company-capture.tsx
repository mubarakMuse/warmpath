"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { saveCompanyInterest, type CompanyInterestState } from "@/app/actions/company-interest";

const initial: CompanyInterestState = {};

export function CompanyCapture() {
  const [formKey, setFormKey] = useState(0);
  const [state, formAction, pending] = useActionState(saveCompanyInterest, initial);

  useEffect(() => {
    if (state && "error" in state && state.error) toast.error(state.error);
  }, [state]);

  useEffect(() => {
    if (state && "ok" in state && state.ok) {
      toast.success("You’re on the list. We’ll be in touch.");
      setFormKey((k) => k + 1);
    }
  }, [state]);

  return (
    <div className="mx-auto mt-10 w-full rounded-2xl border border-stone-200/90 bg-white/90 p-6 shadow-sm backdrop-blur-sm md:p-8">
      <form key={formKey} action={formAction} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-800">
          Company name
          <input
            name="company_name"
            type="text"
            required
            autoComplete="organization"
            placeholder="Acme Inc."
            className="min-h-11 rounded-xl border border-stone-200 bg-white px-3 text-stone-900 placeholder:text-stone-400 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/25"
          />
        </label>
        <label className="flex flex-col gap-1.5 text-sm font-medium text-stone-800">
          Work email
          <input
            name="email"
            type="email"
            required
            autoComplete="email"
            placeholder="you@company.com"
            className="min-h-11 rounded-xl border border-stone-200 bg-white px-3 text-stone-900 placeholder:text-stone-400 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/25"
          />
        </label>
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-xl bg-warm-ink text-sm font-semibold text-white transition hover:bg-stone-800 disabled:opacity-60"
        >
          {pending ? "Sending…" : "Join waitlist"}
        </button>
      </form>
    </div>
  );
}
