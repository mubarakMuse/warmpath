import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { roleAcceptsSubmissions, roleStatusLabel } from "@/lib/role-status";
import { getProfileIdFromSession } from "@/lib/session/profile";

export default async function HireDashboardPage() {
  const profileId = await getProfileIdFromSession();
  if (!profileId) redirect("/hire/sign-up");

  let roles: { id: string; title: string; slug: string; status: string; created_at: string }[] = [];
  let loadError: string | null = null;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("roles")
      .select("id, title, slug, status, created_at")
      .eq("hirer_id", profileId)
      .order("created_at", { ascending: false });

    if (error) loadError = error.message;
    else roles = data ?? [];
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Could not load roles.";
  }

  const acceptingCount = roles.filter((r) => roleAcceptsSubmissions(r.status)).length;

  return (
    <div>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="font-serif text-3xl font-semibold tracking-tight text-warm-ink md:text-4xl">
            Dashboard
          </h1>
          <p className="mt-2 max-w-xl text-sm text-warm-muted">
            Every role has a public link. Share it when you’re ready—submissions show up here with
            the submitter’s email.
          </p>
        </div>
        <Link
          href="/hire/roles/new"
          className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-xl bg-warm-accent px-5 text-sm font-semibold text-white shadow-sm transition hover:bg-warm-accent-hover"
        >
          + New role
        </Link>
      </div>

      {!loadError && roles.length > 0 ? (
        <div className="mt-10 grid gap-4 sm:grid-cols-2">
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-warm-muted">Open roles</p>
            <p className="mt-1 font-serif text-3xl font-semibold text-warm-ink">{roles.length}</p>
          </div>
          <div className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-warm-muted">
              Accepting submissions
            </p>
            <p className="mt-1 font-serif text-3xl font-semibold text-warm-ink">{acceptingCount}</p>
          </div>
        </div>
      ) : null}

      {loadError ? (
        <p className="mt-10 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          {loadError}
        </p>
      ) : roles.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-stone-300 bg-white/60 px-8 py-16 text-center">
          <p className="font-serif text-xl font-semibold text-warm-ink">No roles yet</p>
          <p className="mx-auto mt-2 max-w-md text-sm text-warm-muted">
            Create your first role to get a shareable page for applications and referrals.
          </p>
          <Link
            href="/hire/roles/new"
            className="mt-8 inline-flex min-h-11 items-center justify-center rounded-xl bg-warm-accent px-6 text-sm font-semibold text-white hover:bg-warm-accent-hover"
          >
            Create your first role
          </Link>
        </div>
      ) : (
        <ul className="mt-10 grid gap-4">
          {roles.map((r) => (
            <li key={r.id}>
              <Link
                href={`/hire/roles/${r.id}`}
                className="group flex flex-col gap-3 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm transition hover:border-warm-accent/40 hover:shadow-md sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-warm-ink group-hover:text-warm-accent">
                    {r.title}
                  </p>
                  <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-warm-muted">
                    <span className="rounded-full bg-stone-100 px-2.5 py-0.5 font-medium text-warm-ink">
                      {roleStatusLabel(r.status)}
                    </span>
                    <span className="font-mono text-[11px] text-stone-400">/{r.slug}</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-warm-accent group-hover:underline">
                  Open →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
