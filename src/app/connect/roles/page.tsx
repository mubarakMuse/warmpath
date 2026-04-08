import Link from "next/link";
import { redirect } from "next/navigation";
import { ConnectRolesSearch, type RoleListItem } from "@/app/connect/roles-search";
import { createAdminClient } from "@/lib/supabase/admin";
import { getConnectorIdFromServerSession } from "@/lib/session/connector-session";

export const metadata = { title: "Open roles · Connector" };

function companyNameFromEmbed(
  embed: { name: string } | { name: string }[] | null | undefined,
): string {
  if (!embed) return "—";
  if (Array.isArray(embed)) return embed[0]?.name ?? "—";
  return embed.name ?? "—";
}

export default async function ConnectRolesPage() {
  const connectorId = await getConnectorIdFromServerSession();
  if (!connectorId) redirect("/connect/login");

  let loadError: string | null = null;
  let roles: RoleListItem[] = [];

  try {
    const admin = createAdminClient();
    const { data: roleRows, error: rErr } = await admin
      .from("roles")
      .select("id, title, slug, location, companies ( name )")
      .eq("status", "active")
      .order("title");

    if (rErr) loadError = rErr.message;
    else {
      roles = (roleRows ?? []).map((r) => ({
        id: r.id as string,
        title: r.title as string,
        slug: r.slug as string,
        location: (r.location as string | null) ?? null,
        company_name: companyNameFromEmbed(
          r.companies as { name: string } | { name: string }[] | null | undefined,
        ),
      }));
    }
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Configuration error";
  }

  if (loadError) {
    return <p className="p-8 text-center text-sm text-red-800">{loadError}</p>;
  }

  return (
    <div className="min-h-dvh bg-[#faf8f5]">
      <div className="mx-auto max-w-2xl space-y-8 px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-serif text-2xl font-semibold text-stone-900">Open roles</h1>
            <p className="mt-1 text-sm text-stone-600">Search, open a role, and submit a referral next to the job details.</p>
          </div>
          <div className="flex flex-wrap gap-3 text-sm">
            <Link href="/connect/dashboard" className="text-amber-800 hover:underline">
              Dashboard
            </Link>
            <Link href="/" className="text-stone-500 hover:text-stone-800">
              Home
            </Link>
          </div>
        </div>
        <ConnectRolesSearch roles={roles} />
      </div>
    </div>
  );
}
