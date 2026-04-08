"use client";

import Link from "next/link";
import { adminLogout } from "@/app/actions/admin";
import { PortalNavLink } from "@/app/components/shell/portal-nav-link";

export function AdminAppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-[#faf8f5]">
      <header className="sticky top-0 z-30 border-b border-stone-200/90 bg-[#faf8f5]/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-2 no-underline">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/warmpath-mark.svg" alt="" width={32} height={32} className="rounded-lg shadow-sm" />
              <span className="font-serif text-lg font-semibold text-stone-900">Warmpath</span>
            </Link>
            <span className="rounded-md bg-stone-900 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white">
              Admin
            </span>
          </div>
          <div className="flex flex-wrap items-center gap-1">
            <PortalNavLink href="/admin" match="exact">
              Overview
            </PortalNavLink>
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800"
            >
              Home
            </Link>
            <form action={adminLogout} className="inline">
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
