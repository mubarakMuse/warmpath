import Link from "next/link";
import { redirect } from "next/navigation";
import { logoutManager } from "@/app/actions/manager";
import { LogoWordmark } from "@/components/brand-logo";
import { getProfileIdFromSession } from "@/lib/session/profile";
import { getSessionProfileRow } from "@/lib/session/session-profile";

export default async function HireProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const profileId = await getProfileIdFromSession();
  if (!profileId) redirect("/hire/sign-up");

  const row = await getSessionProfileRow();
  if (!row) redirect("/hire/sign-up");
  if (row.account_role === "connector") {
    redirect("/connect/dashboard");
  }
  if (row.account_role !== "hirer" && row.account_role !== "admin") {
    redirect("/hire/sign-up");
  }

  return (
    <div className="min-h-full bg-warm-canvas">
      <div className="h-1 bg-gradient-to-r from-warm-accent via-orange-400 to-amber-600" aria-hidden />
      <div className="border-b border-stone-200/80 bg-white/80 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <LogoWordmark href="/hire/dashboard" markSize={30} />
            <span className="hidden text-stone-300 sm:inline">|</span>
            <span className="hidden text-xs font-medium uppercase tracking-wider text-warm-muted sm:inline">
              Hiring
            </span>
          </div>
          <nav className="flex flex-wrap items-center gap-2 md:gap-1">
            <Link
              href="/hire/dashboard"
              className="rounded-lg px-3 py-2 text-sm font-medium text-warm-ink hover:bg-stone-100"
            >
              Dashboard
            </Link>
            <Link
              href="/hire/settings"
              className="rounded-lg px-3 py-2 text-sm font-medium text-warm-muted hover:bg-stone-100 hover:text-warm-ink"
            >
              Profile
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
