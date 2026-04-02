import { createAdminClient } from "@/lib/supabase/admin";
import { getProfileIdFromSession } from "@/lib/session/profile";

export type SessionProfileRow = {
  id: string;
  email: string;
  full_name: string;
  account_role: string;
  claim_status: string;
  avatar_url: string | null;
};

/** Loads the logged-in profile row (service role). Returns null if no session or missing row. */
export async function getSessionProfileRow(): Promise<SessionProfileRow | null> {
  const id = await getProfileIdFromSession();
  if (!id) return null;

  let admin;
  try {
    admin = createAdminClient();
  } catch {
    return null;
  }

  const { data } = await admin
    .from("profiles")
    .select("id, email, full_name, account_role, claim_status, avatar_url")
    .eq("id", id)
    .maybeSingle();

  return data ?? null;
}

/** For marketing header: signed-in user chip (avatar + dashboard link). */
export async function getHeaderSessionUser(): Promise<{
  full_name: string;
  avatar_url: string | null;
  dashboardHref: string;
} | null> {
  const row = await getSessionProfileRow();
  if (!row) return null;
  const dashboardHref =
    row.account_role === "connector"
      ? "/connect/dashboard"
      : row.account_role === "hirer" || row.account_role === "admin"
        ? "/hire/dashboard"
        : "/";
  return {
    full_name: row.full_name,
    avatar_url: row.avatar_url,
    dashboardHref,
  };
}
