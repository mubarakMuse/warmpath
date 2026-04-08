"use client";

import Link from "next/link";
import { companyLogout } from "@/app/actions/company";
import { PortalNavLink } from "@/app/components/shell/portal-nav-link";

export function CompanyAppShell({
  companyName,
  accessCode,
  children,
}: {
  companyName: string;
  accessCode: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[#faf8f5]">
      <header className="sticky top-0 z-30 border-b border-stone-200/90 bg-[#faf8f5]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div className="flex min-w-0 flex-wrap items-center gap-3 sm:gap-4">
            <Link href="/" className="flex shrink-0 items-center gap-2 no-underline">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/warmpath-mark.svg" alt="" width={36} height={36} className="rounded-lg shadow-sm" />
              <span className="font-serif text-lg font-semibold tracking-tight text-stone-900">Warmpath</span>
            </Link>
            <span className="hidden h-6 w-px bg-stone-200 sm:block" aria-hidden />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-stone-900">{companyName}</p>
              <p className="text-[11px] text-stone-500">
                Access code{" "}
                <span className="font-mono font-medium text-stone-700">{accessCode}</span>
              </p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1 sm:justify-end">
            <nav className="flex flex-wrap items-center gap-1" aria-label="Company">
              <PortalNavLink href="/company/dashboard" match="exact">
                Dashboard
              </PortalNavLink>
              <PortalNavLink href="/company/roles" match="prefix">
                Roles
              </PortalNavLink>
              <PortalNavLink href="/company/settings" match="exact">
                Settings
              </PortalNavLink>
            </nav>
            <span className="mx-1 hidden h-5 w-px bg-stone-200 sm:inline-block" aria-hidden />
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800"
            >
              Home
            </Link>
            <form action={companyLogout} className="inline">
              <button
                type="submit"
                className="rounded-md px-3 py-2 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
    </div>
  );
}
