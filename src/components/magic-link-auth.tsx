"use client";

import { useState } from "react";
import { buildAuthCallbackUrl } from "@/lib/auth/callback-url";
import type { GoogleAuthIntent } from "@/components/google-sign-in-button";
import { createClient } from "@/lib/supabase/client";

type Props = {
  intent: GoogleAuthIntent;
  returnTo: string;
  className?: string;
};

export function MagicLinkAuth({ intent, returnTo, className = "" }: Props) {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setMessage(null);
    const trimmed = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
      setError("Enter a valid email.");
      return;
    }
    setPending(true);
    try {
      const supabase = createClient();
      const origin = window.location.origin;
      const emailRedirectTo = buildAuthCallbackUrl(origin, returnTo, intent);
      const { error: otpError } = await supabase.auth.signInWithOtp({
        email: trimmed,
        options: {
          emailRedirectTo,
          shouldCreateUser: true,
        },
      });
      if (otpError) {
        setError(otpError.message);
        setPending(false);
        return;
      }
      setMessage("Check your email for the sign-in link. You can close this tab.");
    } catch {
      setError("Could not send the link. Try again.");
    }
    setPending(false);
  }

  return (
    <form onSubmit={handleSubmit} className={`flex flex-col gap-2 ${className}`}>
      <label className="flex flex-col gap-1 text-sm">
        <span className="font-medium text-warm-ink">Email (magic link)</span>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          placeholder="you@company.com"
          className="min-h-11 rounded-lg border border-stone-200 bg-white px-3 text-stone-900 outline-none focus:border-warm-accent focus:ring-2 focus:ring-warm-accent/20"
        />
      </label>
      <button
        type="submit"
        disabled={pending}
        className="inline-flex min-h-11 items-center justify-center rounded-lg border border-stone-300 bg-white px-4 text-sm font-semibold text-warm-ink hover:bg-stone-50 disabled:opacity-60"
      >
        {pending ? "Sending…" : "Email me a sign-in link"}
      </button>
      {error ? (
        <p className="text-sm text-red-700" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="text-sm text-green-800" role="status">
          {message}
        </p>
      ) : null}
    </form>
  );
}
