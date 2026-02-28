"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

interface ResendTimerProps {
  onResend: () => Promise<void>;
  initialSeconds?: number;
}

export function ResendTimer({ onResend, initialSeconds = 60 }: ResendTimerProps) {
  const [seconds, setSeconds] = useState(initialSeconds);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (seconds <= 0) return;
    const id = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [seconds]);

  async function handleResend() {
    setLoading(true);
    try {
      await onResend();
      setSeconds(initialSeconds);
    } finally {
      setLoading(false);
    }
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  if (seconds > 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Resend code in{" "}
        <span className="font-medium tabular-nums">{mm}:{ss}</span>
      </p>
    );
  }

  return (
    <Button type="button" variant="ghost" size="sm" onClick={handleResend} disabled={loading}>
      {loading ? "Sending…" : "Resend code"}
    </Button>
  );
}
