import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 py-16 text-center">
      <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-royal-soft text-royal-ink">
        <Compass className="h-6 w-6" aria-hidden />
      </div>
      <p className="mt-6 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted">
        404 · not found
      </p>
      <h1 className="display-hero mt-3 text-4xl text-ink">This page took the day off.</h1>
      <p className="mt-4 max-w-md text-sm leading-7 text-ink-muted">
        The URL you followed doesn&apos;t exist (or no longer does). The rest of Fixpass is one click
        away.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button href="/">Back to home</Button>
        <Button href="/plans" variant="secondary">
          See membership plans
        </Button>
      </div>
    </main>
  );
}
