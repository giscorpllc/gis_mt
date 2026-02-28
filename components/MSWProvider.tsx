"use client";

import { useEffect, useState } from "react";

export function MSWProvider({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (process.env.NEXT_PUBLIC_APP_ENV !== "development") {
      setReady(true);
      return;
    }

    import("../mocks/browser").then(({ worker }) => {
      worker.start({ onUnhandledRequest: "bypass" }).then(() => setReady(true));
    });
  }, []);

  // Avoid rendering children until MSW is ready in dev (prevents race conditions)
  if (process.env.NEXT_PUBLIC_APP_ENV === "development" && !ready) {
    return null;
  }

  return <>{children}</>;
}
