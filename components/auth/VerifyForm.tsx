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

function maskEmail(email: string): string {
  const [user, domain] = email.split("@");
  if (!user || !domain) return email;
  return `${user[0]}***@${domain}`;
}

function maskPhone(phone: string): string {
  return phone.length >= 4 ? `+1 *** ***${phone.slice(-4)}` : phone;
}

export function VerifyForm() {
  const router = useRouter();
  const { pendingVerification } = useAuthStore();
  const [apiError, setApiError] = useState<string | null>(null);

  // Redirect to register if there is nothing to verify
  useEffect(() => {
    if (!pendingVerification) {
      router.replace("/auth/register");
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
      await apiRequest("/api/v1/auth/verify", {
        method: "POST",
        body: { user_id: pendingVerification!.user_id, code: values.code },
      });
      router.push("/dashboard");
    } catch (err) {
      setApiError((err as Error).message);
      form.reset();
    }
  }

  async function handleResend() {
    await apiRequest("/api/v1/auth/resend-verification", {
      method: "POST",
      body: { user_id: pendingVerification!.user_id },
    });
  }

  const code = form.watch("code");

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl">Verify your account</CardTitle>
        <CardDescription>
          Enter the 6-digit code sent to{" "}
          <span className="font-medium text-foreground">
            {maskEmail(pendingVerification.email)}
          </span>{" "}
          and{" "}
          <span className="font-medium text-foreground">
            {maskPhone(pendingVerification.phone)}
          </span>
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
              {form.formState.isSubmitting ? "Verifying…" : "Verify account"}
            </Button>

            <div className="flex justify-center">
              <ResendTimer onResend={handleResend} />
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
