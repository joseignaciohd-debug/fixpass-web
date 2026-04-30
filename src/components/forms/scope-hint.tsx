"use client";

// ScopeHint — inline coaching widget for the new-request form.
// Surfaces the "covered visit" rules so members know what they're
// signing up for BEFORE they hit submit, instead of finding out at
// operator review. Collapsible by default so it doesn't dominate
// the form on repeat use.

import { ChevronDown, Info } from "lucide-react";
import { useState } from "react";

const RULES: Array<{ headline: string; detail: string }> = [
  {
    headline: "Up to 3 related small tasks per visit",
    detail:
      "Covered visits work best for grouped work in one area — e.g. patch three drywall holes + retouch paint, or hang a TV plus mount its soundbar. One moderately sized job also counts.",
  },
  {
    headline: "Up to 90 minutes of labor per visit",
    detail:
      "Visits target a 90-minute labor cap so we can keep schedules predictable. Larger jobs get scoped into multiple visits or quoted separately at your member discount.",
  },
  {
    headline: "Operator review inside 24 hours",
    detail:
      "An operator reviews scope, confirms coverage, and replies before anything is dispatched. Most covered visits land inside 1–3 business days.",
  },
  {
    headline: "Outdoor work is quoted separately",
    detail:
      "Fence painting, driveway pressure washing, and other exterior touch-ups are offered to members but quoted separately rather than counted as a covered visit.",
  },
];

export function ScopeHint() {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl border border-royal-soft/60 bg-royal-soft/30 px-5 py-4 transition-colors">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="focus-ring flex w-full items-center justify-between gap-3 text-left"
      >
        <span className="flex items-center gap-2.5">
          <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-royal/10 text-royal">
            <Info className="h-4 w-4" />
          </span>
          <span>
            <span className="block text-sm font-semibold text-ink">
              What counts as a covered visit?
            </span>
            <span className="mt-0.5 block text-xs text-ink-muted">
              The rules in writing — read before you submit.
            </span>
          </span>
        </span>
        <ChevronDown
          className={`h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open ? (
        <ul className="mt-4 grid gap-3 border-t border-royal-soft/60 pt-4">
          {RULES.map((rule) => (
            <li key={rule.headline} className="grid gap-1">
              <p className="text-sm font-semibold text-ink">{rule.headline}</p>
              <p className="text-xs leading-5 text-ink-muted">{rule.detail}</p>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
