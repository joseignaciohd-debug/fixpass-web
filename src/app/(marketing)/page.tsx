import Link from "next/link";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Handshake,
  Heart,
  ShieldCheck,
  Sparkles,
  Star,
  Wrench,
} from "lucide-react";
import { BlueprintHero } from "@/components/ui/blueprint-hero";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GradientCard } from "@/components/ui/gradient-card";
import { IconTile } from "@/components/ui/icon-tile";
import { Reveal } from "@/components/ui/reveal";
import { Timeline, TimelineStep } from "@/components/ui/timeline";
import { FixpassMark, FIXPASS_TAGLINE } from "@/components/ui/brand-mark";
import { HammerScrollShowcase } from "@/components/marketing/hammer-scroll-showcase";
import { TrustBadges } from "@/components/marketing/trust-badges";
import { JsonLd, faqPageLd, localBusinessLd, organizationLd } from "@/lib/seo/jsonld";
import {
  DEFAULT_BILLING_CYCLE,
  defaultRules,
  excludedServices,
  faqs,
  plans,
  planPerMonth,
  serviceInventory,
  testimonials,
} from "@/lib/config/site-data";
import { currency } from "@/lib/utils";

// Marketing-home copy only lives here — we don't reuse pillars/services
// anywhere else on the site, so one file = one place to tune voice.

const pillars = [
  { icon: ShieldCheck, title: "Trusted",    copy: "Vetted technicians, clear scope, and work you can count on.",        tone: "emerald" as const },
  { icon: Clock3,      title: "Reliable",   copy: "Operator-led scheduling with a response inside 24 hours.",           tone: "royal"   as const },
  { icon: Sparkles,    title: "Convenient", copy: "One membership replaces the scramble of finding a handyman.",         tone: "sky"     as const },
  { icon: Heart,       title: "Care",       copy: "Small repairs handled like they matter — because they do.",           tone: "basil"   as const },
  { icon: Star,        title: "Exceptional", copy: "A premium experience from request to the final walk-through.",       tone: "lapis"   as const },
];

const steps = [
  {
    step: "01",
    title: "Pick a plan",
    copy: "Silver, Gold, or Platinum — prepay 3, 6, or 12 months through Stripe with a single property on file.",
    tone: "royal" as const,
  },
  {
    step: "02",
    title: "Request work",
    copy: "Describe what needs doing, add a photo, and an operator reviews before anything is scheduled.",
    tone: "sky" as const,
  },
  {
    step: "03",
    title: "Fixpass handles it",
    copy: "A trusted technician arrives inside your visit allowance and your property stays tidy, quiet, documented.",
    tone: "emerald" as const,
  },
];

