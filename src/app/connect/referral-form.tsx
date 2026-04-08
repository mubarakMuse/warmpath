"use client";

import { useActionState, useEffect, useState } from "react";
import { toast } from "sonner";
import { connectorSubmitReferral, type ConnectFormState } from "@/app/actions/connect";
import { RELATIONSHIP_OPTIONS } from "@/lib/relationship-options";

const initial: ConnectFormState = {};

const input =
  "min-h-10 w-full rounded-lg border border-stone-200 bg-white px-3 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20";

export function ReferralForm({ roleId }: { roleId: string }) {
  const [formKey, setFormKey] = useState(0);
  const [state, action, pending] = useActionState(connectorSubmitReferral, initial);
  const [relType, setRelType] = useState("");

  useEffect(() => {
    if (state.error) toast.error(state.error);
  }, [state.error]);

  useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      setFormKey((k) => k + 1);
      setRelType("");
    }
  }, [state.ok, state.message]);

  return (
    <form key={formKey} action={action} className="grid gap-4">
      <input type="hidden" name="role_id" value={roleId} />
      <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
        Candidate LinkedIn URL
        <input
          name="candidate_linkedin_url"
          type="url"
          required
          className={input}
          placeholder="https://www.linkedin.com/in/…"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
        Why they fit
        <textarea
          name="fit_description"
          required
          rows={5}
          minLength={20}
          className={input}
          placeholder="A few sentences on strengths and fit for this role."
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
        Candidate name <span className="font-normal text-stone-500">(optional)</span>
        <input name="candidate_name" className={input} placeholder="If you want to flag who this is" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
        Candidate email <span className="font-normal text-stone-500">(optional)</span>
        <input name="candidate_email" type="email" className={input} placeholder="name@example.com" />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
        How you know each other <span className="font-normal text-stone-500">(optional)</span>
        <select
          name="relationship_type"
          className={input}
          value={relType}
          onChange={(e) => setRelType(e.target.value)}
        >
          {RELATIONSHIP_OPTIONS.map((o) => (
            <option key={o.value || "skip"} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </label>
      {relType === "other" ? (
        <label className="flex flex-col gap-1 text-xs font-medium text-stone-700">
          Describe how you know them
          <textarea name="relationship_other" required rows={2} className={input} placeholder="Required when you choose Other" />
        </label>
      ) : (
        <input type="hidden" name="relationship_other" value="" />
      )}
      <button
        type="submit"
        disabled={pending}
        className="min-h-11 w-full rounded-lg bg-amber-800 text-sm font-semibold text-white hover:bg-amber-900 disabled:opacity-60"
      >
        {pending ? "Submitting…" : "Submit referral"}
      </button>
    </form>
  );
}
