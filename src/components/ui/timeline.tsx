"use client";

// Timeline + TimelineStep — vertical step list with connector line.
// Used for request status history, inbox grouping, how-it-works,
// and onboarding flows. Entrance stagger via framer-motion.

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Timeline({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={cn("relative space-y-5", className)}>{children}</div>;
}

type StepTone = "emerald" | "royal" | "sky" | "honey" | "ink" | "muted";

const toneDot: Record<StepTone, string> = {
  emerald: "bg-emerald text-white",
  royal:   "bg-royal text-white",
  sky:     "bg-sky text-white",
  honey:   "bg-honey text-cream-ink",
  ink:     "bg-ink text-white",
  muted:   "bg-surface-muted text-ink-muted border border-border",
};

export function TimelineStep({
  index,
  title,
  description,
  tone = "royal",
  meta,
  last = false,
  delay = 0,
}: {
  index?: React.ReactNode;
  title: string;
  description?: string;
  tone?: StepTone;
  // ReactNode so callers can render richer meta (e.g. time + an inline
  // icon for tappable rows) instead of a plain timestamp string.
  meta?: React.ReactNode;
  last?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay, ease: [0.22, 1, 0.36, 1] }}
      className="relative flex gap-4"
    >
      <div className="flex flex-col items-center">
        <span
          className={cn(
            "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold shadow-sm",
            toneDot[tone],
          )}
        >
          {index ?? ""}
        </span>
        {!last ? <span aria-hidden className="mt-2 w-px flex-1 bg-border" /> : null}
      </div>
      <div className="min-w-0 flex-1 pb-5">
        <div className="flex items-baseline justify-between gap-3">
          <p className="text-sm font-semibold text-ink">{title}</p>
          {meta ? <span className="text-xs text-ink-subtle">{meta}</span> : null}
        </div>
        {description ? (
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{description}</p>
        ) : null}
      </div>
    </motion.div>
  );
}
