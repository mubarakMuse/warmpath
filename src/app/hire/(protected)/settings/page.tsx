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
    .select("email, full_name, linkedin_url, avatar_url")
    .eq("id", profileId)
    .single();

  if (error || !profile) {
    return <p className="text-sm text-red-700">Could not load your profile.</p>;
  }

  const { data: links } = await admin
    .from("profile_companies")
    .select("company_id, is_primary")
    .eq("profile_id", profileId);

  const companyIds = [...new Set((links ?? []).map((l) => l.company_id as string))];
  let orgList: { id: string; name: string; is_primary: boolean }[] = [];
  if (companyIds.length > 0) {
    const { data: cos } = await admin
      .from("companies")
      .select("id, name")
      .in("id", companyIds);
    const primaryId = (links ?? []).find((l) => l.is_primary)?.company_id as string | undefined;
    orgList = (cos ?? []).map((c) => ({
      id: c.id as string,
      name: c.name as string,
      is_primary: c.id === primaryId,
    }));
    orgList.sort((a, b) => {
      if (a.is_primary !== b.is_primary) return a.is_primary ? -1 : 1;
      return a.name.localeCompare(b.name);
    });
  }

  return (
    <div>
      <Link
        href="/hire/dashboard"
        className="text-sm font-medium text-warm-muted hover:text-warm-accent"
      >
        ← Dashboard
      </Link>
      <h1 className="mt-4 font-serif text-3xl font-semibold text-warm-ink">Your profile</h1>
      <p className="mt-2 max-w-xl text-sm text-warm-muted">
        Edit how you appear on public role pages (your name and links). Company name, logo, and site
        come from each role’s organization—your admin sets those on the company and role.
      </p>

      {orgList.length > 0 ? (
        <div className="mt-8 rounded-2xl border border-stone-200 bg-white p-5 shadow-sm">
          <h2 className="text-xs font-semibold uppercase tracking-wide text-warm-muted">
            Organizations you’re linked to
          </h2>
          <ul className="mt-3 space-y-2 text-sm text-warm-ink">
            {orgList.map((o) => (
              <li key={o.id} className="flex flex-wrap items-center gap-2">
                <span className="font-medium">{o.name}</span>
                {o.is_primary ? (
                  <span className="rounded-full bg-stone-100 px-2 py-0.5 text-[11px] font-medium text-warm-muted">
                    Primary (default for new roles)
                  </span>
                ) : null}
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-10">
        <HirerSettingsForm
          defaults={{
            full_name: profile.full_name,
            email: profile.email,
            linkedin_url: profile.linkedin_url,
            avatar_url: profile.avatar_url,
          }}
        />
      </div>
    </div>
  );
}
