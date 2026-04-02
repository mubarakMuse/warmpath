import { getSessionProfileRow } from "@/lib/session/session-profile";

function adminEmailAllowlist(): Set<string> {
  const raw = process.env.WARMPATH_ADMIN_EMAILS ?? "";
  return new Set(
    raw
      .split(",")
      .map((e) => e.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isAdminProfile(email: string, accountRole: string): boolean {
  if (accountRole === "admin") return true;
  return adminEmailAllowlist().has(email.trim().toLowerCase());
}

/** Current user may access /admin. */
export async function getAdminSessionProfile() {
  const row = await getSessionProfileRow();
  if (!row) return null;
  if (!isAdminProfile(row.email, row.account_role)) return null;
  return row;
}
