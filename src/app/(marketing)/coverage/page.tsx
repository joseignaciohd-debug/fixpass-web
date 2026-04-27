import type { Metadata } from "next";
import { AlertTriangle, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Reveal } from "@/components/ui/reveal";
import { defaultRules, excludedServices, serviceInventory } from "@/lib/config/site-data";

export const metadata: Metadata = {
  title: "Coverage",
  description:
    "What's covered by a Fixpass membership — and what's specifically not. Clear guardrails keep quality high.",
  alternates: { canonical: "https://www.getfixpass.com/coverage" },
  openGraph: {
    title: "Coverage — Fixpass",
    description: "Exactly what's covered and what's out of scope. Published in writing.",
    images: [
      "/api/og?title=What%27s%20covered%2C%20what%27s%20not.&eyebrow=Fixpass%20%E2%80%94%20Coverage",
    ],
  },
};

export default function CoveragePage() {
  return (
    <main className="relative">
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8 lg:px-12 lg:pt-24">
        <Reveal className="max-w-3xl">
          <span className="eyebrow">Coverage</span>
          <h1 className="display-hero mt-4 text-5xl text-ink sm:text-6xl">
            What&apos;s covered, what&apos;s not.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-muted">
            Fixpass publishes the rules so households know exactly what they&apos;re buying. No hidden
            exclusions, no surprise-quote-at-the-door.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-soft text-emerald-ink">
                <CheckCircle2 className="h-5 w-5" />
              </div>
              <div>
                <Badge tone="emerald">Covered</Badge>
                <h2 className="display-section mt-2 text-2xl text-ink">
                  Small repairs, handled cleanly.
                </h2>
              </div>
            </div>
            <ul className="mt-6 grid gap-3 sm:grid-cols-2">
              {serviceInventory.map((s) => (
                <li
                  key={s.title}
                  className="rounded-xl border border-border bg-canvas-elevated px-4 py-3 text-sm"
                >
                  <p className="font-semibold text-ink">{s.title}</p>
                  <p className="mt-1 text-xs leading-5 text-ink-muted">{s.copy}</p>
                </li>
              ))}
            </ul>
          </Card>

          <Card variant="muted">
            <div className="flex items-center gap-3">
              <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-honey-soft text-cream-ink">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div>
                <Badge tone="honey">Not covered</Badge>
                <h2 className="display-section mt-2 text-2xl text-ink">
                  Licensed trades + big jobs.
                </h2>
              </div>
            </div>
            <p className="mt-4 text-sm leading-7 text-ink-muted">
              Anything requiring licensed trades or that exceeds the visit envelope gets handed off to a
              partner with a transparent quote — and your member discount still applies. Outdoor work like
              fence painting and driveway pressure washing is offered to members but quoted separately, not
              counted against a covered visit.
            </p>
            <ul className="mt-6 grid gap-2">
              {excludedServices.map((s) => (
                <li
                  key={s}
                  className="rounded-xl border border-border bg-surface px-4 py-3 text-sm text-ink-muted"
                >
                  {s}
                </li>
              ))}
            </ul>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="eyebrow">Operating rules</span>
          <h2 className="display-section mt-3 text-4xl text-ink sm:text-5xl">
            Predictable by design.
          </h2>
        </Reveal>
        <div className="mt-10 grid gap-3 md:grid-cols-2">
          {defaultRules.map((rule, i) => (
            <Reveal key={rule} delay={0.04 * i}>
              <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface/80 px-5 py-4 text-sm leading-6 text-ink-muted">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-royal" />
                {rule}
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-5 py-16 text-center sm:px-8 lg:px-12">
        <Reveal>
          <h2 className="display-section text-3xl text-ink sm:text-4xl">Ready to see Fixpass in action?</h2>
          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Button href="/join">Start a membership</Button>
            <Button href="/faq" variant="secondary">
              Read the FAQ
            </Button>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
