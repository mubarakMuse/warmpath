import { redirect } from "next/navigation";
import { CreateRoleForm } from "@/components/create-role-form";
import { listCompaniesForProfile } from "@/lib/admin/profile-companies";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfileIdFromSession } from "@/lib/session/profile";

export default async function NewRolePage() {
  const profileId = await getProfileIdFromSession();
  if (!profileId) redirect("/hire/sign-up");

  let companies: { id: string; name: string; is_primary: boolean }[] = [];
  try {
    const admin = createAdminClient();
    companies = await listCompaniesForProfile(admin, profileId);
  } catch {
    /* missing service role */
  }

  const primary = companies.find((c) => c.is_primary);
  const defaultCompanyId = primary?.id ?? companies[0]?.id ?? "";

  return (
    <div>
      <h1 className="font-serif text-2xl font-semibold text-warm-ink">New role</h1>
      <p className="mt-1 max-w-lg text-sm text-warm-muted">
        Create a shareable page for this search. You can change details anytime from the role page.
      </p>
      <div className="mt-8">
        <CreateRoleForm companies={companies} defaultCompanyId={defaultCompanyId} />
      </div>
    </div>
  );
}
