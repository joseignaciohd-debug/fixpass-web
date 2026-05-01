"use client";

// Authenticated subscribe flow — three plan cards, each exposing all
// three billing-cycle prices up front. User picks the (plan, cycle)
// combo by clicking a price row, then submits that card's form to
// /api/billing/checkout. No hidden state, no toggling required.

import { CreditCard, Info } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip } from "@/components/ui/tooltip";
import {
  type BillingCycleId,
  billingCycles,
  DEFAULT_BILLING_CYCLE,
  plans,
  planPerMonth,
  planPrice,
} from "@/lib/config/site-data";
import { currency } from "@/lib/utils";

export function SubscribePlans({
  preselectPlan,
  preselectCycle,
}: {
  preselectPlan?: string;
  preselectCycle?: BillingCycleId;
} = {}) {
  // Reorder so the preselected plan renders first + pulses briefly to
  // draw the eye. Keeps the others visible so the user can still compare.
  const orderedPlans = preselectPlan
    ? [...plans].sort((a, b) =>
        a.id === preselectPlan ? -1 : b.id === preselectPlan ? 1 : 0,
      )
    : plans;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      {orderedPlans.map((p) => (
        <SubscribeCard
          key={p.id}
          plan={p}
          initialCycle={
            preselectPlan === p.id && preselectCycle ? preselectCycle : undefined
          }
          preselected={preselectPlan === p.id}
        />
      ))}
    </div>
  );
}

function SubscribeCard({
  plan,
  initialCycle,
  preselected = false,
}: {
  plan: (typeof plans)[number];
  initialCycle?: BillingCycleId;
  preselected?: boolean;
}) {
  const [cycle, setCycle] = useState<BillingCycleId>(initialCycle ?? DEFAULT_BILLING_CYCLE);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isPlatinum = plan.id === "platinum";
  const isGold = plan.id === "gold";

  async function handleCheckout(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/billing/checkout", {
        method: "POST",
        // Tell the route we want JSON — without this, it 303s us to Stripe
        // (the path used by native form POSTs that fire before hydration).
        headers: { Accept: "application/json" },
        body: new FormData(e.currentTarget),
      });
      const data = await res.json().catch(() => null);
      // 401 → route returns { url: "/sign-in" }. Treat any url in the
      // response as a navigation target (Stripe on success, /sign-in
      // when the session expired).
      if (data?.url) {
        window.location.href = data.url;
        return;
      }
      setError(data?.error ?? `Could not start checkout (${res.status}).`);
      setSubmitting(false);
    } catch {
      setError("Network error. Try again.");
      setSubmitting(false);
    }
  }

  return (
    <div
      className={`rounded-2xl border p-5 ${
        isPlatinum
          ? "border-royal/30 bg-gradient-to-br from-ink via-royal to-lapis text-white"
          : isGold
          ? "border-honey/40 bg-honey-soft text-ink ring-1 ring-honey/40"
          : "border-border bg-surface text-ink"
      } ${preselected ? "ring-2 ring-royal" : ""}`}
    >
      {preselected ? (
        <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-royal-soft px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-royal-ink">
          <span className="inline-block h-1 w-1 rounded-full bg-royal" />
          Your pick from /plans
        </div>
      ) : null}
      <div className="flex items-center justify-between gap-3">
        {plan.featured ? (
          <Badge tone={isPlatinum ? "inverse" : isGold ? "honey" : "default"}>
            {plan.featured}
          </Badge>
        ) : (
          <span className={`text-xs ${isPlatinum ? "text-white/70" : "text-ink-subtle"}`}>
            {plan.priority}
          </span>
        )}
      </div>
      <h3
        className={`mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold ${
          isPlatinum ? "text-white" : "text-ink"
        }`}
      >
        {plan.name}
      </h3>
      <p className={`mt-1 text-sm ${isPlatinum ? "text-white/80" : "text-ink-muted"}`}>
        {typeof plan.includedVisits === "number"
          ? `${plan.includedVisits} covered visits / mo`
          : plan.includedVisits}
      </p>

      <div className="mt-5 space-y-2">
        {billingCycles.map((c) => {
          const baseline = planPerMonth(plan, "3mo");
          const perMonth = planPerMonth(plan, c.id);
          const savings = Math.max(0, (baseline - perMonth) * 12);
          return (
            <PriceRow
              key={c.id}
              label={c.label}
              perMonth={perMonth}
              total={planPrice(plan, c.id)}
              months={c.months}
              badge={c.badge}
              savingsPerYear={savings}
              active={c.id === cycle}
              isPlatinum={isPlatinum}
              onSelect={() => setCycle(c.id)}
            />
          );
        })}
      </div>

      <form onSubmit={handleCheckout} className="mt-5">
        <input type="hidden" name="planId" value={plan.id} />
        <input type="hidden" name="billingCycle" value={cycle} />
        <Button
          type="submit"
          variant={isPlatinum ? "inverse" : "primary"}
          fullWidth
          disabled={submitting}
          iconLeft={<CreditCard className="h-4 w-4" />}
        >
          {submitting ? "Loading…" : `Continue · ${currency(planPrice(plan, cycle))}`}
        </Button>
        {error ? (
          <p className={`mt-2 text-xs ${isPlatinum ? "text-white/80" : "text-red-600"}`}>
            {error}
          </p>
        ) : null}
      </form>
    </div>
  );
}

