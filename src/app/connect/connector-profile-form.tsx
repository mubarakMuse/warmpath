"use client";

import { useActionState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { connectorUpdateProfile, type ConnectFormState } from "@/app/actions/connect";
import type { ConnectorMe } from "@/app/connect/types";

const initial: ConnectFormState = {};

const input =
  "min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20";

export function ConnectorProfileForm({
  me,
  onSaved,
  className = "mt-4 grid gap-3",
}: {
  me: ConnectorMe;
  onSaved?: () => void;
  className?: string;
}) {
  const router = useRouter();
  const [state, action, pending] = useActionState(connectorUpdateProfile, initial);
  const onSavedRef = useRef(onSaved);
  onSavedRef.current = onSaved;

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      router.refresh();
      onSavedRef.current?.();
    }
  }, [state.ok, state.message, router]);

  const formKey = `${me.full_name}|${me.email ?? ""}|${me.role_title ?? ""}|${me.linkedin_url ?? ""}`;

  return (
    <form key={formKey} action={action} className={className}>
      <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
        Full name
        <input name="full_name" required defaultValue={me.full_name} className={input} />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
        Role / title <span className="font-normal text-stone-500">(optional)</span>
        <input name="role_title" defaultValue={me.role_title ?? ""} className={input} placeholder="e.g. Engineering Manager" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
        Email <span className="font-normal text-stone-500">(optional)</span>
        <input name="email" type="email" defaultValue={me.email ?? ""} className={input} placeholder="you@example.com" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
        LinkedIn profile <span className="font-normal text-stone-500">(optional)</span>
        <input
          name="linkedin_url"
          type="url"
          defaultValue={me.linkedin_url ?? ""}
          className={input}
          placeholder="https://www.linkedin.com/in/…"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="w-fit rounded-lg bg-stone-900 px-4 py-2 text-sm font-semibold text-white hover:bg-stone-800 disabled:opacity-60"
      >
        {pending ? "Saving…" : "Save profile"}
      </button>
    </form>
  );
}
