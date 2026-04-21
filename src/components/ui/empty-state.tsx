// EmptyState — the "nothing yet" screen pattern. Generic enough for
// portal pages (no requests, no notifications, no billing records)
// without being plain-text boring.

import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type Tone = "royal" | "emerald" | "sky" | "honey" | "lapis" | "basil";

const toneClasses: Record<Tone, string> = {
  royal: "bg-royal-soft text-royal-ink",
  emerald: "bg-emerald-soft text-emerald-ink",
  sky: "bg-sky-soft text-sky-ink",
  honey: "bg-honey-soft text-cream-ink",
  lapis: "bg-lapis-soft text-lapis-ink",
  basil: "bg-basil-soft text-basil-ink",
};

export function EmptyState({
  icon: Icon,
  title,
  description,
  tone = "sky",
  action,
  className,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  tone?: Tone;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-2xl border border-border bg-canvas-elevated p-10 text-center",
        className,
      )}
    >
      <div className={cn("inline-flex h-14 w-14 items-center justify-center rounded-2xl", toneClasses[tone])}>
        <Icon className="h-6 w-6" aria-hidden />
      </div>
      <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink">{title}</h3>
      {description ? (
        <p className="max-w-sm text-sm leading-6 text-ink-muted">{description}</p>
      ) : null}
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  );
}
