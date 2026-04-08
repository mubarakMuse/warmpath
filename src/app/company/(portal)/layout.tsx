import { redirect } from "next/navigation";
import { CompanyAppShell } from "@/app/components/shell/company-app-shell";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCompanyIdFromServerSession } from "@/lib/session/company-session";

export default async function CompanyPortalLayout({ children }: { children: React.ReactNode }) {
  const companyId = await getCompanyIdFromServerSession();
  if (!companyId) redirect("/company/login");

  let name = "Company";
  let code = "";
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("companies")
      .select("name, access_code")
      .eq("id", companyId)
      .maybeSingle();
    if (error || !data) redirect("/company/login");
    name = data.name as string;
    code = data.access_code as string;
  } catch {
    redirect("/company/login");
  }

  return (
    <CompanyAppShell companyName={name} accessCode={code}>
      {children}
    </CompanyAppShell>
  );
}
