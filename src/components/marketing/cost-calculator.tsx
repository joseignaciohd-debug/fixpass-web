"use client";

// CostCalculator — interactive "vs hiring a handyman" math. Lets the
// visitor slide a typical-visits-per-year dial + a typical-call-out
// rate dial, shows savings vs the Gold annual price. Anchors the
// value prop to a real dollar figure, which beats any marketing copy.

import { motion } from "framer-motion";
import { useMemo, useState } from "react";
import { Badge } from "@/components/ui/badge";

type Plan = "silver" | "gold" | "platinum";

const PLAN_META: Record<
  Plan,
  { name: string; monthly: number; annual: number; visits: number | "unlimited" }
> = {
  silver: { name: "Silver", monthly: 24.99, annual: 249.99, visits: 2 },
  gold: { name: "Gold", monthly: 49.99, annual: 499.99, visits: 5 },
  platinum: { name: "Platinum", monthly: 99.99, annual: 999.99, visits: "unlimited" },
};

function formatMoney(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

export function CostCalculator({ defaultPlan = "gold" as Plan }: { defaultPlan?: Plan }) {
  const [visitsPerMonth, setVisitsPerMonth] = useState(2);
  const [hourlyRate, setHourlyRate] = useState(95);
  const [minCallOut, setMinCallOut] = useState(125);
  const [plan, setPlan] = useState<Plan>(defaultPlan);

  // Ordinary handyman: per call-out = max(hourly * 1.5h, minimum call-out).
  // Assume visits average 90 min labor (Fixpass's own envelope) so the
  // comparison is apples-to-apples for what Fixpass would cover.
  const comparable = useMemo(() => {
    const perCall = Math.max(hourlyRate * 1.5, minCallOut);
    return {
      annual: perCall * visitsPerMonth * 12,
      perCall,
    };
  }, [hourlyRate, minCallOut, visitsPerMonth]);

  const fixpass = PLAN_META[plan];
  const fixpassAnnual = fixpass.annual;
  const savings = Math.max(0, comparable.annual - fixpassAnnual);
  const fits =
    fixpass.visits === "unlimited" || visitsPerMonth <= (fixpass.visits as number);

  return (
    <div className="rounded-[var(--radius-xl)] border border-border bg-surface/80 p-6 backdrop-blur sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="eyebrow">Savings calculator</p>
          <h3 className="display-section mt-2 text-2xl text-ink sm:text-3xl">
            Run the math on your own home
          </h3>
          <p className="mt-3 max-w-md text-sm leading-6 text-ink-muted">
            Sliders default to typical Katy rates. Adjust them to match your own experience.
          </p>
        </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        {/* Sliders */}
        <div className="grid gap-5">
          <Slider
            label="Visits per month"
            value={visitsPerMonth}
            onChange={setVisitsPerMonth}
            min={1}
            max={8}
            unit={visitsPerMonth === 1 ? "visit / month" : "visits / month"}
          />
          <Slider
            label="Typical hourly rate"
            value={hourlyRate}
            onChange={setHourlyRate}
            min={60}
            max={160}
            step={5}
            unit="/ hour"
            prefix="$"
          />
          <Slider
            label="Minimum call-out"
            value={minCallOut}
            onChange={setMinCallOut}
            min={75}
            max={200}
            step={5}
            unit="/ call"
            prefix="$"
          />

          <div className="flex flex-wrap gap-2 pt-2">
            {(["silver", "gold", "platinum"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPlan(p)}
                className={`focus-ring rounded-full border px-4 py-2 text-sm font-medium transition ${
                  plan === p
                    ? "border-royal bg-royal-soft text-royal-ink"
                    : "border-border bg-surface text-ink-muted hover:border-border-strong hover:text-ink"
                }`}
              >
                {PLAN_META[p].name}
              </button>
            ))}
          </div>
        </div>

        {/* Output */}
        <div className="rounded-2xl border border-border bg-gradient-to-br from-canvas-elevated to-surface p-5">
          <div className="grid gap-4">
            <Row
              label="Hiring handymen directly"
              value={formatMoney(comparable.annual)}
              helper={`${formatMoney(comparable.perCall)} × ${visitsPerMonth * 12}/yr`}
              tone="ink-muted"
            />
            <Row
              label={`Fixpass ${fixpass.name} (annual)`}
              value={formatMoney(fixpassAnnual)}
              helper={`${formatMoney(fixpass.monthly)}/mo · billed yearly`}
              tone="royal"
            />

            <div className="my-1 h-px bg-border" />

            <motion.div
              key={`${savings}`}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
              className="rounded-xl bg-emerald-soft/80 p-4"
            >
              <p className="eyebrow text-emerald-ink/80">Estimated yearly savings</p>
              <p className="mt-2 font-[family-name:var(--font-display)] text-4xl font-semibold text-emerald-ink">
                {formatMoney(savings)}
              </p>
              <p className="mt-2 text-xs leading-relaxed text-emerald-ink/80">
                Based on {visitsPerMonth} visit{visitsPerMonth === 1 ? "" : "s"} / month × 12.
                {!fits && fixpass.visits !== "unlimited" ? (
                  <>
                    {" "}
                    <Badge tone="honey" className="ml-1 inline-flex">
                      Platinum fits better
                    </Badge>
                  </>
                ) : null}
              </p>
            </motion.div>

            <p className="text-[11px] leading-relaxed text-ink-subtle">
              Rough benchmarks — real pricing depends on scope and scheduling. Treat this as a
              ballpark, not a quote.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Slider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  prefix = "",
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: string;
  prefix?: string;
}) {
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <label className="grid gap-2 text-sm font-medium text-ink">
      <span className="flex items-baseline justify-between gap-3">
        <span>{label}</span>
        <span className="font-[family-name:var(--font-display)] text-xl tabular-nums text-ink">
          {prefix}
          {value}
          <span className="ml-1 text-xs font-normal text-ink-muted">{unit}</span>
        </span>
      </span>
      <div className="relative">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="focus-ring h-2 w-full cursor-pointer appearance-none rounded-full bg-transparent"
          style={{
            background: `linear-gradient(to right, rgb(var(--royal)) 0%, rgb(var(--sky)) ${pct}%, rgb(var(--surface-muted)) ${pct}%, rgb(var(--surface-muted)) 100%)`,
          }}
        />
      </div>
    </label>
  );
}

function Row({
  label,
  value,
  helper,
  tone,
}: {
  label: string;
  value: string;
  helper: string;
  tone: "ink-muted" | "royal";
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className={`text-sm ${tone === "royal" ? "font-semibold text-ink" : "text-ink-muted"}`}>
          {label}
        </p>
        <p className="mt-0.5 text-xs text-ink-subtle">{helper}</p>
      </div>
      <p
        className={`font-[family-name:var(--font-display)] text-2xl font-semibold tabular-nums ${
          tone === "royal" ? "text-royal" : "text-ink-muted"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
