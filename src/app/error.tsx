"use client";

// Route-level error boundary — catches errors thrown by any page under /.
// Sentry already captures automatically; this is just the UI.

import { AlertTriangle, RotateCcw } from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app error]", error);
  }, [error]);

  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-brick-soft text-brick-ink">
        <AlertTriangle className="h-6 w-6" aria-hidden />
      </div>
      <h1 className="display-hero mt-6 text-4xl text-ink">Something broke here.</h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-ink-muted">
        The page hit an unexpected error. Our team has been alerted. You can try again, or head back to
        the home page — your data is safe.
      </p>
      {error.digest ? (
        <p className="mt-3 font-mono text-xs text-ink-subtle">Ref: {error.digest}</p>
      ) : null}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button onClick={reset} iconLeft={<RotateCcw className="h-4 w-4" aria-hidden />}>
          Try again
        </Button>
        <Button href="/" variant="secondary">
          Return home
        </Button>
      </div>
    </main>
  );
}
