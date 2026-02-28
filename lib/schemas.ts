import { z } from "zod";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Returns true if the given date-of-birth string represents someone 18+. */
function isAtLeast18(dateString: string): boolean {
  const dob = new Date(dateString);
  if (isNaN(dob.getTime())) return false;
  const today = new Date();
  const cutoff = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate());
  return dob <= cutoff;
}

// ---------------------------------------------------------------------------
// Registration schema
// ---------------------------------------------------------------------------

export const registerSchema = z
  .object({
    first_name: z
      .string()
      .min(1, "First name is required")
      .max(50, "First name must be 50 characters or fewer"),

    last_name: z
      .string()
      .min(1, "Last name is required")
      .max(50, "Last name must be 50 characters or fewer"),

    email: z
      .string()
      .min(1, "Email is required")
      .max(255, "Email must be 255 characters or fewer")
      .email("Enter a valid email address"),

    // E.164 US format: +1 followed by 10 digits, area code 2–9
    phone: z
      .string()
      .min(1, "Phone number is required")
      .regex(/^\+1[2-9]\d{9}$/, "Enter a valid US phone number (e.g. +12025551234)"),

    date_of_birth: z
      .string()
      .min(1, "Date of birth is required")
      .refine(isAtLeast18, "You must be at least 18 years old to register"),

    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),

    confirm_password: z.string().min(1, "Please confirm your password"),

    // z.boolean().refine used instead of z.literal(true) so the form
    // default value of `false` is type-compatible with react-hook-form.
    agreed_to_terms: z
      .boolean()
      .refine((val) => val === true, "You must accept the terms and conditions to continue"),
  })
  .refine((data) => data.password === data.confirm_password, {
    message: "Passwords do not match",
    path: ["confirm_password"],
  });

export type RegisterFormValues = z.infer<typeof registerSchema>;

// ---------------------------------------------------------------------------
// Login schema
// ---------------------------------------------------------------------------

export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Enter a valid email address"),

  password: z.string().min(1, "Password is required"),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// ---------------------------------------------------------------------------
// OTP schema (used for both email/phone verification and MFA)
// ---------------------------------------------------------------------------

export const otpSchema = z.object({
  code: z
    .string()
    .length(6, "Code must be exactly 6 digits")
    .regex(/^\d{6}$/, "Code must contain only digits"),
});

export type OtpFormValues = z.infer<typeof otpSchema>;
