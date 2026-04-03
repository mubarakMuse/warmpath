import Link from "next/link";
import { redirect } from "next/navigation";
import { HireDashboardCompanyFilter } from "@/components/hire-dashboard-filters";
import { createAdminClient } from "@/lib/supabase/admin";
import { roleStatusLabel } from "@/lib/role-status";
import { getProfileIdFromSession } from "@/lib/session/profile";

type RoleRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  created_at: string;
  company_id: string | null;
};

type Props = { searchParams: Promise<{ company?: string }> };

export default async function HireDashboardPage({ searchParams }: Props) {
  const profileId = await getProfileIdFromSession();
  if (!profileId) redirect("/hire/sign-up");

  const q = await searchParams;
  const filterCompanyId = q.company?.trim() || null;

  let roles: RoleRow[] = [];
  let loadError: string | null = null;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("roles")
      .select("id, title, slug, status, created_at, company_id")
      .eq("hirer_id", profileId)
      .order("created_at", { ascending: false });

    if (error) loadError = error.message;
    else roles = (data ?? []) as RoleRow[];
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Could not load roles.";
  }

  const companyIds = [...new Set(roles.map((r) => r.company_id).filter(Boolean))] as string[];
  const companyNameById = new Map<string, string>();
  if (companyIds.length > 0 && !loadError) {
    try {
      const admin = createAdminClient();
      const { data: cos, error: cErr } = await admin.from("companies").select("id, name").in("id", companyIds);
      if (cErr) loadError = cErr.message;
      else (cos as { id: string; name: string }[] | null)?.forEach((c) => companyNameById.set(c.id, c.name));
    } catch (e) {
      loadError = e instanceof Error ? e.message : "Could not load companies.";
    }
  }

  const companyOptionsMap = new Map<string, string>();
  for (const r of roles) {
    if (r.company_id) {
      const label = companyNameById.get(r.company_id)?.trim();
      companyOptionsMap.set(r.company_id, label && label.length > 0 ? label : "Organization");
    }
  }
  const companyOptions = [...companyOptionsMap.entries()].map(([id, name]) => ({ id, name }));
  companyOptions.sort((a, b) => a.name.localeCompare(b.name));

  const filteredRoles =
    filterCompanyId && companyOptionsMap.has(filterCompanyId)
      ? roles.filter((r) => r.company_id === filterCompanyId)
      : roles;

  return (
    <div>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-warm-ink sm:text-3xl">
            Your roles
          </h1>
          <p className="mt-1 text-sm text-warm-muted">Filter by org or open a role to edit and share.</p>
        </div>
        <Link
          href="/hire/roles/new"
          className="inline-flex min-h-10 shrink-0 items-center justify-center rounded-lg bg-warm-accent px-4 text-sm font-semibold text-white hover:bg-warm-accent-hover"
        >
          + New role
        </Link>
      </div>

      <HireDashboardCompanyFilter
        companies={companyOptions}
        activeCompanyId={
          filterCompanyId && companyOptionsMap.has(filterCompanyId) ? filterCompanyId : null
        }
      />

      {loadError ? (
        <p className="mt-8 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          {loadError}
        </p>
      ) : roles.length === 0 ? (
        <div className="mt-10 rounded-xl border border-dashed border-stone-300 bg-white/60 px-6 py-12 text-center">
          <p className="font-serif text-lg font-semibold text-warm-ink">No roles yet</p>
          <p className="mx-auto mt-1 max-w-sm text-sm text-warm-muted">
            Create a role for a shareable page, or ask your admin to assign you.
          </p>
          <Link
            href="/hire/roles/new"
            className="mt-6 inline-flex min-h-10 items-center justify-center rounded-lg bg-warm-accent px-5 text-sm font-semibold text-white hover:bg-warm-accent-hover"
          >
            Create role
          </Link>
        </div>
      ) : filteredRoles.length === 0 ? (
        <p className="mt-8 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
          No roles for this company. Choose another filter or{" "}
          <Link href="/hire/dashboard" className="font-semibold text-warm-accent underline">
            show all roles
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-8 grid gap-2">
          {filteredRoles.map((r) => (
            <li key={r.id}>
              <Link
                href={`/hire/roles/${r.id}`}
                className="group flex flex-col gap-2 rounded-xl border border-stone-200 bg-white px-4 py-3 shadow-sm transition hover:border-warm-accent/40 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-medium text-warm-ink group-hover:text-warm-accent">{r.title}</p>
                  <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-warm-muted">
                    {r.company_id && companyNameById.get(r.company_id)?.trim() ? (
                      <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-900">
                        {companyNameById.get(r.company_id)!.trim()}
                      </span>
                    ) : r.company_id ? (
                      <span className="rounded-full bg-stone-100 px-2.5 py-0.5 font-medium text-warm-ink">
                        Organization set
                      </span>
                    ) : (
                      <span className="rounded-full bg-amber-50 px-2.5 py-0.5 font-medium text-amber-900">
                        No org on role
                      </span>
                    )}
                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 font-medium text-warm-ink">
                      {roleStatusLabel(r.status)}
                    </span>
                    <span className="font-mono text-[11px] text-stone-400">/{r.slug}</span>
                  </div>
                </div>
                <span className="text-xs font-semibold text-warm-accent group-hover:underline sm:text-sm">
                  Open
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
