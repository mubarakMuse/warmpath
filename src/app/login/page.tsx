import Link from "next/link";
import { LogoMark } from "@/components/brand-logo";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { MagicLinkAuth } from "@/components/magic-link-auth";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";

export const metadata = {
  title: "Sign in | Warmpath",
  description: "Sign in or sign up to apply, refer, or browse—with Google or an email magic link.",
};

type Props = {
  searchParams: Promise<{ error?: string }>;
};

const LOGIN_ERROR_HINTS: Record<string, string> = {
  config: "Server configuration error. Check environment variables.",
  missing_code: "Sign-in was cancelled or incomplete. Try again.",
  admin: "You need admin access to open that page. Set WARMPATH_ADMIN_EMAILS or use an admin profile.",
};

export default async function LoginPage({ searchParams }: Props) {
  const q = await searchParams;
  let errorMessage: string | null = null;
  if (q.error) {
    try {
      const decoded = decodeURIComponent(q.error);
      errorMessage = LOGIN_ERROR_HINTS[decoded] ?? decoded;
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
          Warmpath
        </p>
        <h1 className="mt-2 text-center font-serif text-3xl font-semibold text-warm-ink">
          Log in or sign up
        </h1>
        <p className="mx-auto mt-6 max-w-md text-center text-sm leading-relaxed text-warm-muted">
          For <strong className="font-medium text-warm-ink">applying and referring</strong> on role
          pages. New accounts here start as connectors. We’ll save your name and photo from Google to your
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
          <GoogleSignInButton
            intent="connector"
            returnTo="/connect/dashboard"
            label="Continue with Google"
          />
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
          Enter your email and we’ll send a link. First time counts as sign up; returning visitors sign
          in the same way.
        </p>
        <div className="mt-6">
          <MagicLinkAuth intent="connector" returnTo="/connect/dashboard" />
        </div>
        <p className="mt-10 text-center text-sm text-warm-muted">
          <strong className="font-medium text-warm-ink">Posting or hiring?</strong>{" "}
          <Link href="/hire/sign-up" className="font-medium text-warm-accent hover:underline">
            Create a hiring account
          </Link>{" "}
          (separate sign-in).
        </p>
        <p className="mt-6 text-center text-sm text-warm-muted">
          <Link href="/" className="font-medium text-warm-accent hover:underline">
            ← Back to home
          </Link>
        </p>
      </main>
      <SiteFooter />
    </div>
  );
}
