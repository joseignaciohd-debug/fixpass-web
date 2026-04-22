import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GradientCard } from "@/components/ui/gradient-card";
import { StatRing } from "@/components/ui/stat-ring";
import { getCurrentSession } from "@/lib/auth/session";
import { getCustomerSnapshot } from "@/lib/repositories/customer";
import { DEFAULT_BILLING_CYCLE, plans, planPerMonth, planPrice } from "@/lib/config/site-data";
import { currency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function MembershipPage() {
  const session = (await getCurrentSession())!;
  const snapshot = await getCustomerSnapshot(session.userId, { name: session.name, email: session.email });

  const subscription = snapshot.subscription;
  const currentPlanId: string | null = null; // plan id lookup TBD — UI handles unknown gracefully

  return (
    <div className="space-y-6">
      {subscription ? (
        <GradientCard tone="royal" className="sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div>
              <Badge tone="inverse">Current plan</Badge>
              <h1 className="display-hero mt-4 text-4xl text-white sm:text-5xl">Your membership</h1>
              <p className="mt-4 text-sm leading-7 text-white/78">
                {subscription.billingCycle} billing · renews {subscription.renewalDate}
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <form action="/api/billing/portal" method="post">
                  <Button type="submit" variant="inverse">
                    Open Stripe billing
                  </Button>
                </form>
              </div>
            </div>
            <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-white/[0.08] p-6 backdrop-blur">
              <StatRing
                value={subscription.visitsUsed}
                max={
                  typeof subscription.visitsRemaining === "number"
                    ? subscription.visitsUsed + subscription.visitsRemaining || 1
                    : 1
                }
                label="used"
                tone="honey"
                caption={
                  typeof subscription.visitsRemaining === "number"
                    ? `${subscription.visitsRemaining} visits remaining`
                    : "Unlimited coverage this cycle"
                }
                size={180}
              />
            </div>
          </div>
        </GradientCard>
      ) : (
        <Card>
          <div className="flex flex-col items-center gap-4 text-center">
            <p className="eyebrow">No active membership</p>
            <h1 className="display-section text-3xl text-ink">Pick a plan to get started</h1>
            <p className="max-w-xl text-sm leading-7 text-ink-muted">
              Billing is handled end-to-end by Stripe. Cancel anytime — coverage continues to your
              renewal date.
            </p>
            <Button href="/app/subscribe" size="lg">
              Start a membership
            </Button>
          </div>
        </Card>
      )}

      <Card>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="eyebrow">All plans</p>
            <h2 className="display-section mt-2 text-2xl text-ink">Compare tiers</h2>
          </div>
          <Link href="/plans" className="link-underline text-sm font-semibold text-royal">
            Marketing page
          </Link>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-3">
          {plans.map((p) => {
            const isCurrent = currentPlanId === p.id;
            const isPlatinum = p.id === "platinum";
            return (
              <div
                key={p.id}
                className={`rounded-2xl border p-5 transition ${
                  isPlatinum
                    ? "border-royal/30 bg-gradient-to-br from-ink via-royal to-lapis text-white"
                    : p.id === "gold"
                    ? "border-honey/40 bg-honey-soft text-ink ring-1 ring-honey/40"
                    : "border-border bg-surface text-ink"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <Badge tone={isPlatinum ? "inverse" : p.id === "gold" ? "honey" : "default"}>
                    {p.featured ?? p.name}
                  </Badge>
                  {isCurrent ? <Badge tone={isPlatinum ? "inverse" : "emerald"}>Current</Badge> : null}
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
                  {currency(planPerMonth(p, DEFAULT_BILLING_CYCLE))}
                  <span className={`ml-1 text-sm font-normal ${isPlatinum ? "text-white/70" : "text-ink-muted"}`}>
                    /mo
                  </span>
                </p>
                <p
                  className={`mt-1 text-xs ${
                    isPlatinum ? "text-white/60" : "text-ink-subtle"
                  }`}
                >
                  {currency(planPrice(p, DEFAULT_BILLING_CYCLE))} billed yearly · other terms available
                </p>
                <p
                  className={`mt-2 text-sm leading-6 ${
                    isPlatinum ? "text-white/80" : "text-ink-muted"
                  }`}
                >
                  {typeof p.includedVisits === "number"
                    ? `${p.includedVisits} covered visits`
                    : p.includedVisits}{" "}
                  · {p.priority} scheduling
                </p>
              </div>
            );
          })}
        </div>
      </Card>

      <Card>
        <p className="eyebrow">Billing history</p>
        <h2 className="display-section mt-2 text-2xl text-ink">Recent charges</h2>
        {snapshot.billing.length === 0 ? (
          <div className="mt-6 rounded-2xl border border-border bg-canvas-elevated p-5 text-sm text-ink-muted">
            No charges yet. Once Stripe bills you, the last 10 charges will appear here.
          </div>
        ) : (
          <div className="mt-6 space-y-3">
            {snapshot.billing.map((b) => (
              <div key={b.id} className="rounded-2xl border border-border bg-surface p-4">
                <div className="flex items-center justify-between gap-4">
                  <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink">
                    {currency(b.amount)}
                  </p>
                  <Badge tone={b.status === "paid" ? "emerald" : "honey"}>{b.status}</Badge>
                </div>
                <p className="mt-1 text-sm text-ink-muted">
                  {b.billedAt} · {b.method}
                </p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
