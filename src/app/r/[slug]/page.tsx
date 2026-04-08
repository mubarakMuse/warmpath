import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  return { title: `Job · ${decodeURIComponent(slug)}` };
}

function companyNameFromEmbed(
  embed: { name: string } | { name: string }[] | null | undefined,
): string {
  if (!embed) return "—";
  if (Array.isArray(embed)) return embed[0]?.name ?? "—";
  return embed.name ?? "—";
}

export default async function PublicRolePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: raw } = await params;
  const slug = decodeURIComponent(raw);

  type PublicRoleRow = {
    title: string;
    slug: string;
    description: string | null;
    location: string | null;
    companies: {
      name: string;
      description: string | null;
      website: string | null;
      logo_url: string | null;
      linkedin_url: string | null;
    } | null;
  };

  let row: PublicRoleRow | null = null;

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("roles")
      .select(
        "title, slug, description, location, companies ( name, description, website, logo_url, linkedin_url )",
      )
      .eq("slug", slug)
      .eq("status", "active")
      .maybeSingle();

    if (error) {
      return <p className="p-8 text-center text-sm text-red-800">{error.message}</p>;
    }
    if (!data) notFound();
    row = data as unknown as PublicRoleRow;
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

  return (
    <div className="min-h-dvh bg-gradient-to-b from-[#faf8f5] to-[#f5f0e8]">
      <main className="mx-auto max-w-2xl px-6 py-14">
        <p className="text-center text-xs font-semibold uppercase tracking-[0.2em] text-amber-800/90">Open role</p>
        <h1 className="mt-4 text-center font-serif text-3xl font-semibold text-stone-900">{row.title}</h1>
        <p className="mt-2 text-center text-lg text-stone-700">{companyName}</p>
        {row.location ? <p className="mt-2 text-center text-sm text-stone-500">{row.location}</p> : null}

        <div className="mt-10 rounded-xl border border-stone-200 bg-white/90 p-6 shadow-sm backdrop-blur-sm">
          {co?.description ? (
            <section>
              <h2 className="text-sm font-semibold text-stone-900">About the company</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{co.description}</p>
            </section>
          ) : null}

          {row.description ? (
            <section className={co?.description ? "mt-8" : ""}>
              <h2 className="text-sm font-semibold text-stone-900">Role</h2>
              <div className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-stone-700">{row.description}</div>
            </section>
          ) : (
            <p className="text-sm text-stone-600">More details coming soon.</p>
          )}

          <div className="mt-8 flex flex-wrap gap-4 border-t border-stone-100 pt-6">
            {co?.website ? (
              <a
                href={co.website}
                className="text-sm font-medium text-amber-800 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                Website
              </a>
            ) : null}
            {co?.linkedin_url ? (
              <a
                href={co.linkedin_url}
                className="text-sm font-medium text-amber-800 hover:underline"
                target="_blank"
                rel="noreferrer"
              >
                LinkedIn
              </a>
            ) : null}
          </div>
        </div>

        <p className="mt-10 text-center text-xs text-stone-400">Shared via Warmpath</p>
      </main>
    </div>
  );
}
