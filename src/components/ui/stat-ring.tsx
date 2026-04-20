"use client";

// StatRing — animated circular progress. Used on membership to show
// "3 of 5 visits used" more hero-like than a linear bar.

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { cn } from "@/lib/utils";

export function StatRing({
  value,
  max,
  label,
  caption,
  size = 160,
  strokeWidth = 12,
  tone = "emerald",
  className,
}: {
  value: number;
  max: number;
  label?: string;
  caption?: string;
  size?: number;
  strokeWidth?: number;
  tone?: "emerald" | "royal" | "sky" | "honey";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });

  const pct = Math.max(0, Math.min(1, value / max));
  const r = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * r;
  const dashOffset = circ * (1 - pct);

  const colors = {
    emerald: "stroke-emerald",
    royal: "stroke-royal",
    sky: "stroke-sky",
    honey: "stroke-honey",
  } as const;

  return (
    <div ref={ref} className={cn("flex flex-col items-center", className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={strokeWidth}
            className="stroke-border fill-none"
          />
          <motion.circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className={cn("fill-none", colors[tone])}
            strokeDasharray={circ}
            initial={{ strokeDashoffset: circ }}
            animate={{ strokeDashoffset: inView ? dashOffset : circ }}
            transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="font-[family-name:var(--font-display)] text-4xl font-semibold text-ink">
            {value}
            <span className="text-xl text-ink-muted"> / {max}</span>
          </span>
          {label ? (
            <span className="mt-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              {label}
            </span>
          ) : null}
        </div>
      </div>
      {caption ? <p className="mt-3 text-center text-sm text-ink-muted">{caption}</p> : null}
    </div>
  );
}
