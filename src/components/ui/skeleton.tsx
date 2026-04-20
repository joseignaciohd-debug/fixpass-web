// Skeleton — shimmer loading block. Used while portal data fetches so
// the layout doesn't jump when data arrives.

import { cn } from "@/lib/utils";

export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-xl bg-surface-muted",
        // Shimmer: translating highlight via CSS keyframe in globals.css.
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.8s_infinite] before:bg-gradient-to-r before:from-transparent before:via-surface/60 before:to-transparent",
        className,
      )}
      aria-hidden
    />
  );
}
