import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata = { title: "Forgot Password | GIS Money Transfer" };

export default function ForgotPasswordPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="text-2xl">Forgot password</CardTitle>
        <CardDescription>Password reset is coming soon.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Please contact support or{" "}
          <Link href="/auth/login" className="underline hover:text-primary">
            return to sign in
          </Link>
          .
        </p>
      </CardContent>
    </Card>
  );
}
