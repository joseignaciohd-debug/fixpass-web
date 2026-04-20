"use client";

// Linear progress bar. Spring-fills from 0 to target on scroll-into-view.

import { motion } from "framer-motion";

export function ProgressMeter({
  label,
  value,
  tone = "royal",
}: {
  label: string;
  value: number;
  tone?: "royal" | "emerald" | "honey";
}) {
  const clamped = Math.max(0, Math.min(100, value));

  const gradients = {
    royal: "bg-gradient-to-r from-royal via-lapis to-sky",
    emerald: "bg-gradient-to-r from-emerald to-emerald/70",
    honey: "bg-gradient-to-r from-honey to-honey/70",
  } as const;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-sm">
        <span className="text-ink-muted">{label}</span>
        <span className="font-semibold text-ink tabular-nums">{clamped}%</span>
      </div>
      <div
        className="h-2 overflow-hidden rounded-full bg-surface-muted"
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={label}
      >
        <motion.div
          className={`h-2 rounded-full ${gradients[tone]}`}
          initial={{ width: 0 }}
          whileInView={{ width: `${clamped}%` }}
          viewport={{ once: true, margin: "-40px" }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}
