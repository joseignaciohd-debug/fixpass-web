// StatusPill — picks tone from a status string so callers don't have
// to know the color mapping. Reused across customer + admin portals.

import { cn, titleCase } from "@/lib/utils";

const toneMap: Record<string, string> = {
  pending:               "bg-canvas-elevated text-ink-muted border border-border",
  "under review":        "bg-honey-soft text-cream-ink border border-honey/40",
  scheduled:             "bg-sky-soft text-sky-ink border border-sky/25",
  "technician assigned": "bg-royal-soft text-royal-ink border border-royal/25",
  "in progress":         "bg-lapis-soft text-lapis-ink border border-lapis/25",
  completed:             "bg-emerald-soft text-emerald-ink border border-emerald/25",
  "quoted separately":   "bg-honey-soft text-cream-ink border border-honey/40",
  declined:              "bg-brick-soft text-brick-ink border border-brick/25",
  cancelled:             "bg-canvas-elevated text-ink-subtle border border-border",
};

export function StatusPill({ status, className }: { status: string; className?: string }) {
  const key = status.toLowerCase();
  const tone = toneMap[key] ?? toneMap.pending;
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-3 py-1.5 text-xs font-semibold tracking-[0.14em] uppercase",
        tone,
        className,
      )}
    >
      {titleCase(status)}
    </span>
  );
}
