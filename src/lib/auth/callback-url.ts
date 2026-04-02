import type { GoogleAuthIntent } from "@/components/google-sign-in-button";

/** OAuth + magic-link redirect target (query preserved through Supabase). */
export function buildAuthCallbackUrl(
  origin: string,
  nextPath: string,
  intent: GoogleAuthIntent,
) {
  const u = new URL(`${origin}/auth/callback`);
  u.searchParams.set("next", nextPath);
  u.searchParams.set("intent", intent);
  return u.toString();
}
