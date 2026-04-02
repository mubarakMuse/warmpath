"use client";

import { MagicLinkAuth } from "@/components/magic-link-auth";
import { GoogleSignInButton } from "@/components/google-sign-in-button";

type Props = {
  returnPath: string;
};

/** Shown when a visitor must sign in before apply / refer. */
export function RoleApplyAuthGate({ returnPath }: Props) {
  return (
    <div className="rounded-3xl border border-stone-200 bg-stone-50/80 p-6 shadow-sm sm:p-8">
      <h2 className="text-lg font-semibold text-warm-ink">Sign in to respond</h2>
      <p className="mt-2 text-sm leading-relaxed text-warm-muted">
        Apply for yourself or refer someone using the email on your account. Use Google or a
        one-time magic link—we’ll use that email on your submission.
      </p>
      <div className="mt-6 space-y-6">
        <GoogleSignInButton intent="connector" returnTo={returnPath} label="Continue with Google" />
        <div className="relative">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wide">
            <span className="bg-white px-3 text-warm-muted">Or email link</span>
          </div>
        </div>
        <MagicLinkAuth intent="connector" returnTo={returnPath} />
      </div>
    </div>
  );
}
