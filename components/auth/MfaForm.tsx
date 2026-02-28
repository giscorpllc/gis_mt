"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";

import { otpSchema, type OtpFormValues } from "@/lib/schemas";
import { apiRequest } from "@/lib/api";
import { useAuthStore } from "@/lib/auth-store";
import { OtpInput } from "./OtpInput";
import { ResendTimer } from "./ResendTimer";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

interface MfaApiResponse {
  success: boolean;
  data: {
    user: {
      user_id: string;
      email: string;
      first_name: string;
      last_name: string;
      kyc_status: string;
    };
    tokens: {
      access_token: string;
      refresh_token: string;
    };
  };
}

export function MfaForm() {
  const router = useRouter();
  const { pendingVerification, setTokens, setUser, clearAuth } = useAuthStore();
  const [apiError, setApiError] = useState<string | null>(null);

  // Redirect to login if there's no pending MFA session
  useEffect(() => {
    if (!pendingVerification) {
      router.replace("/auth/login");
    }
  }, [pendingVerification, router]);

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: { code: "" },
  });

  if (!pendingVerification) return null;

  async function onSubmit(values: OtpFormValues) {
    setApiError(null);
    try {
      const res = await apiRequest<MfaApiResponse>("/api/v1/auth/verify-mfa", {
        method: "POST",
        body: { user_id: pendingVerification!.user_id, code: values.code },
      });

      setTokens(res.data.tokens.access_token, res.data.tokens.refresh_token);
      setUser(res.data.user);
      router.push("/dashboard");
    } catch (err) {
      setApiError((err as Error).message);
      form.reset();
    }
  }

  async function handleResend() {
    // Resend MFA code — reuses the resend-verification endpoint
    await apiRequest("/api/v1/auth/resend-verification", {
      method: "POST",
      body: { user_id: pendingVerification!.user_id },
    });
  }

  function handleCancel() {
    clearAuth();
    router.push("/auth/login");
  }

  const code = form.watch("code");

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Two-factor authentication</CardTitle>
        <CardDescription>
          A 6-digit code was sent to your registered phone via SMS.
          {pendingVerification.email && (
            <>
              {" "}Signing in as{" "}
              <span className="font-medium text-foreground">{pendingVerification.email}</span>
            </>
          )}
        </CardDescription>
      </CardHeader>

      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {apiError && (
              <Alert variant="destructive">
                <AlertDescription>{apiError}</AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="code"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <OtpInput
                      value={field.value}
                      onChange={field.onChange}
                      disabled={form.formState.isSubmitting}
                    />
                  </FormControl>
                  <FormMessage className="text-center" />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full"
              disabled={form.formState.isSubmitting || code.length < 6}
            >
              {form.formState.isSubmitting ? "Verifying…" : "Verify"}
            </Button>

            {/* 5-minute expiry per spec */}
            <div className="flex justify-center">
              <ResendTimer onResend={handleResend} initialSeconds={300} />
            </div>

            <div className="text-center">
              <button
                type="button"
                onClick={handleCancel}
                className="text-sm text-muted-foreground underline hover:text-foreground"
              >
                Cancel — sign in with a different account
              </button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
