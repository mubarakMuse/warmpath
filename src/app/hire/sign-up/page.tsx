import Link from "next/link";
import { LogoMark } from "@/components/brand-logo";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { MagicLinkAuth } from "@/components/magic-link-auth";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Hiring account | Warmpath",
  description: "Sign up or sign in as a hiring manager with Google or an email magic link.",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

const ERROR_HINTS: Record<string, string> = {
  config: "Server configuration error. Check environment variables.",
  missing_code: "Sign-in was cancelled or incomplete. Try again.",
  admin: "You need admin access to open that page. Set WARMPATH_ADMIN_EMAILS or use an admin profile.",
};

export default async function HireSignUpPage({ searchParams }: Props) {
  const q = await searchParams;
  let errorMessage: string | null = null;
  if (q.error) {
    try {
      const decoded = decodeURIComponent(q.error);
      errorMessage = ERROR_HINTS[decoded] ?? decoded;
    } catch {
      errorMessage = q.error;
    }
  }

  return (
    <div className="flex min-h-full flex-col bg-warm-canvas">
      <SiteHeader />
      <main className="mx-auto w-full max-w-lg flex-1 px-6 py-14">
        <div className="flex justify-center">
          <LogoMark size={52} aria-hidden />
        </div>
        <p className="mt-6 text-center text-xs font-semibold uppercase tracking-widest text-warm-accent">
          Hiring on Warmpath
        </p>
        <h1 className="mt-2 text-center font-serif text-3xl font-semibold text-warm-ink">
          Create your hiring account
        </h1>
        <p className="mx-auto mt-6 max-w-md text-center text-sm leading-relaxed text-warm-muted">
          For <strong className="font-medium text-warm-ink">posting roles and reviewing applicants</strong>.
          New accounts here are hiring managers. We’ll save your name and photo from Google to your
          profile.
        </p>
        {errorMessage ? (
          <p
            className="mt-6 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-center text-sm text-red-800"
            role="alert"
          >
            {errorMessage}
          </p>
        ) : null}
        <div className="mt-8">
          <GoogleSignInButton intent="hire" returnTo="/hire/dashboard" label="Continue with Google" />
        </div>
        <div className="relative my-8">
          <div className="absolute inset-0 flex items-center" aria-hidden>
            <div className="w-full border-t border-stone-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase tracking-wide">
            <span className="bg-warm-canvas px-3 text-warm-muted">Or</span>
          </div>
        </div>
        <h2 className="text-center text-lg font-semibold text-warm-ink">Email magic link</h2>
        <p className="mx-auto mt-2 max-w-md text-center text-sm leading-relaxed text-warm-muted">
          Use your work email. First time creates a hiring account; returning hiring managers sign in
          the same way.
        </p>
        <div className="mt-6">
          <MagicLinkAuth intent="hire" returnTo="/hire/dashboard" />
        </div>
        <p className="mt-10 text-center text-sm text-warm-muted">
          Applying or referring on a job link?{" "}
          <Link href="/login" className="font-medium text-warm-accent hover:underline">
            Use the general sign-in
          </Link>{" "}
          instead.
        </p>
        <p className="mt-6 text-center text-sm text-warm-muted">
          <Link href="/hire" className="font-medium text-warm-accent hover:underline">
            ← Hiring overview
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
