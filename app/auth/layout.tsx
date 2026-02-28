import { ShieldCheck, Lock, BadgeCheck } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4 py-12">

      {/* Brand header */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
            G
          </div>
          <span className="text-xl font-semibold tracking-tight">GIS Money Transfer</span>
        </div>
        <p className="mt-1 text-sm text-muted-foreground">US → India · Fast · Secure</p>
      </div>

      {/* Page content (Card) */}
      {children}

      {/* Trust badges */}
      <div className="mt-6 flex items-center justify-center gap-6 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <Lock className="h-3 w-3" />
          256-bit SSL
        </span>
        <span className="flex items-center gap-1">
          <ShieldCheck className="h-3 w-3" />
          FinCEN Registered
        </span>
        <span className="flex items-center gap-1">
          <BadgeCheck className="h-3 w-3" />
          Bank-grade Security
        </span>
      </div>

    </div>
  );
}
