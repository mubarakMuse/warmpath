import { redirect } from "next/navigation";
import { ConnectorPortal, type ConnectReferralRow } from "@/app/connect/connector-portal";
import type { ConnectorMe } from "@/app/connect/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { getConnectorIdFromServerSession } from "@/lib/session/connector-session";

export const metadata = { title: "Connector dashboard" };

function companyNameFromEmbed(
  embed: { name: string } | { name: string }[] | null | undefined,
): string {
  if (!embed) return "—";
  if (Array.isArray(embed)) return embed[0]?.name ?? "—";
  return embed.name ?? "—";
}

export default async function ConnectDashboardPage() {
  const connectorId = await getConnectorIdFromServerSession();
  if (!connectorId) redirect("/connect/login");

  let loadError: string | null = null;
  let me: ConnectorMe | null = null;
  let referrals: ConnectReferralRow[] = [];

  try {
    const admin = createAdminClient();

    const { data: row, error: cErr } = await admin
      .from("connectors")
      .select("full_name, role_title, email, linkedin_url")
      .eq("id", connectorId)
      .maybeSingle();

    if (cErr?.code === "42P01" || cErr?.message?.includes("does not exist")) {
      loadError = "Connectors table missing. Run supabase/migrations/003_connectors_referrals.sql.";
    } else if (cErr || !row) {
      redirect("/connect/login");
    } else {
      me = row as ConnectorMe;
    }

    if (me) {
      const { data: refRows, error: refErr } = await admin
        .from("connector_referrals")
        .select(
          `
          id,
          created_at,
          candidate_linkedin_url,
          fit_description,
          candidate_name,
          candidate_email,
          relationship_type,
          relationship_other,
          referral_stage,
          company_reason_preset,
          company_reason_note,
          company_responded_at,
          roles ( title, companies ( name ) )
        `,
        )
        .eq("connector_id", connectorId)
        .order("created_at", { ascending: false })
        .limit(50);

      if (refErr) {
        if (!loadError && (refErr.code === "42P01" || refErr.message.includes("does not exist"))) {
          loadError = "Referrals table missing. Run migration 003_connectors_referrals.sql.";
        } else if (!loadError) loadError = refErr.message;
      } else {
        referrals = (refRows ?? []).map((x) => {
          const roleEmbed = x.roles as
            | { title: string; companies: { name: string } | { name: string }[] | null }
            | { title: string; companies: { name: string } | { name: string }[] | null }[]
            | null
            | undefined;
          const role = Array.isArray(roleEmbed) ? roleEmbed[0] : roleEmbed;
          return {
            id: x.id as string,
            created_at: x.created_at as string,
            candidate_linkedin_url: x.candidate_linkedin_url as string,
            fit_description: x.fit_description as string,
            candidate_name: (x as { candidate_name?: string | null }).candidate_name ?? null,
            candidate_email: (x as { candidate_email?: string | null }).candidate_email ?? null,
            relationship_type: (x as { relationship_type?: string | null }).relationship_type ?? null,
            relationship_other: (x as { relationship_other?: string | null }).relationship_other ?? null,
            role_title: role?.title ?? "—",
            company_name: companyNameFromEmbed(role?.companies),
            referral_stage:
              (x as { referral_stage?: string | null }).referral_stage?.trim() || "new",
            company_reason_preset:
              (x as { company_reason_preset?: string | null }).company_reason_preset ?? null,
            company_reason_note:
              (x as { company_reason_note?: string | null }).company_reason_note ?? null,
            company_responded_at:
              (x as { company_responded_at?: string | null }).company_responded_at ?? null,
          };
        });
      }
    }
  } catch (e) {
    loadError = e instanceof Error ? e.message : "Configuration error";
  }

  if (loadError) {
    return <p className="p-8 text-center text-sm text-red-800">{loadError}</p>;
  }

  if (!me) redirect("/connect/login");

  return (
    <div className="min-h-dvh bg-[#faf8f5]">
      <ConnectorPortal me={me} referrals={referrals} />
    </div>
  );
}
