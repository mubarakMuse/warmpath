import Link from "next/link";
import { Suspense } from "react";
import { logoutManager } from "@/app/actions/manager";
import { LogoWordmark } from "@/components/brand-logo";
import { getHeaderSessionUser } from "@/lib/session/session-profile";

type Props = {
  /** When true, omit border (e.g. nested in another shell). */
  plain?: boolean;
};

type HeaderUser = NonNullable<Awaited<ReturnType<typeof getHeaderSessionUser>>>;

function SiteHeaderShell({ plain, user }: Props & { user: HeaderUser | null }) {
  return (
    <header
      className={
        plain
          ? ""
          : "border-b border-stone-200/80 bg-warm-canvas/90 backdrop-blur-sm"
      }
    >
      <div className="mx-auto flex h-16 max-w-5xl items-center justify-between gap-4 px-6">
        <div className="flex min-w-0 flex-1 items-center gap-3">
          {user ? (
            <Link
              href={user.dashboardHref}
              className="group relative shrink-0"
              title={`${user.full_name} — open dashboard`}
            >
              {user.avatar_url ? (
                // eslint-disable-next-line @next/next/no-img-element -- OAuth / user-supplied URLs
                <img
                  src={user.avatar_url}
                  alt=""
                  className="h-9 w-9 rounded-full object-cover ring-2 ring-stone-200 transition group-hover:ring-warm-accent/50"
                />
              ) : (
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-warm-accent text-sm font-bold text-white ring-2 ring-stone-200 transition group-hover:ring-warm-accent/50">
                  {user.full_name.trim().slice(0, 1).toUpperCase() || "?"}
                </span>
              )}
            </Link>
          ) : null}
          <LogoWordmark />
          {user ? (
            <div className="hidden min-w-0 sm:block">
              <p className="truncate text-sm font-medium text-warm-ink">{user.full_name}</p>
              <Link
                href={user.dashboardHref}
                className="text-xs font-medium text-warm-accent hover:underline"
              >
                Dashboard
              </Link>
            </div>
          ) : null}
        </div>
        <nav className="flex flex-wrap items-center justify-end gap-x-4 gap-y-2 text-sm font-medium text-warm-muted">
          <Link href="/for-companies" className="transition hover:text-warm-accent">
            For companies
          </Link>
          <Link href="/hire" className="transition hover:text-warm-accent">
            Hiring
          </Link>
          {user ? (
            <>
              <Link
                href={user.dashboardHref}
                className="sm:hidden rounded-full bg-warm-accent px-3 py-1.5 text-white transition hover:bg-warm-accent-hover"
              >
                Dashboard
              </Link>
              <form action={logoutManager} className="inline">
                <button
                  type="submit"
                  className="rounded-full border border-stone-300 bg-white px-3 py-1.5 text-warm-ink transition hover:bg-stone-50"
                >
                  Log out
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="rounded-full bg-warm-accent px-4 py-2 text-white transition hover:bg-warm-accent-hover"
            >
              Log in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}

async function SiteHeaderWithUser({ plain }: Props) {
  const user = await getHeaderSessionUser();
  return <SiteHeaderShell plain={plain} user={user} />;
}

export function SiteHeader(props: Props) {
  return (
    <Suspense fallback={<SiteHeaderShell {...props} user={null} />}>
      <SiteHeaderWithUser {...props} />
    </Suspense>
  );
}
