"use client";

import Link from "next/link";
import { ConnectorProfileModal } from "@/app/connect/connector-profile-modal";
import type { ConnectorMe } from "@/app/connect/types";
import { connectorLogout } from "@/app/actions/connect";
import { PortalNavLink } from "@/app/components/shell/portal-nav-link";

export function ConnectorAppShell({ me, children }: { me: ConnectorMe; children: React.ReactNode }) {
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
              <p className="text-[10px] font-semibold uppercase tracking-wide text-stone-500">Connector</p>
              <p className="truncate text-sm font-semibold text-stone-900">{me.full_name}</p>
              {me.role_title ? <p className="truncate text-xs text-stone-500">{me.role_title}</p> : null}
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-1 sm:justify-end">
            <nav className="flex flex-wrap items-center gap-1" aria-label="Connector">
              <PortalNavLink href="/connect/dashboard" match="exact">
                Dashboard
              </PortalNavLink>
              <PortalNavLink href="/connect/roles" match="prefix">
                Open roles
              </PortalNavLink>
            </nav>
            <span className="mx-1 hidden h-5 w-px bg-stone-200 sm:inline-block" aria-hidden />
            <ConnectorProfileModal me={me} />
            <Link
              href="/"
              className="rounded-md px-3 py-2 text-sm font-medium text-stone-500 transition-colors hover:bg-stone-100 hover:text-stone-800"
            >
              Home
            </Link>
            <form action={connectorLogout} className="inline">
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
