import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CopyRoleLink } from "@/components/copy-role-link";
import { RoleDescription } from "@/components/role-description";
import { RoleEditModal } from "@/components/role-edit-modal";
import { RoleStatusSelect } from "@/components/role-status-select";
import { getAdminSessionProfile } from "@/lib/admin/guard";
import {
  fetchCompanySnapshot,
  listCompaniesForProfile,
} from "@/lib/admin/profile-companies";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isRoleStatus,
  roleAcceptsSubmissions,
  roleStatusLabel,
} from "@/lib/role-status";
import { getProfileIdFromSession } from "@/lib/session/profile";
import { getSiteUrl } from "@/lib/url";

type SubRow = {
  id: string;
  kind: string;
  submitter_email: string;
  submitter_name: string | null;
  self_pitch: string | null;
  self_linkedin_url: string | null;
  candidate_name: string | null;
  candidate_email: string | null;
  why_fit: string | null;
  relationship: string | null;
  candidate_linkedin_url: string | null;
  created_at: string;
};

export default async function RoleDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const profileId = await getProfileIdFromSession();
  if (!profileId) redirect("/hire/sign-up");

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Missing Supabase service role key. Add SUPABASE_SERVICE_ROLE_KEY to .env.local.
      </p>
    );
  }

  const { data: role, error: roleError } = await admin
    .from("roles")
    .select("id, title, description, slug, status, hirer_id, company_id, location, match_bonus")
    .eq("id", id)
    .maybeSingle();

  if (roleError || !role) notFound();

  const adminSess = await getAdminSessionProfile();
  const isAdmin = !!adminSess;
  const isOwner = role.hirer_id === profileId;
  if (!isAdmin && !isOwner) notFound();

  const memberCompanies = await listCompaniesForProfile(admin, profileId);
  let companyOptions: { id: string; name: string }[];
  if (isAdmin) {
    companyOptions =
      ((await admin.from("companies").select("id, name").order("name")).data as
        | { id: string; name: string }[]
        | null) ?? [];
  } else {
    companyOptions = memberCompanies.map(({ id: cid, name }) => ({ id: cid, name }));
    const rcid = role.company_id as string | null;
    if (rcid && !companyOptions.some((c) => c.id === rcid)) {
      const co = await fetchCompanySnapshot(admin, rcid);
      if (co) companyOptions = [{ id: co.id, name: `${co.name} (on role)` }, ...companyOptions];
    }
  }

  let hirerOptions: { id: string; label: string }[] = [];
  if (isAdmin) {
    const { data: hp } = await admin
      .from("profiles")
      .select("id, full_name, email")
      .in("account_role", ["hirer", "admin"])
      .order("full_name");
    hirerOptions =
      (hp as { id: string; full_name: string; email: string }[] | null)?.map((p) => ({
        id: p.id,
        label: `${p.full_name} (${p.email})`,
      })) ?? [];
  }

  const pipelineStatus = isRoleStatus(role.status) ? role.status : "getting_started";
  const acceptingSubs = roleAcceptsSubmissions(pipelineStatus);

  const { data: subs } = await admin
    .from("submissions")
    .select(
      "id, kind, submitter_email, submitter_name, self_pitch, self_linkedin_url, candidate_name, candidate_email, why_fit, relationship, candidate_linkedin_url, created_at",
    )
    .eq("role_id", id)
    .order("created_at", { ascending: false });

  const rows = (subs ?? []) as SubRow[];
  const site = await getSiteUrl();
  const shareUrl = `${site}/r/${role.slug}`;
  const unassigned = role.hirer_id == null;

  return (
    <div className="space-y-6">
      <Link href="/hire/dashboard" className="text-xs font-medium text-warm-muted hover:text-warm-accent">
        ← Dashboard
      </Link>

      {unassigned && isAdmin ? (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          <strong>No hiring manager.</strong>{" "}
          <Link href="/admin/dashboard" className="font-semibold text-warm-accent underline">
            Admin
          </Link>{" "}
          or use <strong>Edit details</strong> below.
        </p>
      ) : null}

      <header className="flex flex-col gap-4 border-b border-stone-200 pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h1 className="font-serif text-2xl font-semibold tracking-tight text-warm-ink sm:text-3xl">
            {role.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-warm-muted">
            {role.location?.trim() ? <span>{role.location.trim()}</span> : null}
            {role.match_bonus?.trim() ? (
              <span className="text-amber-900">{role.match_bonus.trim()}</span>
            ) : null}
            <span className="rounded-full bg-stone-100 px-2 py-0.5 font-medium text-warm-ink">
              {roleStatusLabel(pipelineStatus)}
            </span>
            <span className="font-mono text-stone-400">/{role.slug}</span>
          </div>
          {role.description?.trim() ? (
            <div className="mt-4 rounded-xl border border-stone-200/90 bg-stone-50/50 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-warm-muted">About this role</p>
              <div className="mt-2">
                <RoleDescription text={role.description} variant="compact" />
              </div>
            </div>
          ) : (
            <p className="mt-3 text-sm italic text-warm-muted">No description yet — add one in Edit details.</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-stretch gap-2 sm:items-end">
          <RoleEditModal
            role={{
              id: role.id,
              title: role.title,
              description: role.description,
              location: role.location,
              match_bonus: role.match_bonus,
              company_id: (role.company_id as string | null) ?? null,
              hirer_id: (role.hirer_id as string | null) ?? null,
            }}
            companyOptions={companyOptions}
            hirerOptions={hirerOptions}
            isAdmin={isAdmin}
          />
          <RoleStatusSelect roleId={role.id} slug={role.slug} current={pipelineStatus} compact />
        </div>
      </header>

      <section className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 shadow-sm">
        {unassigned ? (
          <p className="text-sm text-warm-muted">Assign a hiring manager to enable the public link.</p>
        ) : pipelineStatus === "draft" ? (
          <p className="text-sm text-amber-900">Draft — public page hidden until you change stage.</p>
        ) : (
          <div className="flex min-w-0 flex-nowrap items-center gap-3 overflow-x-auto pb-0.5 text-sm [-webkit-overflow-scrolling:touch]">
            <span className="shrink-0 text-xs font-semibold uppercase tracking-wide text-warm-muted">
              Public link
            </span>
            <span className="shrink-0 text-xs text-warm-muted">
              {acceptingSubs ? "Accepting applications." : `View-only (${roleStatusLabel(pipelineStatus)}).`}
            </span>
            <CopyRoleLink url={shareUrl} inline />
            <Link
              href={shareUrl}
              className="shrink-0 text-xs font-semibold text-warm-accent underline"
              target="_blank"
              rel="noreferrer"
            >
              Open
            </Link>
          </div>
        )}
      </section>

      <section>
        <h2 className="text-sm font-semibold text-warm-ink">Submissions · {rows.length}</h2>
        {rows.length === 0 ? (
          <p className="mt-2 text-sm text-warm-muted">None yet.</p>
        ) : (
          <ul className="mt-3 divide-y divide-stone-100 rounded-xl border border-stone-200 bg-white text-sm">
            {rows.map((s) => (
              <li key={s.id} className="px-3 py-3">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <span className="text-xs text-warm-muted">
                    {new Date(s.created_at).toLocaleString(undefined, {
                      month: "short",
                      day: "numeric",
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </span>
                  <span className="text-xs font-medium capitalize text-warm-ink">{s.kind}</span>
                </div>
                <p className="mt-1 font-mono text-[11px] text-stone-500">{s.submitter_email}</p>
                {s.kind === "self" ? (
                  <p className="mt-1 text-warm-muted">
                    <span className="font-medium text-warm-ink">{s.submitter_name}</span>
                    {s.self_pitch ? <span className="mt-0.5 block text-xs leading-snug">{s.self_pitch}</span> : null}
                  </p>
                ) : (
                  <p className="mt-1 text-xs text-warm-muted">
                    <span className="font-medium text-warm-ink">{s.candidate_name}</span>
                    {s.why_fit ? ` · ${s.why_fit}` : null}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
