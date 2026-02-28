"use client";

const checks = [
  (p: string) => p.length >= 8,
  (p: string) => /[A-Z]/.test(p),
  (p: string) => /[a-z]/.test(p),
  (p: string) => /[0-9]/.test(p),
  (p: string) => /[^A-Za-z0-9]/.test(p),
];

const LEVELS = [
  { label: "Too short", color: "bg-red-400",    pct: "10%" },
  { label: "Weak",      color: "bg-red-400",    pct: "20%" },
  { label: "Fair",      color: "bg-orange-400", pct: "40%" },
  { label: "Fair",      color: "bg-yellow-400", pct: "60%" },
  { label: "Good",      color: "bg-blue-400",   pct: "80%" },
  { label: "Strong",    color: "bg-green-500",  pct: "100%" },
];

export function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;

  const score = checks.filter((fn) => fn(password)).length;
  const level = LEVELS[score];

  return (
    <div className="mt-1.5 space-y-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div
          className={`h-full rounded-full transition-all duration-300 ${level.color}`}
          style={{ width: level.pct }}
        />
      </div>
      <p className="text-xs text-muted-foreground">
        Strength: <span className="font-medium">{level.label}</span>
      </p>
    </div>
  );
}
