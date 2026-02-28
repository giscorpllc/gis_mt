"use client";

import { useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import { apiRequest } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function DashboardPage() {
  const router = useRouter();
  const { user, clearAuth } = useAuthStore();

  async function handleSignOut() {
    try {
      await apiRequest("/api/v1/auth/logout", { method: "POST" });
    } finally {
      // Always clear local state even if the server call fails
      clearAuth();
      router.push("/auth/login");
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Top nav */}
      <header className="border-b bg-white px-6 py-4">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold">
              G
            </div>
            <span className="font-semibold">GIS Money Transfer</span>
          </div>
          <div className="flex items-center gap-4">
            {user && (
              <span className="text-sm text-muted-foreground">
                {user.first_name} {user.last_name}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={handleSignOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Body */}
      <main className="mx-auto max-w-5xl px-6 py-10 space-y-6">

        {/* Welcome */}
        <div>
          <h1 className="text-2xl font-bold">
            {user ? `Welcome, ${user.first_name}` : "Welcome"}
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Here&apos;s an overview of your account.
          </p>
        </div>

        {/* KYC notice */}
        {user?.kyc_status !== "VERIFIED" && (
          <Card className="border-yellow-200 bg-yellow-50">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Complete your identity verification</CardTitle>
              <CardDescription>
                KYC verification is required before you can send money.
                {user?.kyc_status && (
                  <> Status: <Badge variant="outline" className="ml-1">{user.kyc_status}</Badge></>
                )}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button size="sm" disabled>
                Start KYC — coming soon
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Placeholder feature cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { title: "Send Money",       desc: "Transfer funds to India via NEFT, IMPS, or UPI." },
            { title: "Exchange Rates",   desc: "Live USD → INR rates updated every 60 seconds." },
            { title: "Transaction History", desc: "View and track all past transfers." },
            { title: "Beneficiaries",    desc: "Manage your saved recipients." },
            { title: "Profile & KYC",    desc: "Update personal details and documents." },
            { title: "Notifications",    desc: "SMS and email transfer alerts." },
          ].map(({ title, desc }) => (
            <Card key={title} className="opacity-60">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription className="text-xs">{desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge variant="secondary">Coming soon</Badge>
              </CardContent>
            </Card>
          ))}
        </div>

      </main>
    </div>
  );
}
