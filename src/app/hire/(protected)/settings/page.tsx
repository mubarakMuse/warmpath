import Link from "next/link";
import { redirect } from "next/navigation";
import { HirerSettingsForm } from "@/components/hirer-settings-form";
import { createAdminClient } from "@/lib/supabase/admin";
import { getProfileIdFromSession } from "@/lib/session/profile";

export default async function HirerSettingsPage() {
  const profileId = await getProfileIdFromSession();
  if (!profileId) redirect("/hire/sign-up");

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return (
      <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
        Missing Supabase service role key in .env.local.
      </p>
    );
  }

  const { data: profile, error } = await admin
    .from("profiles")
    .select(
      "email, full_name, linkedin_url, avatar_url, company_name, company_website, company_linkedin_url, company_logo_url",
    )
    .eq("id", profileId)
    .single();

  if (error || !profile) {
    return <p className="text-sm text-red-700">Could not load your profile.</p>;
  }

  return (
    <div>
      <Link
        href="/hire/dashboard"
        className="text-sm font-medium text-warm-muted hover:text-warm-accent"
      >
        ← Dashboard
      </Link>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-warm-ink">Your profile & company</h1>
      <p className="mt-2 max-w-xl text-sm text-warm-muted">
        This information appears on public role pages (hiring manager card + company). Fill it before
        sharing links so referrers have context. Saving updates all your open roles.
      </p>
      <div className="mt-10">
        <HirerSettingsForm
          defaults={{
            full_name: profile.full_name,
            email: profile.email,
            linkedin_url: profile.linkedin_url,
            avatar_url: profile.avatar_url,
            company_name: profile.company_name,
            company_website: profile.company_website,
            company_linkedin_url: profile.company_linkedin_url,
            company_logo_url: profile.company_logo_url,
          }}
        />
      </div>
    </div>
  );
}
