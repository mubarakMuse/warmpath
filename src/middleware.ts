import { jwtVerify } from "jose";
import { NextResponse, type NextRequest } from "next/server";
import { getWarmpathJwtSecretBytes } from "@/lib/jwt-secret";
import { WP_ADMIN_COOKIE } from "@/lib/session/admin-session";
import { WP_COMPANY_COOKIE } from "@/lib/session/company-session";
import { WP_CONNECTOR_COOKIE } from "@/lib/session/connector-session";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const secret = getWarmpathJwtSecretBytes();

  if (pathname.startsWith("/admin") && pathname !== "/admin/login") {
    if (!secret) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    const token = request.cookies.get(WP_ADMIN_COOKIE)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    try {
      const { payload } = await jwtVerify(token, secret);
      if (payload.typ !== "wp_admin") throw new Error("no");
    } catch {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
  }

  if (pathname.startsWith("/company/") && !pathname.startsWith("/company/login")) {
    if (!secret) {
      return NextResponse.redirect(new URL("/company/login", request.url));
    }
    const token = request.cookies.get(WP_COMPANY_COOKIE)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/company/login", request.url));
    }
    try {
      const { payload } = await jwtVerify(token, secret);
      if (payload.typ !== "wp_co" || !payload.sub) throw new Error("no");
    } catch {
      return NextResponse.redirect(new URL("/company/login", request.url));
    }
  }

  if (pathname.startsWith("/connect/dashboard") || pathname.startsWith("/connect/roles")) {
    if (!secret) {
      return NextResponse.redirect(new URL("/connect/login", request.url));
    }
    const token = request.cookies.get(WP_CONNECTOR_COOKIE)?.value;
    if (!token) {
      return NextResponse.redirect(new URL("/connect/login", request.url));
    }
    try {
      const { payload } = await jwtVerify(token, secret);
      if (payload.typ !== "wp_conn" || !payload.sub) throw new Error("no");
    } catch {
      return NextResponse.redirect(new URL("/connect/login", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin",
    "/admin/:path*",
    "/company/:path*",
    "/connect/dashboard",
    "/connect/dashboard/:path*",
    "/connect/roles",
    "/connect/roles/:path*",
  ],
};
