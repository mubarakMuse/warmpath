import type { User } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";

export type OAuthIntent = "hire" | "connector";

function displayName(user: User, email: string) {
  const meta = user.user_metadata ?? {};
  if (typeof meta.full_name === "string" && meta.full_name.trim()) return meta.full_name.trim();
  if (typeof meta.name === "string" && meta.name.trim()) return meta.name.trim();
  return email.split("@")[0] ?? "User";
}

function avatarFromUser(user: User) {
  const meta = user.user_metadata ?? {};
  if (typeof meta.avatar_url === "string" && meta.avatar_url) return meta.avatar_url;
  if (typeof meta.picture === "string" && meta.picture) return meta.picture;
  return null;
}

/**
 * Resolves or creates `profiles.id` after Supabase Auth (Google or magic link).
 *
 * - **hire**: link/create hirer (use `/hire/sign-up`); upgrades `connector` → `hirer` when linking with hire intent.
 * - **connector**: link/create connector (default `/login`); existing hirers/admins keep their role.
 */
export async function ensureProfileForOAuth(
  user: User,
  options: { intent: OAuthIntent },
): Promise<string> {
  const email = user.email?.trim().toLowerCase();
  if (!email) {
    throw new Error("Your Google account has no email address.");
  }

  const admin = createAdminClient();
  const authId = user.id;
  const fullName = displayName(user, email);
  const avatarUrl = avatarFromUser(user);
  const { intent } = options;

  const { data: byAuth, error: byAuthErr } = await admin
    .from("profiles")
    .select("id, account_role")
    .eq("auth_user_id", authId)
    .maybeSingle();

  if (byAuthErr) throw new Error(byAuthErr.message);
  if (byAuth?.id) {
    // Returning users must still apply hire vs connector rules (early return used to skip connector→hirer).
    if (intent === "hire" && byAuth.account_role === "connector") {
      const updates: Record<string, unknown> = {
        account_role: "hirer",
        full_name: fullName,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      };
      const { error: upErr } = await admin.from("profiles").update(updates).eq("id", byAuth.id);
      if (upErr) throw new Error(upErr.message);
    } else {
      const { error: upErr } = await admin
        .from("profiles")
        .update({
          full_name: fullName,
          ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        })
        .eq("id", byAuth.id);
      if (upErr) throw new Error(upErr.message);
    }
    return byAuth.id;
  }

  const { data: byEmail, error: byEmailErr } = await admin
    .from("profiles")
    .select("id, auth_user_id, account_role, claim_status")
    .eq("email", email)
    .maybeSingle();

  if (byEmailErr) throw new Error(byEmailErr.message);

  if (byEmail?.id) {
    if (byEmail.auth_user_id && byEmail.auth_user_id !== authId) {
      throw new Error("This email is already linked to a different sign-in.");
    }

    if (intent === "hire") {
      const updates: Record<string, unknown> = {
        auth_user_id: authId,
        full_name: fullName,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
        claim_status: "active",
        invite_token: null,
        invite_expires_at: null,
      };
      if (byEmail.account_role === "connector") {
        updates.account_role = "hirer";
      }
      const { error: upErr } = await admin.from("profiles").update(updates).eq("id", byEmail.id);
      if (upErr) throw new Error(upErr.message);
      return byEmail.id;
    }

    const { error: upErr } = await admin
      .from("profiles")
      .update({
        auth_user_id: authId,
        full_name: fullName,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      })
      .eq("id", byEmail.id);

    if (upErr) throw new Error(upErr.message);
    return byEmail.id;
  }

  if (intent === "connector") {
    const { data: inserted, error: insErr } = await admin
      .from("profiles")
      .insert({
        email,
        full_name: fullName,
        auth_user_id: authId,
        account_role: "connector",
        claim_status: "active",
        access_code: null,
        ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
      })
      .select("id")
      .single();

    if (insErr) throw new Error(insErr.message);
    if (!inserted?.id) throw new Error("Could not create your profile.");
    return inserted.id;
  }

  const { data: inserted, error: insErr } = await admin
    .from("profiles")
    .insert({
      email,
      full_name: fullName,
      auth_user_id: authId,
      account_role: "hirer",
      claim_status: "active",
      access_code: null,
      ...(avatarUrl ? { avatar_url: avatarUrl } : {}),
    })
    .select("id")
    .single();

  if (insErr) throw new Error(insErr.message);
  if (!inserted?.id) throw new Error("Could not create your profile.");
  return inserted.id;
}
