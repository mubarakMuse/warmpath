import { redirect } from "next/navigation";
import { ConnectorAppShell } from "@/app/components/shell/connector-app-shell";
import type { ConnectorMe } from "@/app/connect/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { getConnectorIdFromServerSession } from "@/lib/session/connector-session";

export default async function ConnectPortalLayout({ children }: { children: React.ReactNode }) {
  const connectorId = await getConnectorIdFromServerSession();
  if (!connectorId) redirect("/connect/login");

  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("connectors")
      .select("full_name, role_title, email, linkedin_url")
      .eq("id", connectorId)
      .maybeSingle();

    if (error || !data) redirect("/connect/login");

    return <ConnectorAppShell me={data as ConnectorMe}>{children}</ConnectorAppShell>;
  } catch {
    redirect("/connect/login");
  }
}
