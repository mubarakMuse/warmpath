import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { CopyPublicLinkButton } from "@/app/connect/copy-public-link-button";
import { getSiteBaseUrl } from "@/lib/site-base-url";
import { ReferralForm } from "@/app/connect/referral-form";
import { createAdminClient } from "@/lib/supabase/admin";
import { getConnectorIdFromServerSession } from "@/lib/session/connector-session";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `Role · ${decodeURIComponent(slug)}` };
}

function companyNameFromEmbed(
  embed: { name: string } | { name: string }[] | null | undefined,
): string {
  if (!embed) return "—";
  if (Array.isArray(embed)) return embed[0]?.name ?? "—";
  return embed.name ?? "—";
}

export default async function ConnectRoleDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);
  const connectorId = await getConnectorIdFromServerSession();
  if (!connectorId) redirect("/connect/login");

  type RoleDetailRow = {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    location: string | null;
    referral_bonus: string | null;
    companies: { name: string; description: string | null; website: string | null; logo_url: string | null } | null;
  };

  let row: RoleDetailRow | null = null;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("roles")
      .select(
        "id, title, slug, description, location, referral_bonus, companies ( name, description, website, logo_url )",
      )
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      return <p className="p-8 text-center text-sm text-red-800">{error.message}</p>;
    }
    if (!data) notFound();
    row = data as unknown as RoleDetailRow;
  } catch (e) {
    return (
      <p className="p-8 text-center text-sm text-red-800">
        {e instanceof Error ? e.message : "Configuration error"}
      </p>
    );
  }

  if (!row) notFound();

  const company = row.companies;
  const companyName = companyNameFromEmbed(
    company as { name: string } | { name: string }[] | null | undefined,
  );
  const co = Array.isArray(company) ? company[0] : company;
  const publicUrl = `${await getSiteBaseUrl()}/r/${encodeURIComponent(row.slug)}`;

  return (
    <div className="min-h-dvh bg-[#faf8f5]">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4 text-sm">
          <Link href="/connect/roles" className="font-medium text-amber-800 hover:underline">
            ← All open roles
          </Link>
          <div className="flex gap-4">
            <Link href="/connect/dashboard" className="text-stone-600 hover:text-stone-900">
              Dashboard
            </Link>
            <Link href="/" className="text-stone-500 hover:text-stone-800">
              Home
            </Link>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 lg:items-start">
          <article className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-amber-800/90">{companyName}</p>
            <h1 className="mt-2 font-serif text-2xl font-semibold text-stone-900">{row.title}</h1>
            {row.location ? <p className="mt-2 text-sm text-stone-600">{row.location}</p> : null}
            {row.description ? (
              <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{row.description}</div>
            ) : (
              <p className="mt-6 text-sm text-stone-500">No full description yet.</p>
            )}
            {co?.website ? (
              <p className="mt-6 text-sm">
                <a href={co.website} className="font-medium text-amber-800 hover:underline" target="_blank" rel="noreferrer">
                  Company website
                </a>
              </p>
            ) : null}

            {row.referral_bonus ? (
              <div className="mt-8 rounded-lg border border-amber-200/80 bg-amber-50/60 p-4">
                <p className="text-[10px] font-semibold uppercase tracking-wide text-amber-900/80">Referral bonus</p>
                <p className="mt-1 text-sm text-stone-800 whitespace-pre-wrap">{row.referral_bonus}</p>
                <p className="mt-2 text-xs text-stone-500">Not shown on the public job link.</p>
              </div>
            ) : null}

            <div className="mt-8 border-t border-stone-100 pt-6">
              <p className="text-sm font-medium text-stone-900">Share with candidates</p>
              <p className="mt-1 text-xs text-stone-600">
                This public page has role and company details only — no referral bonus.
              </p>
              <div className="mt-3">
                <CopyPublicLinkButton url={publicUrl} label="Copy public job link" />
              </div>
            </div>
          </article>

          <aside className="rounded-xl border border-stone-200 bg-white p-6 shadow-sm lg:sticky lg:top-8">
            <h2 className="font-semibold text-stone-900">Submit referral</h2>
            <p className="mt-1 text-sm text-stone-600">
              LinkedIn URL and “why they fit” are required. Name, email, and how you know them are optional.
            </p>
            <div className="mt-4">
              <ReferralForm roleId={row.id} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
