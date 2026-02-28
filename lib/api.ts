import { getAccessToken, getRefreshToken, saveTokens, clearTokens } from "./tokens";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";

// Tracks whether a token refresh is already in flight to prevent races
let refreshPromise: Promise<string | null> | null = null;

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return null;

  try {
    const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });

    if (!res.ok) {
      clearTokens();
      return null;
    }

    const data = await res.json();
    const newAccess: string = data.data.access_token;
    // Refresh token stays the same; only access token is rotated
    saveTokens(newAccess, refreshToken);
    return newAccess;
  } catch {
    clearTokens();
    return null;
  }
}

interface ApiOptions extends Omit<RequestInit, "body"> {
  body?: unknown;
}

/**
 * Typed fetch wrapper for all auth API calls.
 * - Attaches Authorization header and X-Request-ID per spec.
 * - Automatically retries once after a 401 by refreshing the access token.
 * - On unrecoverable 401, clears tokens (middleware will redirect to login).
 */
export async function apiRequest<T>(
  path: string,
  { body, headers, ...options }: ApiOptions = {}
): Promise<T> {
  const accessToken = getAccessToken();

  const buildHeaders = (token: string | null): HeadersInit => ({
    "Content-Type": "application/json",
    "X-Request-ID": crypto.randomUUID(),
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(headers as Record<string, string>),
  });

  const makeRequest = (token: string | null) =>
    fetch(`${BASE_URL}${path}`, {
      ...options,
      headers: buildHeaders(token),
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

  let res = await makeRequest(accessToken);

  // On 401, attempt a single token refresh then retry
  if (res.status === 401) {
    if (!refreshPromise) {
      refreshPromise = refreshAccessToken().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;

    if (!newToken) {
      // Refresh failed — force re-login via hard navigation
      if (typeof window !== "undefined") {
        window.location.href = "/auth/login";
      }
      throw new Error("Session expired. Please log in again.");
    }

    res = await makeRequest(newToken);
  }

  const data = await res.json();

  if (!res.ok) {
    // Throw a structured error matching the spec error format
    const err = new Error(data.error ?? "An unexpected error occurred") as Error & {
      error_code: string;
      status: number;
    };
    err.error_code = data.error_code ?? "UNKNOWN_ERROR";
    err.status = res.status;
    throw err;
  }

  return data as T;
}
