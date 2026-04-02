import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CopyRoleLink } from "@/components/copy-role-link";
import { EditRoleForm } from "@/components/edit-role-form";
import { HirerPublicCard } from "@/components/hirer-public-card";
import { RoleStatusSelect } from "@/components/role-status-select";
import { getAdminSessionProfile } from "@/lib/admin/guard";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  isRoleStatus,
  roleAcceptsSubmissions,
  roleStatusLabel,
} from "@/lib/role-status";
import { getProfileIdFromSession } from "@/lib/session/profile";
import { getSiteUrl } from "@/lib/url";

type Row = {
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
    .select(
      "id, title, description, slug, status, hirer_id, location, match_bonus, hirer_full_name, hirer_linkedin_url, hirer_avatar_url, company_name, company_website, company_linkedin_url, company_logo_url",
    )
    .eq("id", id)
    .maybeSingle();

  if (roleError || !role) notFound();

  const adminSess = await getAdminSessionProfile();
  const isAdmin = !!adminSess;
  const isOwner = role.hirer_id === profileId;
  if (!isAdmin && !isOwner) notFound();

  const pipelineStatus = isRoleStatus(role.status) ? role.status : "getting_started";
  const acceptingSubs = roleAcceptsSubmissions(pipelineStatus);

  const { data: subs } = await admin
    .from("submissions")
    .select(
      "id, kind, submitter_email, submitter_name, self_pitch, self_linkedin_url, candidate_name, candidate_email, why_fit, relationship, candidate_linkedin_url, created_at",
    )
    .eq("role_id", id)
    .order("created_at", { ascending: false });

  const rows = (subs ?? []) as Row[];
  const site = await getSiteUrl();
  const shareUrl = `${site}/r/${role.slug}`;
  const unassigned = role.hirer_id == null;

  return (
    <div className="space-y-12">
      <div>
        <Link href="/hire/dashboard" className="text-sm font-medium text-warm-muted hover:text-warm-accent">
          ← Dashboard
        </Link>
        {unassigned && isAdmin ? (
          <p className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
            <strong>No hiring manager yet.</strong> Assign someone in{" "}
            <Link href="/admin/dashboard" className="font-semibold text-warm-accent underline">
              Admin → Assign hiring manager
            </Link>{" "}
            before publishing.
          </p>
        ) : null}
        <h1 className="mt-4 font-serif text-3xl font-semibold text-warm-ink">{role.title}</h1>
        {role.location?.trim() ? (
          <p className="mt-2 text-sm text-warm-muted">{role.location.trim()}</p>
        ) : null}
        {role.match_bonus?.trim() ? (
          <p className="mt-2 text-sm text-amber-900">
            <span className="font-semibold">Referral bonus:</span> {role.match_bonus.trim()}
          </p>
        ) : null}
        {role.description ? (
          <p className="mt-3 max-w-2xl whitespace-pre-wrap text-sm text-warm-muted">{role.description}</p>
        ) : null}
        <div className="mt-6 rounded-lg border border-stone-200 bg-stone-50/80 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-warm-muted">Pipeline</p>
          <p className="mt-1 text-sm text-warm-muted">
            Current: <span className="font-medium text-warm-ink">{roleStatusLabel(pipelineStatus)}</span>
          </p>
          <div className="mt-3">
            <RoleStatusSelect roleId={role.id} slug={role.slug} current={pipelineStatus} />
          </div>
          <p className="mt-3 text-xs text-warm-muted">
            Draft hides the public link. Submissions stay open through{" "}
            <strong className="text-warm-ink">Interviewing</strong>; offer, hired, on hold, and closed
            stop new responses.
          </p>
        </div>
        <p className="mt-3 text-sm text-warm-muted">
          Public hiring card & company info:{" "}
          <Link href="/hire/settings" className="font-medium text-warm-accent underline">
            edit in Profile & company
          </Link>
        </p>
      </div>

      <section className="rounded-2xl border border-stone-200 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-warm-ink">Edit role</h2>
        <p className="mt-1 text-sm text-warm-muted">
          Title, location, referral bonus (USD), and description. Your public link slug stays the same.
        </p>
        <div
          className="mt-6"
          key={`${role.title}\0${role.description ?? ""}\0${role.location ?? ""}\0${role.match_bonus ?? ""}`}
        >
          <EditRoleForm
            role={{
              id: role.id,
              title: role.title,
              description: role.description,
              location: role.location,
              match_bonus: role.match_bonus,
            }}
          />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-warm-ink">What candidates see</h2>
        <p className="mt-1 text-sm text-warm-muted">
          Preview of the hiring manager and company block on your public link.
        </p>
        <div className="mt-4 max-w-lg">
          <HirerPublicCard role={role} />
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-warm-ink">Share link</h2>
        {unassigned ? (
          <p className="mt-2 rounded-lg border border-stone-200 bg-stone-50 px-3 py-2 text-sm text-warm-muted">
            Public link is disabled until a hiring manager is assigned and the role is published.
          </p>
        ) : pipelineStatus === "draft" ? (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
            <strong>Draft:</strong> the public page is hidden (404) until you change stage away from
            Draft.
          </p>
        ) : acceptingSubs ? (
          <p className="mt-1 text-sm text-warm-muted">
            Anyone with this link can submit a self-application or a referral. Track who reached out
            via <strong className="text-warm-ink">submitter email</strong>.
          </p>
        ) : (
          <p className="mt-1 text-sm text-warm-muted">
            The link still works for viewing this role, but new applications are turned off at this
            stage ({roleStatusLabel(pipelineStatus)}).
          </p>
        )}
        {!unassigned ? (
          <>
            <div className="mt-4">
              <CopyRoleLink url={shareUrl} />
            </div>
            <p className="mt-3 text-xs text-warm-muted">
              Preview:{" "}
              <Link href={shareUrl} className="font-medium text-warm-accent underline" target="_blank">
                Open public page
              </Link>
            </p>
          </>
        ) : null}
      </section>

      <section>
        <h2 className="text-lg font-semibold text-warm-ink">Submissions ({rows.length})</h2>
        {rows.length === 0 ? (
          <p className="mt-4 text-sm text-warm-muted">Nothing yet. Share the link above.</p>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border border-stone-200 bg-white">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-stone-200 bg-stone-50 text-xs font-semibold uppercase tracking-wide text-warm-muted">
                <tr>
                  <th className="px-4 py-3">When</th>
                  <th className="px-4 py-3">Type</th>
                  <th className="px-4 py-3">Submitter email</th>
                  <th className="px-4 py-3">Summary</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {rows.map((s) => (
                  <tr key={s.id} className="align-top">
                    <td className="whitespace-nowrap px-4 py-3 text-warm-muted">
                      {new Date(s.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 capitalize text-warm-ink">{s.kind}</td>
                    <td className="px-4 py-3 font-mono text-xs text-warm-ink">{s.submitter_email}</td>
                    <td className="max-w-md px-4 py-3 text-warm-muted">
                      {s.kind === "self" ? (
                        <span>
                          <strong className="text-warm-ink">{s.submitter_name}</strong>
                          {s.self_linkedin_url ? (
                            <>
                              {" · "}
                              <a
                                href={s.self_linkedin_url}
                                className="text-warm-accent underline"
                                target="_blank"
                                rel="noreferrer"
                              >
                                LinkedIn
                              </a>
                            </>
                          ) : null}
                          {s.self_pitch ? (
                            <span className="mt-1 block text-xs leading-relaxed">{s.self_pitch}</span>
                          ) : null}
                        </span>
                      ) : (
                        <span>
                          Ref: <strong className="text-warm-ink">{s.candidate_name}</strong>
                          <span className="mt-1 block text-xs">
                            <span className="font-medium text-warm-ink">Fit:</span> {s.why_fit}
                          </span>
                          <span className="mt-1 block text-xs">
                            <span className="font-medium text-warm-ink">Relationship:</span>{" "}
                            {s.relationship}
                          </span>
                          {s.candidate_email ? (
                            <span className="mt-1 block text-xs font-mono text-warm-ink">
                              Candidate email: {s.candidate_email}
                            </span>
                          ) : null}
                          {s.candidate_linkedin_url ? (
                            <a
                              href={s.candidate_linkedin_url}
                              className="mt-1 inline-block text-warm-accent underline"
                              target="_blank"
                              rel="noreferrer"
                            >
                              Candidate LinkedIn
                            </a>
                          ) : null}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