function PriceRow({
  label,
  perMonth,
  total,
  months,
  badge,
  savingsPerYear,
  active,
  isPlatinum,
  onSelect,
}: {
  label: string;
  perMonth: number;
  total: number;
  months: number;
  badge?: string;
  savingsPerYear: number;
  active: boolean;
  isPlatinum: boolean;
  onSelect: () => void;
}) {
  const activeBorder = isPlatinum ? "border-white" : "border-royal";
  const inactiveBorder = isPlatinum ? "border-white/15" : "border-border";
  const activeBg = isPlatinum ? "bg-white/[0.14]" : "bg-royal-soft";
  const inactiveBg = isPlatinum ? "bg-white/[0.04]" : "bg-canvas-elevated";
  const labelColor = isPlatinum ? "text-white" : "text-ink";
  const mutedColor = isPlatinum ? "text-white/60" : "text-ink-muted";

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      aria-pressed={active}
      className={`focus-ring flex w-full items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left transition ${
        active
          ? `${activeBorder} ${activeBg}`
          : `${inactiveBorder} ${inactiveBg} hover:border-border-strong`
      }`}
    >
      <div className="flex items-center gap-2.5">
        <span
          className={`grid h-4 w-4 place-items-center rounded-full border-2 ${
            active
              ? `${activeBorder} ${isPlatinum ? "bg-white" : "bg-royal"}`
              : `${isPlatinum ? "border-white/40" : "border-border-strong"} bg-transparent`
          }`}
          aria-hidden
        >
          {active ? (
            <span className={`h-1.5 w-1.5 rounded-full ${isPlatinum ? "bg-ink" : "bg-white"}`} />
          ) : null}
        </span>
        <div>
          <div className={`flex items-center gap-1.5 text-xs font-semibold ${labelColor}`}>
            {label}
            {badge ? (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[8px] font-semibold uppercase tracking-[0.14em] ${
                  badge === "Best value"
                    ? "bg-emerald-soft text-emerald-ink"
                    : "bg-honey-soft text-ink"
                }`}
              >
                {badge}
              </span>
            ) : null}
          </div>
          <div className={`text-[10px] ${mutedColor}`}>
            {currency(total)} · every {months === 12 ? "yr" : `${months} mo`}
            {savingsPerYear > 0 ? (
              <Tooltip
                placement="top"
                content={
                  <>
                    Compared to paying the 3-month rate continuously. Longer
                    terms lock in a lower per-month rate that would otherwise
                    cost {currency(perMonth + savingsPerYear / 12)}/mo.
                  </>
                }
              >
                <span
                  className={`ml-1 inline-flex cursor-help items-center gap-0.5 font-semibold ${
                    isPlatinum ? "text-emerald" : "text-emerald-ink"
                  }`}
                >
                  · save {currency(savingsPerYear)}/yr
                  <Info className="h-2 w-2 opacity-70" aria-hidden />
                </span>
              </Tooltip>
            ) : null}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div
          className={`font-[family-name:var(--font-display)] text-lg font-semibold tabular-nums ${labelColor}`}
        >
          {currency(perMonth)}
        </div>
        <div className={`text-[9px] uppercase tracking-wider ${mutedColor}`}>/mo</div>
      </div>
    </motion.button>
  );
}
