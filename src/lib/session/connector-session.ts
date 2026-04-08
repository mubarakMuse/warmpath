import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { requireWarmpathJwtSecretBytes } from "@/lib/jwt-secret";
import { sessionCookieOptions } from "@/lib/session/cookie-options";

export const WP_CONNECTOR_COOKIE = "wp_connector";

export async function signConnectorSessionToken(connectorId: string) {
  return new SignJWT({ typ: "wp_conn" })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(connectorId)
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(requireWarmpathJwtSecretBytes());
}

export async function verifyConnectorSessionToken(token: string): Promise<string> {
  const { payload } = await jwtVerify(token, requireWarmpathJwtSecretBytes());
  if (payload.typ !== "wp_conn") throw new Error("Invalid connector session");
  const sub = payload.sub;
  if (!sub) throw new Error("Invalid connector session");
  return sub;
}

export async function setConnectorSessionCookie(token: string) {
  const store = await cookies();
  store.set(WP_CONNECTOR_COOKIE, token, sessionCookieOptions());
}

export async function clearConnectorSessionCookie() {
  const store = await cookies();
  store.delete(WP_CONNECTOR_COOKIE);
}

export async function getConnectorIdFromServerSession(): Promise<string | null> {
  const store = await cookies();
  const token = store.get(WP_CONNECTOR_COOKIE)?.value;
  if (!token) return null;
  try {
    return await verifyConnectorSessionToken(token);
  } catch {
    return null;
  }
}
