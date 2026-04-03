import Link from "next/link";
import { notFound } from "next/navigation";
import { logoutManager } from "@/app/actions/manager";
import { ApplyForm } from "@/components/apply-form";
import { GoogleSignInButton } from "@/components/google-sign-in-button";
import { PublicRoleHero } from "@/components/public-role-hero";
import { roleAcceptsSubmissions } from "@/lib/role-status";
import { helpHireHeading } from "@/lib/hirer";
import { loadPublicRoleBySlug } from "@/lib/public-role";
import { createClient } from "@/lib/supabase/server";
import { getSessionProfileRow } from "@/lib/session/session-profile";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ error?: string }>;
};

export default async function PublicRolePage({ params, searchParams }: Props) {
  const { slug } = await params;
  const q = await searchParams;
  let oauthError: string | null = null;
  if (q.error) {
    try {
      oauthError = decodeURIComponent(q.error);
    } catch {
      oauthError = q.error;
    }
  }

  if (
    !process.env.NEXT_PUBLIC_SUPABASE_URL ||
    !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    !process.env.SUPABASE_SERVICE_ROLE_KEY
  ) {
    return (
      <div className="mx-auto max-w-lg px-6 py-20 text-center text-sm text-red-800">
        Supabase is not configured. Add URL, anon key, and{" "}
        <code className="rounded bg-red-100 px-1">SUPABASE_SERVICE_ROLE_KEY</code> to{" "}
        <code className="rounded bg-red-100 px-1">.env.local</code>.
      </div>
    );
  }

  try {
    await createClient();
  } catch {
    notFound();
  }

  const role = await loadPublicRoleBySlug(slug);
  if (!role) notFound();

  const accepting = roleAcceptsSubmissions(role.status);
  const sessionRow = await getSessionProfileRow();
  const returnPath = `/r/${slug}`;

  return (
    <div className="min-h-full bg-warm-canvas">
      <header className="border-b border-stone-200/80 bg-warm-canvas/90 backdrop-blur-sm">
        <div className="mx-auto flex min-h-14 max-w-6xl flex-col gap-3 px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
          <Link href="/" className="font-serif text-lg font-semibold tracking-tight text-warm-ink">
            Warmpath
          </Link>
          <div className="flex flex-wrap items-center gap-3">
            {sessionRow ? (
              <>
                <span className="text-sm text-warm-muted">
                  {sessionRow.account_role === "connector" ? "Connector" : "Hiring"} ·{" "}
                  <span className="font-medium text-warm-ink">{sessionRow.full_name}</span>
                </span>
                {sessionRow.account_role === "connector" ? (
                  <Link
                    href="/connect/dashboard"
                    className="text-sm font-semibold text-warm-accent hover:underline"
                  >
                    My activity
                  </Link>
                ) : (
                  <Link
                    href="/hire/dashboard"
                    className="text-sm font-semibold text-warm-accent hover:underline"
                  >
                    Dashboard
                  </Link>
                )}
                <form action={logoutManager} className="inline">
                  <button
                    type="submit"
                    className="text-sm font-semibold text-warm-muted hover:text-warm-accent"
                  >
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <GoogleSignInButton
                  intent="connector"
                  returnTo={returnPath}
                  label="Connector log in"
                />
                <Link
                  href="/hire/sign-up"
                  className="text-sm font-semibold text-warm-muted hover:text-warm-accent"
                >
                  Hiring sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-10 lg:py-14">
        {oauthError ? (
          <p
            className="mb-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {oauthError}
          </p>
        ) : null}
        <div className="grid gap-12 lg:grid-cols-[1fr_min(26rem,100%)] lg:items-start lg:gap-16">
          <PublicRoleHero role={role} />

          <aside className="min-w-0 lg:sticky lg:top-8">
            <div className="rounded-3xl border border-stone-200/80 bg-white p-6 shadow-lg ring-1 ring-stone-200/60 sm:p-8">
              <ApplyForm
                roleId={role.id}
                roleTitle={role.title}
                panelTitle={helpHireHeading(role.hirer_full_name)}
                matchBonus={role.match_bonus}
                accepting={accepting}
                submitterEmail={sessionRow?.email ?? null}
                returnPath={returnPath}
                activityDashboardHref={
                  sessionRow?.account_role === "connector" ? "/connect/dashboard" : null
                }
              />
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
