"use client";

// Chip — selectable pill. Category filters on request forms, quick-pick
// options, etc. Whole-element whileTap scale matches the mobile feel.

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function Chip({
  label,
  selected = false,
  onToggle,
  icon,
  className,
}: {
  label: string;
  selected?: boolean;
  onToggle?: () => void;
  icon?: React.ReactNode;
  className?: string;
}) {
  return (
    <motion.button
      type="button"
      onClick={onToggle}
      whileTap={{ scale: 0.96 }}
      aria-pressed={selected}
      className={cn(
        "focus-ring inline-flex items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition",
        selected
          ? "border-emerald bg-emerald-soft text-emerald-ink"
          : "border-border bg-surface text-ink-muted hover:border-border-strong hover:text-ink",
        className,
      )}
    >
      {icon ? <span className="h-3.5 w-3.5">{icon}</span> : null}
      {label}
    </motion.button>
  );
}
