"use client";

// Scoped error boundary for /app/*. Renders inside the (app) layout, so a
// single-page crash keeps the member AppShell (nav + account) intact instead
// of blowing away to the bare root error page — important for a customer who
// just paid. Reports explicitly to Sentry; boundary-caught errors are not
// auto-captured by the SDK's global handler.

import * as Sentry from "@sentry/nextjs";
import { RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppSegmentError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app/* error]", error);
    Sentry.captureException(error);
  }, [error]);

  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-6 py-16 text-center">
      <h1 className="display-section text-2xl text-ink">This page hit a snag.</h1>
      <p className="mt-3 max-w-md text-sm leading-7 text-ink-muted">
        Your account and payment are safe. Try again, or head to your dashboard.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-xs text-ink-subtle">Ref: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} iconLeft={<RotateCcw className="h-4 w-4" aria-hidden />}>
          Try again
        </Button>
        <Button href="/app" variant="secondary">
          Go to dashboard
        </Button>
      </div>
    </div>
  );
}
