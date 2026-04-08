import { redirect } from "next/navigation";
import { CompanySettingsForm } from "@/app/company/company-settings-form";
import { PageHeader } from "@/app/components/shell/page-header";
import { SaasCard } from "@/app/components/shell/saas-card";
import { fetchCompanyProfile } from "@/lib/company-portal-data";
import { getCompanyIdFromServerSession } from "@/lib/session/company-session";

export const metadata = { title: "Settings · Company" };

export default async function CompanySettingsPage() {
  const companyId = await getCompanyIdFromServerSession();
  if (!companyId) redirect("/company/login");

  const company = await fetchCompanyProfile(companyId);
  if (!company) redirect("/company/login");

  return (
    <>
      <PageHeader
        title="Company settings"
        description="These fields appear on your public job pages where relevant. The access code stays the same for connector sign-in flows you configure separately."
      />
      <SaasCard>
        <CompanySettingsForm company={company} />
      </SaasCard>
    </>
  );
}
