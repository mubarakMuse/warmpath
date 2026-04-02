import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

/**
 * Hiring session: httpOnly cookie stores `profiles.id` (signed JWT).
 * Google (Supabase Auth) completes in `/auth/callback`, then we set this cookie after linking `auth_user_id`.
 */
export const WP_SESSION_COOKIE = "wp_session";

export function wpSessionCookieOptions() {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  };
}

function getSecret() {
  const raw = process.env.WARMPATH_SESSION_SECRET;
  if (!raw || raw.length < 16) {
    throw new Error("Set WARMPATH_SESSION_SECRET (at least 16 characters) in .env.local");
  }
  return new TextEncoder().encode(raw);
}

export async function signProfileSession(profileId: string) {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(profileId)
    .setIssuedAt()
    .setExpirationTime("365d")
    .sign(getSecret());
}

export async function verifyProfileSession(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  const sub = payload.sub;
  if (!sub) throw new Error("Invalid session");
  return sub;
}

export async function getProfileIdFromSession(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(WP_SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifyProfileSession(token);
  } catch {
    return null;
  }
}

export async function setProfileSessionCookie(token: string) {
  const store = await cookies();
  store.set(WP_SESSION_COOKIE, token, wpSessionCookieOptions());
}

export async function clearProfileSessionCookie() {
  const store = await cookies();
  store.delete(WP_SESSION_COOKIE);
}
