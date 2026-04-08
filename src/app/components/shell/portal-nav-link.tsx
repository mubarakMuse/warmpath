"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type MatchMode = "exact" | "prefix";

function pathMatches(pathname: string, href: string, match: MatchMode) {
  if (match === "exact") return pathname === href;
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PortalNavLink({
  href,
  match = "exact",
  children,
}: {
  href: string;
  match?: MatchMode;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active = pathMatches(pathname, href, match);
  return (
    <Link
      href={href}
      className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
        active
          ? "bg-stone-900 text-white shadow-sm"
          : "text-stone-600 hover:bg-stone-100 hover:text-stone-900"
      }`}
    >
      {children}
    </Link>
  );
}
