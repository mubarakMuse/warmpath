import { createAdminClient } from "@/lib/supabase/admin";
import { buildRoleCardDisplay, type RoleCardDisplay } from "@/lib/role-display";

export type PublicRoleView = {
  id: string;
  title: string;
  description: string | null;
  slug: string;
  status: string;
  location: string | null;
  match_bonus: string | null;
  hirer_id: string | null;
  company_id: string | null;
} & RoleCardDisplay;

/**
 * Load a role for the public page (server-only, service role).
 * Mirrors RLS: not draft and has a hiring manager.
 */
export async function loadPublicRoleBySlug(slug: string): Promise<PublicRoleView | null> {
  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return null;
  }

  const { data: role } = await admin
    .from("roles")
    .select("id, title, description, slug, status, location, match_bonus, hirer_id, company_id")
    .eq("slug", slug)
    .maybeSingle();

  if (!role) return null;
  if (role.status === "draft" || !role.hirer_id) return null;

  const card = await buildRoleCardDisplay(admin, {
    hirer_id: role.hirer_id as string,
    company_id: (role.company_id as string | null) ?? null,
  });

  return {
    id: role.id as string,
    title: role.title as string,
    description: (role.description as string | null) ?? null,
    slug: role.slug as string,
    status: role.status as string,
    location: (role.location as string | null) ?? null,
    match_bonus: (role.match_bonus as string | null) ?? null,
    hirer_id: role.hirer_id as string,
    company_id: (role.company_id as string | null) ?? null,
    ...card,
  };
}
