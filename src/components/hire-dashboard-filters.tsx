"use client";

import Link from "next/link";

export type HireDashCompanyOpt = { id: string; name: string };

export function HireDashboardCompanyFilter({
  companies,
  activeCompanyId,
}: {
  companies: HireDashCompanyOpt[];
  activeCompanyId: string | null;
}) {
  if (companies.length === 0) return null;

  const pill =
    "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold transition";
  const active = "border-warm-accent bg-warm-accent/10 text-warm-ink";
  const idle = "border-stone-200 bg-white text-warm-muted hover:border-stone-300 hover:text-warm-ink";

  return (
    <div className="mt-8">
      <p className="text-xs font-semibold uppercase tracking-wide text-warm-muted">Filter by company</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Link href="/hire/dashboard" className={`${pill} ${activeCompanyId ? idle : active}`}>
          All roles
        </Link>
        {companies.map((c) => (
          <Link
            key={c.id}
            href={`/hire/dashboard?company=${encodeURIComponent(c.id)}`}
            className={`${pill} ${activeCompanyId === c.id ? active : idle}`}
          >
            {c.name}
          </Link>
        ))}
      </div>
    </div>
  );
}
