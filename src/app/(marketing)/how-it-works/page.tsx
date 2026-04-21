import type { Metadata } from "next";
import { ArrowRight, CheckCircle2, CreditCard, MessageSquareText, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { IconTile } from "@/components/ui/icon-tile";
import { Reveal } from "@/components/ui/reveal";
import { Timeline, TimelineStep } from "@/components/ui/timeline";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "From signup to handled. Three steps: pick a plan, request work, Fixpass shows up.",
  alternates: { canonical: "https://www.getfixpass.com/how-it-works" },
  openGraph: {
    title: "How Fixpass works",
    description: "Three steps, no phone tag — pick a plan, submit a request, a vetted tech shows up.",
    images: [
      "/api/og?title=Three%20steps%2C%20no%20phone%20tag.&eyebrow=Fixpass%20%E2%80%94%20How%20it%20works",
    ],
  },
};

const detailedSteps = [
  {
    index: "01",
    title: "Pick a plan + confirm coverage",
    copy:
      "Silver, Gold, or Platinum. One monthly charge via Stripe, one registered property per membership. Switch tiers or cancel anytime.",
    bullets: [
      "Plan picks in under 60 seconds",
      "Stripe handles checkout + invoicing",
      "Welcome email with your first-use guide",
    ],
    tone: "royal" as const,
    icon: CreditCard,
  },
  {
    index: "02",
    title: "Submit a request",
    copy:
      "Describe what needs doing from the Fixpass app or this website. Snap a photo, flag the room, pick a window. An operator reviews and triages before anything is scheduled.",
    bullets: [
      "Under-24-hour response SLA",
      "Photo uploads for faster triage",
      "Operator-reviewed — no bot dispatch",
    ],
    tone: "sky" as const,
    icon: MessageSquareText,
  },
  {
    index: "03",
    title: "A technician shows up",
    copy:
      "A vetted Fixpass tech arrives inside your visit allowance. 90 minutes of labor, up to 3 related tasks, tidy work, and a brief write-up. Done.",
    bullets: [
      "1–3 business days typical turnaround",
      "Tidy work, documented outcomes",
      "Out-of-scope? We'll quote separately",
    ],
    tone: "emerald" as const,
    icon: Wrench,
  },
];

export default function HowItWorksPage() {
  return (
    <main className="relative">
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8 lg:px-12 lg:pt-24">
        <Reveal className="max-w-3xl">
          <span className="eyebrow">How it works</span>
          <h1 className="display-hero mt-4 text-5xl text-ink sm:text-6xl">
            From signup to handled, in three steps.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-muted">
            No phone tag, no contractor roulette. Fixpass standardizes what a well-run membership looks
            like — and publishes it so you never wonder where you stand.
          </p>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8 lg:px-12">
        <div className="grid gap-6 lg:grid-cols-3">
          {detailedSteps.map((s, i) => (
            <Card key={s.index} delay={0.05 * i}>
              <div className="flex items-center justify-between gap-3">
                <IconTile
                  icon={<s.icon className="h-4 w-4" />}
                  label={`Step ${s.index}`}
                  tone={s.tone}
                  className="border-0 bg-transparent p-0 hover:shadow-none"
                />
                <Badge tone={s.tone}>{s.title.split(" ")[0]}</Badge>
              </div>
              <h2 className="mt-5 font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
                {s.title}
              </h2>
              <p className="mt-3 text-sm leading-7 text-ink-muted">{s.copy}</p>
              <ul className="mt-6 grid gap-2 text-sm text-ink-muted">
                {s.bullets.map((b) => (
                  <li key={b} className="flex items-start gap-2">
                    <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-emerald" />
                    <span>{b}</span>
                  </li>
                ))}
              </ul>
            </Card>
          ))}
        </div>
      </section>

      {/* Condensed mobile timeline */}
      <section className="mx-auto max-w-3xl px-5 py-16 sm:px-8 lg:hidden">
        <Reveal>
          <Timeline>
            {detailedSteps.map((s, i, arr) => (
              <TimelineStep
                key={s.index}
                index={s.index}
                title={s.title}
                description={s.copy}
                tone={s.tone}
                last={i === arr.length - 1}
                delay={0.04 * i}
              />
            ))}
          </Timeline>
        </Reveal>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <Reveal className="text-center">
          <h2 className="display-section text-4xl text-ink sm:text-5xl">Ready when you are.</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button href="/join" size="lg" iconRight={<ArrowRight size={18} />}>
              Start your membership
            </Button>
            <Button href="/plans" variant="secondary" size="lg">
              Compare plans
            </Button>
          </div>
        </Reveal>
      </section>
    </main>
  );
}
