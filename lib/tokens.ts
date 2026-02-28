import Cookies from "js-cookie";

// SECURITY NOTE: js-cookie sets JavaScript-readable cookies (not HTTP-only).
// This is acceptable for a demo environment but is vulnerable to XSS.
// In production, tokens should be set as HTTP-only cookies by the server.

const ACCESS_KEY = "gis_access_token";
const REFRESH_KEY = "gis_refresh_token";

// Shared cookie options — SameSite=Strict prevents CSRF, path="/" ensures
// the cookie is readable on all routes regardless of where it was set.
const BASE_OPTS: Cookies.CookieAttributes = { sameSite: "strict", path: "/" };

export function getAccessToken(): string | null {
  return Cookies.get(ACCESS_KEY) ?? null;
}

export function getRefreshToken(): string | null {
  return Cookies.get(REFRESH_KEY) ?? null;
}

export function saveTokens(accessToken: string, refreshToken: string): void {
  // Access token: 15-minute expiry (1/96 of a day), matching spec
  Cookies.set(ACCESS_KEY, accessToken, { ...BASE_OPTS, expires: 1 / 96 });
  // Refresh token: 7-day expiry, matching spec
  Cookies.set(REFRESH_KEY, refreshToken, { ...BASE_OPTS, expires: 7 });
}

export function clearTokens(): void {
  Cookies.remove(ACCESS_KEY);
  Cookies.remove(REFRESH_KEY);
}
