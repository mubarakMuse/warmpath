import { redirect } from "next/navigation";
import { ConnectRolesSearch, type RoleListItem } from "@/app/connect/roles-search";
import { PageHeader } from "@/app/components/shell/page-header";
import { SaasCard } from "@/app/components/shell/saas-card";
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
    return (
      <SaasCard className="border-red-200 bg-red-50/50">
        <p className="text-sm text-red-800">{loadError}</p>
      </SaasCard>
    );
  }

  return (
    <>
      <PageHeader
        title="Open roles"
        description="Search by company or title. Open a role to read the full description, see referral bonus, and submit."
      />
      <SaasCard>
        <ConnectRolesSearch roles={roles} />
      </SaasCard>
    </>
  );
}
