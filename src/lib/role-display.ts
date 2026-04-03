import type { SupabaseClient } from "@supabase/supabase-js";

/** Shape expected by PublicRoleHero + HirerPublicCard (joined from profiles + companies). */
export type RoleCardDisplay = {
  hirer_full_name: string | null;
  hirer_linkedin_url: string | null;
  hirer_avatar_url: string | null;
  company_name: string | null;
  company_website: string | null;
  company_linkedin_url: string | null;
  company_logo_url: string | null;
};

export async function buildRoleCardDisplay(
  admin: SupabaseClient,
  opts: { hirer_id: string | null; company_id: string | null },
): Promise<RoleCardDisplay> {
  const out: RoleCardDisplay = {
    hirer_full_name: null,
    hirer_linkedin_url: null,
    hirer_avatar_url: null,
    company_name: null,
    company_website: null,
    company_linkedin_url: null,
    company_logo_url: null,
  };

  if (opts.hirer_id) {
    const { data: p } = await admin
      .from("profiles")
      .select("full_name, linkedin_url, avatar_url")
      .eq("id", opts.hirer_id)
      .maybeSingle();
    if (p) {
      out.hirer_full_name = (p.full_name as string) ?? null;
      out.hirer_linkedin_url = (p.linkedin_url as string | null) ?? null;
      out.hirer_avatar_url = (p.avatar_url as string | null) ?? null;
    }
  }

  if (opts.company_id) {
    const { data: c } = await admin
      .from("companies")
      .select("name, website, linkedin_url, logo_url")
      .eq("id", opts.company_id)
      .maybeSingle();
    if (c) {
      out.company_name = (c.name as string) ?? null;
      out.company_website = (c.website as string | null) ?? null;
      out.company_linkedin_url = (c.linkedin_url as string | null) ?? null;
      out.company_logo_url = (c.logo_url as string | null) ?? null;
    }
  }

  return out;
}
