"use client";

// Shared billing-cycle toggle. Animated segmented control with badges
// ("Most popular" / "Best value"). Parent owns the state so the same
// selection can drive both pricing display + checkout hidden input.

import { motion } from "framer-motion";
import { billingCycles, type BillingCycleId } from "@/lib/config/site-data";

export function CycleToggle({
  value,
  onChange,
  tone = "light",
}: {
  value: BillingCycleId;
  onChange: (id: BillingCycleId) => void;
  tone?: "light" | "dark";
}) {
  const isDark = tone === "dark";
  return (
    <div
      className={`inline-flex items-center gap-1 rounded-full border p-1 backdrop-blur ${
        isDark
          ? "border-white/15 bg-white/[0.06]"
          : "border-border bg-surface/90"
      }`}
      role="tablist"
      aria-label="Billing cycle"
    >
      {billingCycles.map((c) => {
        const active = c.id === value;
        return (
          <button
            key={c.id}
            role="tab"
            aria-selected={active}
            type="button"
            onClick={() => onChange(c.id)}
            className={`focus-ring relative rounded-full px-4 py-2 text-sm font-semibold transition ${
              active
                ? isDark
                  ? "text-ink"
                  : "text-white"
                : isDark
                ? "text-white/70 hover:text-white"
                : "text-ink-muted hover:text-ink"
            }`}
          >
            {active ? (
              <motion.span
                layoutId={`cycle-pill-${tone}`}
                className={`absolute inset-0 rounded-full ${
                  isDark ? "bg-white" : "bg-gradient-to-r from-royal to-lapis"
                }`}
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            ) : null}
            <span className="relative z-10 flex items-center gap-2">
              {c.label}
              {c.badge ? (
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-[0.14em] ${
                    active
                      ? isDark
                        ? "bg-ink/10 text-ink"
                        : "bg-white/25 text-white"
                      : c.badge === "Best value"
                      ? "bg-emerald-soft text-emerald-ink"
                      : "bg-honey-soft text-ink"
                  }`}
                >
                  {c.badge}
                </span>
              ) : null}
            </span>
          </button>
        );
      })}
    </div>
  );
}
