import { http, HttpResponse, delay } from "msw";

const BASE = "/api/v1/auth";

// Simulated user store for the mock session
let pendingUser: { user_id: string; email: string; phone: string } | null = null;

function errorResponse(message: string, error_code: string, status = 400) {
  return HttpResponse.json(
    {
      success: false,
      error: message,
      error_code,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
}

export const authHandlers = [
  // POST /api/v1/auth/register
  http.post(`${BASE}/register`, async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as {
      email: string;
      phone: string;
      password: string;
      first_name: string;
      last_name: string;
      date_of_birth: string;
      agreed_to_terms: boolean;
    };

    if (!body.email || !body.password || !body.phone) {
      return errorResponse("Missing required fields", "MISSING_FIELDS");
    }

    // Simulate duplicate email check
    if (body.email === "existing@example.com") {
      return errorResponse("Email already in use", "EMAIL_ALREADY_EXISTS", 409);
    }

    const user_id = `usr_${Math.random().toString(36).slice(2, 10)}`;
    pendingUser = { user_id, email: body.email, phone: body.phone };

    return HttpResponse.json(
      {
        success: true,
        message: "Registration successful. Please verify your email and phone.",
        data: {
          user_id,
          email: body.email,
          status: "PENDING_VERIFICATION",
        },
      },
      { status: 201 }
    );
  }),

  // POST /api/v1/auth/verify  (email / phone OTP)
  http.post(`${BASE}/verify`, async ({ request }) => {
    await delay(350);
    const body = (await request.json()) as {
      user_id?: string;
      code: string;
    };

    if (body.code !== "123456") {
      return errorResponse("Invalid or expired verification code", "INVALID_OTP", 400);
    }

    return HttpResponse.json({
      success: true,
      message: "Verification successful. Your account is now active.",
      data: { status: "ACTIVE" },
    });
  }),

  // POST /api/v1/auth/resend-verification
  http.post(`${BASE}/resend-verification`, async ({ request }) => {
    await delay(300);
    const body = (await request.json()) as {
      user_id?: string;
    };

    if (!body.user_id && !pendingUser) {
      return errorResponse("No pending verification found", "NO_PENDING_VERIFICATION");
    }

    return HttpResponse.json({
      success: true,
      message: "A new verification code has been sent.",
      data: { expires_in_seconds: 300 },
    });
  }),

  // POST /api/v1/auth/login
  http.post(`${BASE}/login`, async ({ request }) => {
    await delay(450);
    const body = (await request.json()) as {
      email: string;
      password: string;
    };

    // Simulate rate limit
    if (body.email === "blocked@example.com") {
      return errorResponse(
        "Too many login attempts. Please try again in 15 minutes.",
        "RATE_LIMIT_EXCEEDED",
        429
      );
    }

    // Simulate invalid credentials
    if (body.password !== "Password123!") {
      return errorResponse("Invalid email or password", "INVALID_CREDENTIALS", 401);
    }

    // Simulate unverified account
    if (body.email === "unverified@example.com") {
      return errorResponse(
        "Account not verified. Please check your email.",
        "ACCOUNT_NOT_VERIFIED",
        403
      );
    }

    // All valid logins trigger MFA in mock
    return HttpResponse.json({
      success: true,
      message: "Credentials verified. MFA code sent to your registered phone.",
      data: {
        mfa_required: true,
        user_id: `usr_mock123`,
        mfa_expires_in_seconds: 300,
      },
    });
  }),

  // POST /api/v1/auth/verify-mfa
  http.post(`${BASE}/verify-mfa`, async ({ request }) => {
    await delay(400);
    const body = (await request.json()) as {
      user_id?: string;
      code: string;
    };

    if (body.code !== "123456") {
      return errorResponse("Invalid or expired MFA code", "INVALID_MFA_CODE", 400);
    }

    const now = Math.floor(Date.now() / 1000);
    return HttpResponse.json({
      success: true,
      message: "MFA verified. Login successful.",
      data: {
        user: {
          user_id: "usr_mock123",
          email: "user@example.com",
          first_name: "John",
          last_name: "Doe",
          kyc_status: "PENDING",
        },
        tokens: {
          access_token: `mock_access_${now}`,
          refresh_token: `mock_refresh_${now}`,
          access_token_expires_at: new Date((now + 900) * 1000).toISOString(),  // 15 min
          refresh_token_expires_at: new Date((now + 604800) * 1000).toISOString(), // 7 days
        },
      },
    });
  }),

  // POST /api/v1/auth/refresh
  http.post(`${BASE}/refresh`, async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as { refresh_token?: string };

    if (!body.refresh_token) {
      return errorResponse("Refresh token is required", "MISSING_TOKEN", 400);
    }

    if (!body.refresh_token.startsWith("mock_refresh_")) {
      return errorResponse("Invalid or expired refresh token", "INVALID_REFRESH_TOKEN", 401);
    }

    const now = Math.floor(Date.now() / 1000);
    return HttpResponse.json({
      success: true,
      data: {
        access_token: `mock_access_${now}`,
        access_token_expires_at: new Date((now + 900) * 1000).toISOString(),
      },
    });
  }),

  // POST /api/v1/auth/logout
  http.post(`${BASE}/logout`, async () => {
    await delay(150);
    pendingUser = null;
    return HttpResponse.json({
      success: true,
      message: "Logged out successfully.",
    });
  }),
];
