import type { Metadata } from "next";
import { ArrowRight, Check, CreditCard, Minus } from "lucide-react";
import { BalancedHeading } from "@/components/ui/balanced-heading";
import { BlindsReveal } from "@/components/ui/blinds-reveal";
import { Button } from "@/components/ui/button";
import { GradientCard } from "@/components/ui/gradient-card";
import { Reveal } from "@/components/ui/reveal";
import { FixpassMark, FIXPASS_TAGLINE } from "@/components/ui/brand-mark";
import { CostCalculator } from "@/components/marketing/cost-calculator";
import { PlanCards } from "@/components/marketing/plan-cards";
import { StickyPlansCTA } from "@/components/marketing/sticky-plans-cta";
import { TrustBadges } from "@/components/marketing/trust-badges";
import { JsonLd, planServiceLd } from "@/lib/seo/jsonld";
import { plans } from "@/lib/config/site-data";

export const metadata: Metadata = {
  title: "Plans",
  description:
    "Fixpass memberships — Silver, Gold, Platinum. Covered visits, clear labor caps, Stripe billing.",
  alternates: { canonical: "https://www.getfixpass.com/plans" },
  openGraph: {
    title: "Plans — Fixpass",
    description: "Silver, Gold, Platinum. Pick the membership that fits your home.",
    images: [
      "/api/og?title=Pick%20the%20membership%20that%20fits%20your%20home.&eyebrow=Fixpass%20%E2%80%94%20Plans&subtitle=Silver%20%E2%80%A2%20Gold%20%E2%80%A2%20Platinum.%20Prepay%203%2C%206%2C%20or%2012%20months%20via%20Stripe.",
    ],
  },
};

// Compare-table rows — each tuple is (label, silver, gold, platinum).
const comparisonRows: Array<{ label: string; values: [string | boolean, string | boolean, string | boolean] }> = [
  { label: "Registered property",          values: ["One", "One", "One"] },
  { label: "Covered visits",                values: ["2 / mo", "5 / mo", "Unlimited (fair use)"] },
  { label: "Labor cap / visit",             values: ["90 min", "90 min", "90 min"] },
  { label: "Related tasks / visit",         values: ["3", "3", "3"] },
  { label: "Materials allowance",           values: ["—", "—", "$40 / mo"] },
  { label: "Scheduling priority",           values: ["Standard", "Priority", "Fastest"] },
  { label: "Out-of-scope quote discount",   values: ["5%", "10%", "15%"] },
  { label: "Operator review on every request", values: [true, true, true] },
  { label: "Stripe billing + self-serve portal", values: [true, true, true] },
];

