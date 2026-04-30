"use client";

// Plan cards that show ALL three billing cycles at once inside each
// plan's card. User picks the (plan, cycle) combo by clicking a row.
// All nine prices are visible without any toggling — the user never has
// to hunt for pricing. Each card keeps its own selected cycle.

import { Check, Info } from "lucide-react";
import { useState } from "react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
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

export function PlanCards({ ctaHref = "/join" }: { ctaHref?: string }) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {plans.map((plan, i) => (
        <PlanCard key={plan.id} plan={plan} delay={0.06 * i} ctaHref={ctaHref} />
      ))}
    </div>
  );
}

function PlanCard({
  plan,
  delay,
  ctaHref,
}: {
  plan: (typeof plans)[number];
  delay: number;
  ctaHref: string;
}) {
  const [cycle, setCycle] = useState<BillingCycleId>(DEFAULT_BILLING_CYCLE);
  const isPlatinum = plan.id === "platinum";
  const isGold = plan.id === "gold";

  return (
    <Card
      variant={isPlatinum ? "dark" : isGold ? "ivory" : "default"}
      className={isGold ? "ring-1 ring-emerald/30" : ""}
      delay={delay}
    >
      {plan.featured ? (
        <div className="mb-4">
          <Badge tone={isPlatinum ? "inverse" : "honey"}>{plan.featured}</Badge>
        </div>
      ) : null}

      <h2
        className={`font-[family-name:var(--font-display)] text-3xl font-semibold ${
          isPlatinum ? "text-white" : "text-ink"
        }`}
      >
        {plan.name}
      </h2>
      <p
        className={`mt-2 max-w-xs text-sm leading-6 ${
          isPlatinum ? "text-white/70" : "text-ink-muted"
        }`}
      >
        {plan.tagline}
      </p>

      {/* Price matrix — every cycle visible, click to select. Savings
          are computed against the 3-month cycle (baseline) since that's
          the shortest / highest per-month rate. */}
      <div className="mt-6 space-y-2">
        {billingCycles.map((c) => {
          const total = planPrice(plan, c.id);
          const perMonth = planPerMonth(plan, c.id);
          const baselinePerMonth = planPerMonth(plan, "3mo");
          // Yearly savings vs paying the 3-month rate for 12 months.
          const savings = Math.max(0, (baselinePerMonth - perMonth) * 12);
          const active = c.id === cycle;
          return (
            <PriceRow
              key={c.id}
              label={c.label}
              perMonth={perMonth}
              total={total}
              months={c.months}
              badge={c.badge}
              savingsPerYear={savings}
              active={active}
              isPlatinum={isPlatinum}
              onSelect={() => setCycle(c.id)}
            />
          );
        })}
      </div>

      <ul
        className={`mt-6 space-y-3 text-sm ${
          isPlatinum ? "text-white/85" : "text-ink-muted"
        }`}
      >
        <PlanLi highlight={isPlatinum}>
          {typeof plan.includedVisits === "number"
            ? `${plan.includedVisits} covered visits / month`
            : plan.includedVisits}
        </PlanLi>
        <PlanLi highlight={isPlatinum}>{plan.priority} scheduling priority</PlanLi>
        <PlanLi highlight={isPlatinum}>{plan.maxLaborMinutes} labor minutes per visit</PlanLi>
        <PlanLi highlight={isPlatinum}>
          {plan.materialsAllowance
            ? `${currency(plan.materialsAllowance)} / mo materials`
            : "Materials pass-through"}
        </PlanLi>
        <PlanLi highlight={isPlatinum}>{plan.outOfScopeDiscount}% off quoted work</PlanLi>
      </ul>

      <form action={ctaHref} method="get" className="mt-8">
        <input type="hidden" name="plan" value={plan.id} />
        <input type="hidden" name="cycle" value={cycle} />
        <Button
          type="submit"
          variant={isPlatinum ? "inverse" : "primary"}
          className="w-full"
        >
          Choose {plan.name} · {currency(planPrice(plan, cycle))}
        </Button>
      </form>
    </Card>
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
  // Color treatment differs on the dark (Platinum) card vs light cards.
  const activeBorder = isPlatinum ? "border-white" : "border-royal";
  const inactiveBorder = isPlatinum ? "border-white/15" : "border-border";
  const activeBg = isPlatinum ? "bg-white/[0.14]" : "bg-royal-soft";
  const inactiveBg = isPlatinum ? "bg-white/[0.04]" : "bg-surface";
  const labelColor = isPlatinum ? "text-white" : "text-ink";
  const mutedColor = isPlatinum ? "text-white/60" : "text-ink-muted";
  const dotActive = isPlatinum ? "bg-white" : "bg-royal";
  const dotInactive = isPlatinum ? "border-white/40" : "border-border-strong";

  return (
    <motion.button
      type="button"
      onClick={onSelect}
      whileTap={{ scale: 0.98 }}
      aria-pressed={active}
      className={`focus-ring flex w-full items-center justify-between gap-3 rounded-xl border px-3 py-2.5 text-left transition ${
        active ? `${activeBorder} ${activeBg}` : `${inactiveBorder} ${inactiveBg} hover:border-border-strong`
      }`}
    >
      <div className="flex items-center gap-3">
        <span
          className={`grid h-4 w-4 place-items-center rounded-full border-2 ${
            active ? `${activeBorder} ${dotActive}` : `${dotInactive} bg-transparent`
          }`}
          aria-hidden
        >
          {active ? (
            <span className={`h-1.5 w-1.5 rounded-full ${isPlatinum ? "bg-ink" : "bg-white"}`} />
          ) : null}
        </span>
        <div>
          <div className={`flex items-center gap-2 text-sm font-semibold ${labelColor}`}>
            {label}
            {badge ? (
              <span
                className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                  badge === "Best value"
                    ? "bg-emerald-soft text-emerald-ink"
                    : "bg-honey-soft text-ink"
                }`}
              >
                {badge}
              </span>
            ) : null}
          </div>
          <div className={`text-xs ${mutedColor}`}>
            {currency(total)} billed every {months === 12 ? "year" : `${months} mo`}
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
                  <Info className="h-2.5 w-2.5 opacity-70" aria-hidden />
                </span>
              </Tooltip>
            ) : null}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div
          className={`font-[family-name:var(--font-display)] text-2xl font-semibold tabular-nums ${labelColor}`}
        >
          {currency(perMonth)}
        </div>
        <div className={`text-[10px] uppercase tracking-wider ${mutedColor}`}>/mo</div>
      </div>
    </motion.button>
  );
}

function PlanLi({ children, highlight }: { children: React.ReactNode; highlight: boolean }) {
  return (
    <li className="flex items-start gap-2">
      <Check size={16} className={`mt-0.5 shrink-0 ${highlight ? "text-honey" : "text-emerald"}`} />
      <span>{children}</span>
    </li>
  );
}
