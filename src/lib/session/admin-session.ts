import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { requireWarmpathJwtSecretBytes } from "@/lib/jwt-secret";
import { sessionCookieOptions } from "@/lib/session/cookie-options";

export const WP_ADMIN_COOKIE = "wp_admin";

export async function signAdminSessionToken() {
  return new SignJWT({ typ: "wp_admin" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject("admin")
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(requireWarmpathJwtSecretBytes());
}

export async function verifyAdminSessionToken(token: string) {
  const { payload } = await jwtVerify(token, requireWarmpathJwtSecretBytes());
  if (payload.typ !== "wp_admin") throw new Error("Invalid admin session");
  return true;
}

export async function setAdminSessionCookie(token: string) {
  const store = await cookies();
  store.set(WP_ADMIN_COOKIE, token, sessionCookieOptions());
}

export async function clearAdminSessionCookie() {
  const store = await cookies();
  store.delete(WP_ADMIN_COOKIE);
}

export async function isAdminServerSession(): Promise<boolean> {
  const store = await cookies();
  const token = store.get(WP_ADMIN_COOKIE)?.value;
  if (!token) return false;
  try {
    await verifyAdminSessionToken(token);
    return true;
  } catch {
    return false;
  }
}
