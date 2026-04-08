"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

export type RoleListItem = {
  id: string;
  title: string;
  slug: string;
  location: string | null;
  company_name: string;
};

export function ConnectRolesSearch({ roles }: { roles: RoleListItem[] }) {
  const [q, setQ] = useState("");

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return roles;
    return roles.filter((r) => {
      const hay = `${r.company_name} ${r.title} ${r.location ?? ""} ${r.slug}`.toLowerCase();
      return hay.includes(s);
    });
  }, [roles, q]);

  return (
    <div className="space-y-4">
      <label className="flex flex-col gap-1.5 text-sm">
        <span className="font-medium text-stone-800">Search roles</span>
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Company, title, location, or slug…"
          className="min-h-11 rounded-lg border border-stone-200 px-3 text-sm outline-none focus:border-amber-700 focus:ring-2 focus:ring-amber-700/20"
        />
      </label>
      <p className="text-xs text-stone-500">
        Showing {filtered.length} of {roles.length} active roles
      </p>
      <ul className="divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white shadow-sm">
        {filtered.length === 0 ? (
          <li className="px-4 py-8 text-center text-sm text-stone-500">No matches.</li>
        ) : (
          filtered.map((r) => (
            <li key={r.id}>
              <Link
                href={`/connect/roles/${encodeURIComponent(r.slug)}`}
                className="block px-4 py-4 transition hover:bg-amber-50/50"
              >
                <p className="font-medium text-stone-900">{r.title}</p>
                <p className="mt-0.5 text-sm text-stone-600">{r.company_name}</p>
                <p className="mt-1 font-mono text-[11px] text-stone-400">
                  {r.location ? `${r.location} · ` : null}
                  {r.slug}
                </p>
              </Link>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
