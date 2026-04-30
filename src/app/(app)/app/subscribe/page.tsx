import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { GradientCard } from "@/components/ui/gradient-card";
import { StepDots } from "@/components/ui/step-dots";
import { SubscribePlans } from "@/components/subscribe/subscribe-plans";
import type { BillingCycleId, PlanId } from "@/lib/config/site-data";

export const dynamic = "force-dynamic";

const VALID_PLANS: PlanId[] = ["silver", "gold", "platinum"];
const VALID_CYCLES: BillingCycleId[] = ["3mo", "6mo", "1yr"];

export default async function SubscribePage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = (await searchParams) ?? {};
  const planParam = typeof params.plan === "string" ? params.plan : undefined;
  const cycleParam = typeof params.cycle === "string" ? params.cycle : undefined;
  const preselectPlan = VALID_PLANS.includes(planParam as PlanId)
    ? (planParam as PlanId)
    : undefined;
  const preselectCycle = VALID_CYCLES.includes(cycleParam as BillingCycleId)
    ? (cycleParam as BillingCycleId)
    : undefined;

  return (
    <div className="space-y-6">
      <GradientCard tone="royal" className="sm:p-10">
        <Badge tone="inverse">Set up your membership</Badge>
        <h1 className="display-hero mt-4 text-3xl text-white sm:text-4xl">
          One last thing: pick a plan.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/78">
          Payment runs securely through Stripe. Your Fixpass access goes live the moment the subscription
          is active — usually seconds after you return to this screen.
        </p>
        <div className="mt-6 flex items-center gap-3">
          <StepDots current={0} total={3} />
        </div>
      </GradientCard>

      <Card>
        <p className="eyebrow">Step 1</p>
        <h2 className="display-section mt-2 text-2xl text-ink">Choose your plan</h2>
        <p className="mt-3 text-sm leading-6 text-ink-muted">
          Prepay 3, 6, or 12 months — longer terms lock in a better per-month rate. Plan changes
          flow through Stripe&apos;s billing portal later.
        </p>

        <div className="mt-6">
          <SubscribePlans preselectPlan={preselectPlan} preselectCycle={preselectCycle} />
        </div>
      </Card>

      <Card>
        <p className="eyebrow">Step 2 · Secure checkout</p>
        <h2 className="display-section mt-2 text-2xl text-ink">Pay securely via Stripe</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">
          After you pick a plan, we&apos;ll hand off to Stripe for checkout. Apple Pay / Google Pay /
          cards — all standard. Return here afterwards and we&apos;ll confirm your membership is active.
        </p>
      </Card>
    </div>
  );
}