export default function HomePage() {
  return (
    <main className="overflow-hidden">
      {/* SEO — Organization + LocalBusiness + FAQPage help Google render
          rich snippets (stars, hours, service area, FAQ accordion). */}
      <JsonLd data={[organizationLd, localBusinessLd, faqPageLd(faqs.slice(0, 6))]} />
      {/* ------------------------------------------------ */}
      {/* HERO — full-viewport blueprint drafts itself in.   */}
      {/*        Sky-blue architectural linework on navy,    */}
      {/*        editorial headline floating over the plan.  */}
      {/* ------------------------------------------------ */}
      <BlueprintHero
        trustBadge={{ text: "Now serving Katy, Texas", dotTone: "emerald" }}
        headline={{ line1: "Home maintenance,", line2: "handled." }}
        subtitle="A premium membership for the small repairs families keep putting off. Trusted technicians, operator-reviewed requests, and a calmer way to keep the house running."
        primaryCta={{ label: "Start your membership", href: "/join" }}
        secondaryCta={{ label: "View plans", href: "/plans" }}
      />

      {/* ------------------------------------------------ */}
      {/* BRAND PILLARS                                      */}
      {/* ------------------------------------------------ */}
      <section className="relative border-y border-border bg-canvas-elevated/50">
        <div className="mx-auto max-w-7xl px-5 py-14 sm:px-8 lg:px-12 lg:py-20">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <Reveal className="max-w-xl">
              <span className="eyebrow">What we stand for</span>
              <h2 className="display-section mt-3 text-4xl text-ink sm:text-5xl">
                Five pillars hold the whole thing up.
              </h2>
            </Reveal>
            <Reveal delay={0.08}>
              <p className="max-w-md text-base leading-7 text-ink-muted">
                Fixpass isn&apos;t a handyman directory. It&apos;s a membership designed around how a calm,
                well-run household actually wants to be serviced.
              </p>
            </Reveal>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {pillars.map((p, i) => (
              <Reveal key={p.title} delay={0.04 * i}>
                <IconTile
                  icon={<p.icon size={18} strokeWidth={2} />}
                  label={p.title}
                  description={p.copy}
                  tone={p.tone}
                  className="h-full"
                />
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ */}
      {/* HAMMER SCROLL SHOWCASE                             */}
      {/* ------------------------------------------------ */}
      <HammerScrollShowcase />

      {/* ------------------------------------------------ */}
      {/* SERVICE INVENTORY                                  */}
      {/* ------------------------------------------------ */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
            <Reveal className="lg:sticky lg:top-28 lg:self-start">
              <span className="eyebrow">What&apos;s covered</span>
              <h2 className="display-section mt-3 text-4xl text-ink sm:text-5xl">
                The small repairs families keep putting off.
              </h2>
              <p className="mt-5 text-base leading-7 text-ink-muted">
                Each visit is scoped around the tasks homeowners actually ask for. Tidy, defined,
                quick-moving household work that makes a home feel looked after.
              </p>
              <div className="mt-8 flex gap-3">
                <Button href="/coverage" variant="secondary">
                  See the full list
                </Button>
                <Button href="/faq" variant="ghost">
                  What&apos;s not covered
                </Button>
              </div>
            </Reveal>

            <div className="grid gap-3 sm:grid-cols-2">
              {serviceInventory.map((s, i) => (
                <Card key={s.title} variant={i === 0 || i === 5 ? "ivory" : "default"} delay={0.04 * i}>
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-ink text-white">
                      <Wrench size={16} />
                    </div>
                    <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-subtle">
                      0{i + 1}
                    </span>
                  </div>
                  <h3 className="mt-5 font-[family-name:var(--font-display)] text-lg font-semibold text-ink">
                    {s.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-ink-muted">{s.copy}</p>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ */}
      {/* HOW IT WORKS                                       */}
      {/* ------------------------------------------------ */}
      <section className="relative border-y border-border bg-canvas-elevated/50">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="flex items-end justify-between gap-6">
            <Reveal>
              <span className="eyebrow">How it works</span>
              <h2 className="display-section mt-3 text-4xl text-ink sm:text-5xl">
                Three steps, no phone tag.
              </h2>
            </Reveal>
            <Button href="/how-it-works" variant="ghost" iconRight={<ArrowRight size={16} />} className="hidden sm:inline-flex">
              Walk through it
            </Button>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {steps.map((s, i) => (
              <Card key={s.step} delay={0.06 * i}>
                <div className="flex items-center justify-between">
                  <Badge tone={s.tone}>
                    Step {s.step}
                  </Badge>
                  {i === 2 ? <Badge tone="emerald">Same week</Badge> : null}
                </div>
                <h3 className="mt-6 font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
                  {s.title}
                </h3>
                <p className="mt-3 text-sm leading-7 text-ink-muted">{s.copy}</p>
              </Card>
            ))}
          </div>

          {/* Mobile-only stacked timeline */}
          <Reveal className="mt-12 lg:hidden">
            <Timeline>
              {steps.map((s, i) => (
                <TimelineStep
                  key={s.step}
                  index={s.step}
                  title={s.title}
                  description={s.copy}
                  tone={s.tone}
                  last={i === steps.length - 1}
                  delay={0.04 * i}
                />
              ))}
            </Timeline>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------------------------ */}
      {/* PLANS PREVIEW                                      */}
      {/* ------------------------------------------------ */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-28">
          <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <Reveal className="max-w-xl">
              <span className="eyebrow">Memberships</span>
              <h2 className="display-section mt-3 text-4xl text-ink sm:text-5xl">
                Structured memberships, not vague labor promises.
              </h2>
              <p className="mt-5 text-base leading-7 text-ink-muted">
                One property per plan. Every tier includes defined visits, a labor cap per visit, and a
                clean path for anything out of scope.
              </p>
            </Reveal>
            <Button href="/plans" variant="secondary" iconRight={<ArrowRight size={16} />}>
              Compare all plans
            </Button>
          </div>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {plans.map((plan, i) => {
              const isPlatinum = plan.id === "platinum";
              const isGold = plan.id === "gold";
              return (
                <Card
                  key={plan.id}
                  variant={isPlatinum ? "dark" : isGold ? "ivory" : "default"}
                  className={isGold ? "ring-1 ring-emerald/30" : ""}
                  delay={0.06 * i}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3
                        className={`font-[family-name:var(--font-display)] text-3xl font-semibold ${
                          isPlatinum ? "text-white" : "text-ink"
                        }`}
                      >
                        {plan.name}
                      </h3>
                      <p
                        className={`mt-2 text-sm leading-6 ${
                          isPlatinum ? "text-white/70" : "text-ink-muted"
                        }`}
                      >
                        {plan.tagline}
                      </p>
                    </div>
                    {plan.featured ? (
                      <Badge tone={isPlatinum ? "inverse" : "honey"}>{plan.featured}</Badge>
                    ) : null}
                  </div>

                  <div className="mt-7 flex items-baseline gap-2">
                    <span
                      className={`text-sm font-medium ${
                        isPlatinum ? "text-white/60" : "text-ink-muted"
                      }`}
                    >
                      from
                    </span>
                    <span
                      className={`font-[family-name:var(--font-display)] text-5xl font-semibold tracking-tight ${
                        isPlatinum ? "text-white" : "text-ink"
                      }`}
                    >
                      {currency(planPerMonth(plan, DEFAULT_BILLING_CYCLE))}
                    </span>
                    <span
                      className={`text-sm font-medium ${
                        isPlatinum ? "text-white/60" : "text-ink-muted"
                      }`}
                    >
                      /month
                    </span>
                  </div>
                  <p className={`mt-1 text-sm ${isPlatinum ? "text-white/60" : "text-ink-muted"}`}>
                    {typeof plan.includedVisits === "number"
                      ? `${plan.includedVisits} covered visits`
                      : plan.includedVisits}{" "}
                    · prepay 3, 6, or 12 mo via Stripe
                  </p>

                  <ul
                    className={`mt-7 space-y-3 text-sm ${
                      isPlatinum ? "text-white/85" : "text-ink-muted"
                    }`}
                  >
                    <li className="flex items-start gap-2">
                      <CheckCircle2
                        size={16}
                        className={`mt-0.5 shrink-0 ${isPlatinum ? "text-honey" : "text-emerald"}`}
                      />
                      Up to {plan.maxRelatedTasks} related tasks per visit
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2
                        size={16}
                        className={`mt-0.5 shrink-0 ${isPlatinum ? "text-honey" : "text-emerald"}`}
                      />
                      Up to {plan.maxLaborMinutes} labor minutes per visit
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2
                        size={16}
                        className={`mt-0.5 shrink-0 ${isPlatinum ? "text-honey" : "text-emerald"}`}
                      />
                      {plan.priority} scheduling priority
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle2
                        size={16}
                        className={`mt-0.5 shrink-0 ${isPlatinum ? "text-honey" : "text-emerald"}`}
                      />
                      {plan.outOfScopeDiscount}% off quoted out-of-scope work
                    </li>
                  </ul>

                  <Button
                    href="/join"
                    variant={isPlatinum ? "inverse" : "primary"}
                    className="mt-8 w-full"
                  >
                    Choose {plan.name}
                  </Button>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ */}
      {/* TRUST + RULES                                      */}
      {/* ------------------------------------------------ */}
      <section className="relative border-y border-border bg-canvas-elevated/50">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
            <Reveal>
              <span className="eyebrow">Operating rules</span>
              <h2 className="display-section mt-3 text-4xl text-ink sm:text-5xl">
                A real service model, not a generic handyman site.
              </h2>
              <p className="mt-5 text-base leading-7 text-ink-muted">
                Fixpass publishes how it operates so households know exactly what they&apos;re buying —
                and so technicians aren&apos;t sent into scope they can&apos;t safely own.
              </p>
              <div className="mt-8 flex items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-ink text-white">
                  <Handshake size={20} />
                </div>
                <p className="text-sm font-semibold text-ink">Clear scope is how you keep quality high.</p>
              </div>
            </Reveal>

            <div className="grid gap-3">
              {defaultRules.map((rule, i) => (
                <Reveal key={rule} delay={0.03 * i}>
                  <div className="flex items-start gap-3 rounded-2xl border border-border bg-surface/80 px-5 py-4 text-sm leading-6 text-ink-muted">
                    <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-royal" />
                    {rule}
                  </div>
                </Reveal>
              ))}
            </div>
          </div>

          <Card className="mt-16 lg:p-10" delay={0.1}>
            <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
              <div>
                <span className="eyebrow">What we skip on purpose</span>
                <h3 className="mt-3 font-[family-name:var(--font-display)] text-2xl font-semibold text-ink">
                  Clear guardrails create trust.
                </h3>
                <p className="mt-3 text-sm leading-6 text-ink-muted">
                  Anything requiring licensed trades or unsafe work gets handed to a proper specialist —
                  often via a quote path Fixpass itself coordinates.
                </p>
              </div>
              <div className="grid gap-2 sm:grid-cols-2">
                {excludedServices.map((s) => (
                  <div
                    key={s}
                    className="rounded-xl border border-border bg-canvas-elevated px-4 py-3 text-sm text-ink-muted"
                  >
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </section>

      {/* ------------------------------------------------ */}
      {/* TRUST ROW                                          */}
      {/* ------------------------------------------------ */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 lg:px-12">
          <Reveal className="mb-10 max-w-xl">
            <span className="eyebrow">Why members trust us</span>
            <h2 className="display-section mt-3 text-3xl text-ink sm:text-4xl">
              Guardrails in writing, not in marketing.
            </h2>
          </Reveal>
          <TrustBadges />
        </div>
      </section>

      {/* ------------------------------------------------ */}
      {/* TESTIMONIALS                                       */}
      {/* ------------------------------------------------ */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
          <Reveal className="mx-auto max-w-2xl text-center">
            <span className="eyebrow">Words from members</span>
            <h2 className="display-section mt-3 text-4xl text-ink sm:text-5xl">
              Calmer homes, quieter weekends.
            </h2>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-3">
            {testimonials.map((t, i) => (
              <Card key={t.name} delay={0.05 * i}>
                <p className="text-base leading-7 text-ink">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-6">
                  <p className="font-semibold text-ink">{t.name}</p>
                  <p className="mt-0.5 text-sm text-ink-muted">{t.role}</p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ */}
      {/* FAQ PREVIEW                                        */}
      {/* ------------------------------------------------ */}
      <section className="relative border-t border-border bg-canvas-elevated/50">
        <div className="mx-auto max-w-4xl px-5 py-20 sm:px-8 lg:px-12 lg:py-24">
          <Reveal className="text-center">
            <span className="eyebrow">Frequently asked</span>
            <h2 className="display-section mt-3 text-4xl text-ink sm:text-5xl">
              Answers before the question.
            </h2>
          </Reveal>

          <div className="mt-10 grid gap-3">
            {faqs.slice(0, 4).map((item) => (
              <details
                key={item.q}
                className="group rounded-2xl border border-border bg-surface px-5 py-4 transition-colors open:bg-canvas-elevated"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-base font-semibold text-ink">
                  {item.q}
                  <span className="text-2xl text-ink-subtle transition group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 text-sm leading-7 text-ink-muted">{item.a}</p>
              </details>
            ))}
          </div>

          <div className="mt-8 flex justify-center">
            <Button href="/faq" variant="secondary">
              See all FAQs
            </Button>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------ */}
      {/* FINAL CTA                                          */}
      {/* ------------------------------------------------ */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 lg:px-12">
          <GradientCard tone="lapis" className="sm:p-14 lg:p-20">
            <div className="pointer-events-none absolute inset-0 grid-overlay opacity-30" aria-hidden />
            <div className="relative grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
              <div>
                <span className="eyebrow-light">Ready when you are</span>
                <h2 className="display-hero mt-4 text-4xl text-white sm:text-5xl lg:text-6xl">
                  Stop scrambling.
                  <br />
                  Start Fixpass.
                </h2>
                <p className="mt-6 max-w-xl text-base leading-7 text-white/78">
                  Join the membership built for busy households in Katy. One prepaid term, a team of
                  operators watching every request, and a home that stays looked-after without the
                  phone-tree spiral.
                </p>
                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Button href="/join" variant="inverse" size="lg" iconRight={<ArrowRight size={18} />}>
                    Start membership
                  </Button>
                  <Link
                    href="/sign-in"
                    className="focus-ring inline-flex items-center justify-center gap-2 rounded-full border border-white/30 px-7 py-3.5 text-base font-semibold text-white transition hover:border-white/60 hover:bg-white/10"
                  >
                    I&apos;m already a member
                  </Link>
                </div>
              </div>

              <div className="relative">
                <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-6 backdrop-blur">
                  <FixpassMark size={52} onDark />
                  <p className="mt-6 font-[family-name:var(--font-display)] text-2xl font-semibold leading-snug text-white">
                    {FIXPASS_TAGLINE}
                  </p>
                  <div className="mt-6 grid grid-cols-2 gap-3 text-xs text-white/70">
                    <div className="rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-white/55">Response</div>
                      <div className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold text-white">
                        Under 24h
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/12 bg-white/[0.05] px-3 py-2">
                      <div className="text-[10px] uppercase tracking-[0.2em] text-white/55">Billing</div>
                      <div className="mt-1 font-[family-name:var(--font-display)] text-lg font-semibold text-white">
                        Stripe
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </GradientCard>
        </div>
      </section>
    </main>
  );
}
