import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Must match the key used in lib/tokens.ts
const ACCESS_TOKEN_COOKIE = "gis_access_token";

// Routes that require a valid access token
const PROTECTED_PREFIXES = ["/dashboard", "/transfer", "/profile", "/settings"];

// Routes only accessible when NOT authenticated
const AUTH_PREFIXES = ["/auth"];

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;

  const isProtected = PROTECTED_PREFIXES.some((p) => pathname.startsWith(p));
  const isAuthPage  = AUTH_PREFIXES.some((p) => pathname.startsWith(p));

  // Root "/" → redirect based on auth state
  if (pathname === "/") {
    const dest = token ? "/dashboard" : "/auth/login";
    return NextResponse.redirect(new URL(dest, request.url));
  }

  // No token on a protected page → send to login, preserve intended destination
  if (isProtected && !token) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("redirect", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Already authenticated on an auth page → go to dashboard
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Run proxy on all paths except:
     * - _next/static  (Next.js static assets)
     * - _next/image   (image optimisation)
     * - favicon.ico
     * - public static files (svg, png, jpg, etc.)
     * - /api/*        (API routes / MSW-intercepted requests)
     */
    "/((?!_next/static|_next/image|favicon\\.ico|api/|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
