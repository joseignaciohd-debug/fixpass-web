import { ArrowRight, CheckCircle2, Home, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";
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
  const session = (await getCurrentSession())!;
  const { session_id } = await searchParams;
  const firstName = session.name.split(/\s+/)[0] || session.name;

  return (
    <div className="space-y-8">
      <WelcomeConfetti />
      {session_id ? <WelcomePaymentWatcher userId={session.userId} /> : null}

      <GradientCard tone="royal" className="sm:p-12">
        <Badge tone="inverse">Welcome aboard</Badge>
        <h1 className="display-hero mt-4 text-4xl text-white sm:text-5xl lg:text-6xl">
          You&apos;re in, {firstName}.
        </h1>
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
              description="Address + access notes. Takes 60 seconds, unlocks accurate scheduling."
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
    </div>
  );
}
