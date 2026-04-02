import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutManager } from "@/app/actions/manager";
import { LogoWordmark } from "@/components/brand-logo";
import { getProfileIdFromSession } from "@/lib/session/profile";
import { getSessionProfileRow } from "@/lib/session/session-profile";

export const metadata = {
  title: "My activity | Warmpath",
  description: "Roles you applied to, were referred to, or referred others for.",
};

export default async function ConnectProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profileId = await getProfileIdFromSession();
  if (!profileId) redirect("/login");

  const row = await getSessionProfileRow();
  if (!row) redirect("/login?error=no_profile");
  if (row.account_role !== "connector") {
    redirect("/hire/dashboard");
  }

  return (
    <div className="min-h-full bg-warm-canvas">
      <div className="h-1 bg-gradient-to-r from-teal-600 via-emerald-500 to-warm-accent" aria-hidden />
      <div className="border-b border-stone-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <LogoWordmark href="/" markSize={30} />
            <span className="hidden text-stone-300 sm:inline">|</span>
            <span className="hidden text-xs font-medium uppercase tracking-wider text-warm-muted sm:inline">
              Connector
            </span>
          </div>
          <nav className="flex flex-wrap items-center gap-2 md:gap-1">
            <Link
              href="/connect/dashboard"
              className="rounded-lg px-3 py-2 text-sm font-medium text-warm-ink hover:bg-stone-100"
            >
              My activity
            </Link>
            <Link
              href="/"
              className="rounded-lg px-3 py-2 text-sm font-medium text-warm-muted hover:bg-stone-100 hover:text-warm-ink"
            >
              Home
            </Link>
            <form action={logoutManager} className="inline md:ml-2">
              <button
                type="submit"
                className="rounded-lg px-3 py-2 text-sm font-medium text-warm-muted hover:bg-stone-100 hover:text-warm-accent"
              >
                Log out
              </button>
            </form>
          </nav>
        </div>
      </div>
      <div className="mx-auto max-w-5xl px-6 pb-20 pt-10">{children}</div>
    </div>
  );
}