export default function PlansPage() {
  return (
    <main className="relative">
      <JsonLd data={plans.map((p) => planServiceLd(p))} />
      {/* HERO */}
      <section className="mx-auto max-w-7xl px-5 pb-10 pt-16 sm:px-8 lg:px-12 lg:pt-24">
        <Reveal className="max-w-3xl">
          <span className="eyebrow">Memberships</span>
          <BalancedHeading
            as="h1"
            className="display-hero mt-4 text-5xl text-ink sm:text-6xl lg:text-[4.5rem]"
          >
            <BlindsReveal slats={6} delay={0.05}>
              Pick the membership that fits your home.
            </BlindsReveal>
          </BalancedHeading>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-ink-muted">
            Every plan supports one registered property, defined visit allowances, a clear labor cap, and
            an out-of-scope quote path when a request falls outside coverage.
          </p>
          <div className="mt-6 inline-flex items-center gap-2 rounded-full border border-border bg-surface/80 px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-ink-muted">
            <CreditCard size={14} />
            Prepay 3, 6, or 12 months via Stripe
          </div>
        </Reveal>
      </section>

      {/* PLAN CARDS — interactive cycle toggle lives inside PlanCards */}
      <section id="plan-cards" className="mx-auto max-w-7xl px-5 pb-12 sm:px-8 lg:px-12 scroll-mt-24">
        <PlanCards ctaHref="/join" />
      </section>

      {/* SAVINGS CALCULATOR — sits right after cards so the "is this
          worth it?" question gets answered before users dig into
          comparison details. */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
        <Reveal>
          <CostCalculator defaultPlan="gold" />
        </Reveal>
      </section>

      {/* TRUST BADGES */}
      <section className="mx-auto max-w-7xl px-5 pb-10 sm:px-8 lg:px-12">
        <Reveal className="mb-8 max-w-xl">
          <span className="eyebrow">What every tier includes</span>
          <h2 className="display-section mt-3 text-3xl text-ink sm:text-4xl">
            Same guardrails across plans.
          </h2>
        </Reveal>
        <TrustBadges />
      </section>

      {/* COMPARE TABLE — line-item breakdown lives below the calculator
          since it's for the handful of users who need every detail. */}
      <section className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12">
        <Reveal className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="eyebrow">Compare</span>
            <h2 className="display-section mt-3 text-4xl text-ink sm:text-5xl">
              What&apos;s in each plan, line by line.
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-ink-muted">
            All plans share the same operator-reviewed request flow. Tier changes mostly affect capacity
            and priority.
          </p>
        </Reveal>

        <div className="mt-10 overflow-hidden rounded-[var(--radius-xl)] border border-border bg-surface/80 backdrop-blur">
          <div className="grid grid-cols-[1.4fr_repeat(3,1fr)] text-sm">
            <div className="bg-canvas-elevated px-6 py-5 text-[11px] font-semibold uppercase tracking-[0.18em] text-ink-muted">
              Feature
            </div>
            {plans.map((p) => (
              <div
                key={p.id}
                className={`px-6 py-5 text-center font-[family-name:var(--font-display)] text-lg font-semibold ${
                  p.id === "platinum"
                    ? "bg-ink text-white"
                    : p.id === "gold"
                    ? "bg-honey-soft text-ink"
                    : "bg-canvas-elevated text-ink"
                }`}
              >
                {p.name}
              </div>
            ))}
          </div>

          {comparisonRows.map((row, idx) => (
            <div
              key={row.label}
              className={`grid grid-cols-[1.4fr_repeat(3,1fr)] border-t border-border text-sm ${
                idx % 2 === 0 ? "bg-surface/60" : "bg-canvas-elevated/50"
              }`}
            >
              <div className="px-6 py-4 font-medium text-ink">{row.label}</div>
              {row.values.map((v, i) => (
                <div key={i} className="flex items-center justify-center px-6 py-4 text-center text-ink-muted">
                  {typeof v === "boolean" ? (
                    v ? <Check size={18} className="text-emerald" /> : <Minus size={18} className="text-ink-subtle" />
                  ) : (
                    <span>{v}</span>
                  )}
                </div>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-7xl px-5 pb-24 sm:px-8 lg:px-12">
        <GradientCard tone="royal" className="sm:p-14 lg:p-16">
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <span className="eyebrow-light">Not sure which plan?</span>
              <h3 className="display-section mt-4 text-4xl text-white sm:text-5xl">
                Tell us about your home. We&apos;ll recommend one.
              </h3>
              <p className="mt-5 max-w-lg text-base leading-7 text-white/78">
                Most households land on Gold. Platinum is for high-frequency homeowners. Silver covers
                the bare essentials. Share your setup and an operator will point you to the right fit.
              </p>
              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button href="/join" variant="inverse" size="lg" iconRight={<ArrowRight size={18} />}>
                  Start with a recommendation
                </Button>
                <Button
                  href="/faq"
                  variant="ghost"
                  size="lg"
                  className="text-white hover:bg-white/10"
                >
                  Read the FAQ
                </Button>
              </div>
            </div>

            <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur">
              <FixpassMark size={48} onDark />
              <p className="mt-5 font-[family-name:var(--font-display)] text-xl font-semibold leading-snug text-white">
                &ldquo;Better to have it and not need it, than to need it and not have it.&rdquo;
              </p>
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
                The Fixpass promise — {FIXPASS_TAGLINE}
              </p>
            </div>
          </div>
        </GradientCard>
      </section>

      {/* Mobile sticky CTA — anchored to #plan-cards so tapping scrolls
          back up to the interactive matrix. Desktop unaffected. */}
      <StickyPlansCTA />
    </main>
  );
}

