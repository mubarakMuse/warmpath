import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { requireWarmpathJwtSecretBytes } from "@/lib/jwt-secret";
import { sessionCookieOptions } from "@/lib/session/cookie-options";

export const WP_COMPANY_COOKIE = "wp_company";

export async function signCompanySessionToken(companyId: string) {
  return new SignJWT({ typ: "wp_co" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(companyId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(requireWarmpathJwtSecretBytes());
}

export async function verifyCompanySessionToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, requireWarmpathJwtSecretBytes());
  if (payload.typ !== "wp_co") throw new Error("Invalid company session");
  const sub = payload.sub;
  if (!sub) throw new Error("Invalid company session");
  return sub;
}

export async function setCompanySessionCookie(token: string) {
  const store = await cookies();
  store.set(WP_COMPANY_COOKIE, token, sessionCookieOptions());
}

export async function clearCompanySessionCookie() {
  const store = await cookies();
  store.delete(WP_COMPANY_COOKIE);
}

export async function getCompanyIdFromServerSession(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(WP_COMPANY_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifyCompanySessionToken(token);
  } catch {
    return null;
  }
}
