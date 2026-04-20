import { CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GradientCard } from "@/components/ui/gradient-card";
import { StepDots } from "@/components/ui/step-dots";
import { plans } from "@/lib/config/site-data";
import { currency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default function SubscribePage() {
  return (
    <div className="space-y-6">
      <GradientCard tone="royal" className="sm:p-10">
        <Badge tone="inverse">Set up your membership</Badge>
        <h1 className="display-hero mt-4 text-3xl text-white sm:text-4xl">
          One last thing: pick a plan.
        </h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/78">
          Payment runs securely through Stripe. Your Fixpass access unlocks the moment the subscription
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
          Pick the level of home support that fits you. You can change plans later from Membership.
        </p>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {plans.map((p) => {
            const isPlatinum = p.id === "platinum";
            return (
              <div
                key={p.id}
                className={`rounded-2xl border p-5 ${
                  isPlatinum
                    ? "border-royal/30 bg-gradient-to-br from-ink via-royal to-lapis text-white"
                    : p.id === "gold"
                    ? "border-honey/40 bg-honey-soft text-ink ring-1 ring-honey/40"
                    : "border-border bg-surface text-ink"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  {p.featured ? (
                    <Badge tone={isPlatinum ? "inverse" : p.id === "gold" ? "honey" : "default"}>
                      {p.featured}
                    </Badge>
                  ) : (
                    <span className="text-xs text-ink-subtle">{p.priority}</span>
                  )}
                </div>
                <h3
                  className={`mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold ${
                    isPlatinum ? "text-white" : "text-ink"
                  }`}
                >
                  {p.name}
                </h3>
                <p
                  className={`mt-1 font-[family-name:var(--font-display)] text-3xl font-semibold ${
                    isPlatinum ? "text-white" : "text-ink"
                  }`}
                >
                  {currency(p.monthlyPrice)}
                  <span className={`ml-1 text-sm font-normal ${isPlatinum ? "text-white/70" : "text-ink-muted"}`}>
                    /mo
                  </span>
                </p>
                <p className={`mt-2 text-sm ${isPlatinum ? "text-white/80" : "text-ink-muted"}`}>
                  {typeof p.includedVisits === "number" ? `${p.includedVisits} covered visits` : p.includedVisits}
                </p>
                <form action="/api/billing/checkout" method="post" className="mt-5">
                  <input type="hidden" name="planId" value={p.id} />
                  <input type="hidden" name="billingCycle" value="monthly" />
                  <Button
                    type="submit"
                    variant={isPlatinum ? "inverse" : "primary"}
                    fullWidth
                    iconLeft={<CreditCard className="h-4 w-4" />}
                  >
                    Continue with {p.name}
                  </Button>
                </form>
              </div>
            );
          })}
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
