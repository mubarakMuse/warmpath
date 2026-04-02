import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import {
  ensureProfileForOAuth,
  type OAuthIntent,
} from "@/lib/auth/oauth-profile";
import {
  signProfileSession,
  wpSessionCookieOptions,
  WP_SESSION_COOKIE,
} from "@/lib/session/profile";

function safeNextPath(raw: string | null, fallback: string) {
  if (raw && raw.startsWith("/") && !raw.startsWith("//")) return raw;
  return fallback;
}

function oauthErrorRedirect(
  origin: string,
  intent: OAuthIntent,
  nextPath: string,
  message: string,
) {
  if (intent === "connector" && nextPath.startsWith("/r/")) {
    return NextResponse.redirect(
      new URL(`${nextPath}?error=${encodeURIComponent(message)}`, origin),
    );
  }
  if (intent === "hire") {
    return NextResponse.redirect(
      new URL(`/hire/sign-up?error=${encodeURIComponent(message)}`, origin),
    );
  }
  return NextResponse.redirect(
    new URL(`/login?error=${encodeURIComponent(message)}`, origin),
  );
}

export async function GET(request: Request) {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.redirect(new URL("/login?error=config", request.url));
  }

  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const tokenHash = searchParams.get("token_hash");
  const otpType = searchParams.get("type");
  const intent = (searchParams.get("intent") === "connector" ? "connector" : "hire") as OAuthIntent;
  const defaultNext = intent === "connector" ? "/connect/dashboard" : "/hire/dashboard";
  const nextPath = safeNextPath(searchParams.get("next"), defaultNext);
  /** Successful connector auth always lands on the connector dashboard (not the role page). */
  const successPath = intent === "connector" ? "/connect/dashboard" : nextPath;

  if (!code && !(tokenHash && otpType)) {
    return oauthErrorRedirect(origin, intent, nextPath, "missing_code");
  }

  const cookieStore = await cookies();
  const response = NextResponse.redirect(new URL(successPath, origin));

  const supabase = createServerClient(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => {
          response.cookies.set(name, value, options);
        });
      },
    },
  });

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) {
      return oauthErrorRedirect(origin, intent, nextPath, exchangeError.message);
    }
  } else if (tokenHash && otpType) {
    const { error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: otpType as "email" | "magiclink" | "signup",
    });
    if (verifyError) {
      return oauthErrorRedirect(origin, intent, nextPath, verifyError.message);
    }
  }

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return oauthErrorRedirect(origin, intent, nextPath, userError?.message ?? "no_user");
  }

  try {
    const profileId = await ensureProfileForOAuth(user, { intent });
    const token = await signProfileSession(profileId);
    response.cookies.set(WP_SESSION_COOKIE, token, wpSessionCookieOptions());
  } catch (e) {
    const message = e instanceof Error ? e.message : "profile_error";
    return oauthErrorRedirect(origin, intent, nextPath, message);
  }

  return response;
}
