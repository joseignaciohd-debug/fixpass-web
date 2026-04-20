"use client";

// StepDots — animated page indicator for multi-step flows (subscribe,
// onboarding). Uses framer-motion layout transitions so the active pill
// slides smoothly as `current` changes.

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function StepDots({
  current,
  total,
  className,
}: {
  current: number;
  total: number;
  className?: string;
}) {
  return (
    <div
      role="progressbar"
      aria-valuenow={current}
      aria-valuemin={0}
      aria-valuemax={total}
      className={cn("flex items-center gap-2", className)}
    >
      {Array.from({ length: total }, (_, i) => {
        const active = i === current;
        const done = i < current;
        return (
          <motion.span
            key={i}
            layout
            transition={{ type: "spring", stiffness: 400, damping: 28 }}
            className={cn(
              "h-1.5 rounded-full",
              active ? "w-8 bg-royal" : done ? "w-4 bg-royal/50" : "w-4 bg-border",
            )}
          />
        );
      })}
    </div>
  );
}
