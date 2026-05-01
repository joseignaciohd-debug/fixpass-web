import { ArrowRight, CheckCircle2, ClipboardList, Home, KeyRound, MapPin, Wrench } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { BalancedHeading } from "@/components/ui/balanced-heading";
import { BlindsReveal } from "@/components/ui/blinds-reveal";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GradientCard } from "@/components/ui/gradient-card";
import { Timeline, TimelineStep } from "@/components/ui/timeline";
import { getCurrentSession } from "@/lib/auth/session";
import { WelcomeConfetti } from "@/components/welcome/welcome-confetti";
import { WelcomePaymentWatcher } from "@/components/welcome/welcome-payment-watcher";

export const dynamic = "force-dynamic";

// Landing page after Stripe checkout success. Stripe redirects here
// with the session_id. We don't need to verify it synchronously —
// the webhook handles subscription state + writes payment_events.
// This page subscribes to Realtime on payment_events; when the
// webhook fires, the user sees a confirmation and can move forward.

export default async function WelcomePage({
  searchParams,
}: {
  searchParams: Promise<{ session_id?: string }>;
}) {
  const { session_id } = await searchParams;
  const session = await getCurrentSession();
  // If the Supabase cookie went stale during the Stripe round-trip,
  // the layout's session check might have refreshed it but this page's
  // read can still come back null. Bounce through sign-in and preserve
  // the welcome URL so the user lands back here once re-authenticated.
  if (!session) {
    const next = session_id ? `/app/welcome?session_id=${session_id}` : "/app/welcome";
    redirect(`/sign-in?next=${encodeURIComponent(next)}`);
  }
  const firstName = session.name.split(/\s+/)[0] || session.name;

  return (
    <div className="space-y-8">
      <WelcomeConfetti />
      {session_id ? <WelcomePaymentWatcher userId={session.userId} /> : null}

      <GradientCard tone="royal" className="sm:p-12">
        <Badge tone="inverse">Welcome aboard</Badge>
        <BalancedHeading
          as="h1"
          className="display-hero mt-4 text-4xl text-white sm:text-5xl lg:text-6xl"
        >
          <BlindsReveal slats={5} delay={0.15} slatColor="rgb(var(--royal))">
            You&apos;re in, {firstName}.
          </BlindsReveal>
        </BalancedHeading>
        <p className="mt-6 max-w-2xl text-base leading-7 text-white/80 lg:text-lg">
          Your Fixpass membership is activating. You&apos;ll see it flip to <em>active</em> here in a
          few seconds as Stripe confirms the payment. While you wait, register your property so we can
          match you with the right technicians faster.
        </p>

        <div className="mt-8 flex flex-wrap gap-3">
          <Button
            href="/app/property"
            variant="inverse"
            iconLeft={<Home className="h-4 w-4" />}
          >
            Register your home
          </Button>
          <Button
            href="/app"
            variant="ghost"
            className="text-white hover:bg-white/10"
            iconRight={<ArrowRight className="h-4 w-4" />}
          >
            Skip to dashboard
          </Button>
        </div>
      </GradientCard>

      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card>
          <p className="eyebrow">What happens next</p>
          <h2 className="display-section mt-3 text-2xl text-ink">
            Three steps, same as the promise
          </h2>
          <Timeline className="mt-6">
            <TimelineStep
              index="1"
              title="Register your property"
              description="Address + access notes. Takes 60 seconds and lets us route the right tech to the right door."
              tone="royal"
            />
            <TimelineStep
              index="2"
              title="Submit your first request"
              description="Pick something small to start — a shelf to mount, a door to adjust. Operators review + schedule inside 24 hours."
              tone="sky"
            />
            <TimelineStep
              index="3"
              title="Fixpass shows up"
              description="A vetted technician arrives in your visit window. Tidy work, documented."
              tone="emerald"
              last
            />
          </Timeline>
        </Card>

        <Card variant="muted">
          <div className="flex items-center gap-3">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-soft text-emerald-ink">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div>
              <p className="eyebrow">Heads up</p>
              <h3 className="display-section mt-1 text-xl text-ink">Your first receipt</h3>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-ink-muted">
            Stripe will email you a receipt in a minute or two. Every future invoice and card update
            runs through the Stripe billing portal — we never handle card details directly.
          </p>
          <Button
            href="/app/membership"
            variant="secondary"
            className="mt-6"
            iconLeft={<Wrench className="h-4 w-4" />}
          >
            Open membership
          </Button>
        </Card>
      </div>

      {/* "What to do next" tiles — three concrete actions the user
          can take right now. Keeps the momentum of the confetti moment
          from fading into a blank dashboard. */}
      <div>
        <p className="eyebrow mb-4">What to do next</p>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            {
              href: "/app/requests/new",
              icon: ClipboardList,
              label: "Submit your first request",
              copy: "Something small to start — a shelf, a fixture, a sticky door.",
              tone: "royal",
            },
            {
              href: "/app/property",
              icon: MapPin,
              label: "Add access notes",
              copy: "Gate code, lockbox, parking tips — saves time on every visit.",
              tone: "emerald",
            },
            {
              href: "/app/membership",
              icon: KeyRound,
              label: "Review your plan",
              copy: "Confirm the cycle, covered visits, and when it renews.",
              tone: "honey",
            },
          ].map((tile) => (
            <Link
              key={tile.href}
              href={tile.href}
              className="group focus-ring rounded-2xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:border-border-strong"
            >
              <div
                className={`inline-flex h-10 w-10 items-center justify-center rounded-xl ${
                  tile.tone === "royal"
                    ? "bg-royal-soft text-royal-ink"
                    : tile.tone === "emerald"
                    ? "bg-emerald-soft text-emerald-ink"
                    : "bg-honey-soft text-ink"
                }`}
              >
                <tile.icon className="h-4 w-4" aria-hidden />
              </div>
              <p className="mt-4 font-[family-name:var(--font-display)] text-lg font-semibold text-ink">
                {tile.label}
              </p>
              <p className="mt-2 text-sm leading-6 text-ink-muted">{tile.copy}</p>
              <span className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-royal opacity-0 transition group-hover:opacity-100">
                Go <ArrowRight className="h-3 w-3" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
