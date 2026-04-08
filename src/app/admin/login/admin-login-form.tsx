"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { adminPasswordLogin, type FormState } from "@/app/actions/admin";

const initial: FormState = {};

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminPasswordLogin, initial);

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  return (
    <form action={formAction} className="mx-auto mt-8 max-w-sm space-y-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-stone-800">Admin password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className="min-h-11 rounded-lg border border-stone-200 px-3 outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 w-full rounded-lg bg-stone-900 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
