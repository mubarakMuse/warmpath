import Link from "next/link";
import { redirect } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { roleStatusLabel } from "@/lib/role-status";
import { getProfileIdFromSession } from "@/lib/session/profile";
import { getSessionProfileRow } from "@/lib/session/session-profile";

type SubRow = {
  id: string;
  kind: string;
  role_id: string;
  created_at: string;
  submitter_email: string;
  submitter_name: string | null;
  self_pitch: string | null;
  self_linkedin_url: string | null;
  candidate_name: string | null;
  candidate_email: string | null;
  why_fit: string | null;
  relationship: string | null;
  candidate_linkedin_url: string | null;
};

type RoleRow = {
  id: string;
  title: string;
  slug: string;
  status: string;
  company_name: string | null;
};

function uniqIds(rows: SubRow[]) {
  return [...new Set(rows.map((r) => r.role_id))];
}

function SubmissionCard({
  s,
  role,
  variant,
}: {
  s: SubRow;
  role: RoleRow | undefined;
  variant: "self" | "referred_in" | "referred_out";
}) {
  const title = role?.title ?? "Role";
  const slug = role?.slug;
  const company = role?.company_name?.trim() || null;

  return (
    <li className="rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <p className="font-semibold text-warm-ink">{title}</p>
          {company ? <p className="text-sm text-warm-muted">{company}</p> : null}
          {role ? (
            <p className="mt-1 text-xs text-warm-muted">
              {roleStatusLabel(role.status)}
              {slug ? (
                <>
                  {" · "}
                  <span className="font-mono text-stone-400">/r/{slug}</span>
                </>
              ) : null}
            </p>
          ) : null}
        </div>
        <time className="shrink-0 text-xs text-warm-muted" dateTime={s.created_at}>
          {new Date(s.created_at).toLocaleDateString(undefined, {
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </time>
      </div>
      {slug ? (
        <Link
          href={`/r/${slug}`}
          className="mt-3 inline-block text-sm font-semibold text-warm-accent hover:underline"
        >
          View role page →
        </Link>
      ) : null}

      {variant === "self" ? (
        <p className="mt-3 text-sm text-warm-muted">
          You applied as <strong className="text-warm-ink">{s.submitter_name ?? "yourself"}</strong>
          {s.self_pitch ? (
            <span className="mt-2 block text-xs leading-relaxed">{s.self_pitch}</span>
          ) : null}
        </p>
      ) : null}

      {variant === "referred_in" ? (
        <p className="mt-3 text-sm text-warm-muted">
          <strong className="text-warm-ink">{s.candidate_name}</strong> was referred by someone in the
          network (submitted by <span className="font-mono text-xs">{s.submitter_email}</span>).
          {s.why_fit ? (
            <span className="mt-2 block text-xs leading-relaxed">
              <span className="font-medium text-warm-ink">Why they fit:</span> {s.why_fit}
            </span>
          ) : null}
        </p>
      ) : null}

      {variant === "referred_out" ? (
        <p className="mt-3 text-sm text-warm-muted">
          You referred <strong className="text-warm-ink">{s.candidate_name}</strong>.
          {s.why_fit ? (
            <span className="mt-2 block text-xs leading-relaxed">
              <span className="font-medium text-warm-ink">Your note:</span> {s.why_fit}
            </span>
          ) : null}
        </p>
      ) : null}
    </li>
  );
}

export default async function ConnectorDashboardPage() {
  const profileId = await getProfileIdFromSession();
  if (!profileId) redirect("/login");

  const row = await getSessionProfileRow();
  if (!row || row.account_role !== "connector") redirect("/hire/dashboard");

  const email = row.email.trim().toLowerCase();
  let loadError: string | null = null;
  let applied: SubRow[] = [];
  let referredOut: SubRow[] = [];
  let referredIn: SubRow[] = [];

  const baseSelect =
    "id, kind, role_id, created_at, submitter_email, submitter_name, self_pitch, self_linkedin_url, candidate_name, candidate_email, why_fit, relationship, candidate_linkedin_url";

  try {
    const admin = createAdminClient();
    const [selfRes, outRes, inRes] = await Promise.all([
      admin
        .from("submissions")
        .select(baseSelect)
        .eq("kind", "self")
        .eq("submitter_email", email)
        .order("created_at", { ascending: false }),
      admin
        .from("submissions")
        .select(baseSelect)
        .eq("kind", "referral")
        .eq("submitter_email", email)
        .order("created_at", { ascending: false }),
      admin
        .from("submissions")
        .select(baseSelect)
        .eq("kind", "referral")
        .eq("candidate_email", email)
        .order("created_at", { ascending: false }),
    ]);

    if (selfRes.error) loadError = selfRes.error.message;
    else if (outRes.error) loadError = outRes.error.message;
    else if (inRes.error) loadError = inRes.error.message;
    else {
      applied = (selfRes.data ?? []) as SubRow[];
      referredOut = (outRes.data ?? []) as SubRow[];
      referredIn = (inRes.data ?? []) as SubRow[];
    }
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Could not load activity.";
  }

  const allSubs = [...applied, ...referredOut, ...referredIn];
  const roleIds = uniqIds(allSubs);
  const roleMap = new Map<string, RoleRow>();

  if (roleIds.length > 0 && !loadError) {
    try {
      const admin = createAdminClient();
      const { data: roles, error: rErr } = await admin
        .from("roles")
        .select("id, title, slug, status, company_name")
        .in("id", roleIds);
      if (rErr) loadError = rErr.message;
      else (roles as RoleRow[] | null)?.forEach((r) => roleMap.set(r.id, r));
    } catch (e) {
      loadError = e instanceof Error ? e.message : "Could not load roles.";
    }
  }

  return (
    <div>
      <h1 className="font-serif text-3xl font-semibold tracking-tight text-warm-ink md:text-4xl">
        My activity
      </h1>
      <p className="mt-2 max-w-2xl text-sm text-warm-muted">
        Roles you applied to, roles where someone referred you (when they added your email), and people
        you referred.
      </p>

      {loadError ? (
        <p className="mt-10 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 text-sm text-red-800">
          {loadError}
        </p>
      ) : (
        <div className="mt-12 space-y-14">
          <section>
            <h2 className="font-serif text-xl font-semibold text-warm-ink">Jobs you applied to</h2>
            {applied.length === 0 ? (
              <p className="mt-3 text-sm text-warm-muted">
                No self-applications yet. Open a role link and choose <strong>I&apos;m interested</strong>.
              </p>
            ) : (
              <ul className="mt-6 grid gap-4">
                {applied.map((s) => (
                  <SubmissionCard
                    key={s.id}
                    s={s}
                    role={roleMap.get(s.role_id)}
                    variant="self"
                  />
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-warm-ink">Jobs you were referred to</h2>
            <p className="mt-2 max-w-2xl text-xs text-warm-muted">
              Appears when a referrer includes your email on the referral form (same address you use to
              sign in).
            </p>
            {referredIn.length === 0 ? (
              <p className="mt-3 text-sm text-warm-muted">
                Nothing here yet. Ask people referring you to add your email so this intro shows up.
              </p>
            ) : (
              <ul className="mt-6 grid gap-4">
                {referredIn.map((s) => (
                  <SubmissionCard
                    key={s.id}
                    s={s}
                    role={roleMap.get(s.role_id)}
                    variant="referred_in"
                  />
                ))}
              </ul>
            )}
          </section>

          <section>
            <h2 className="font-serif text-xl font-semibold text-warm-ink">People you referred</h2>
            {referredOut.length === 0 ? (
              <p className="mt-3 text-sm text-warm-muted">
                No referrals yet. On a role page, choose <strong>I know a potential fit</strong>.
              </p>
            ) : (
              <ul className="mt-6 grid gap-4">
                {referredOut.map((s) => (
                  <SubmissionCard
                    key={s.id}
                    s={s}
                    role={roleMap.get(s.role_id)}
                    variant="referred_out"
                  />
                ))}
              </ul>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
