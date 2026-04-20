// Badge — small capsule tag. Tones mirror the mobile palette and
// the semantic aliases (success/warning/danger) used in copy.

import { cn } from "@/lib/utils";

export type BadgeTone =
  | "default"
  | "ink"
  | "inverse"
  | "royal"
  | "sky"
  | "emerald"
  | "lapis"
  | "basil"
  | "honey"
  | "cream"
  | "brick"
  // Semantic aliases — renderers match tone maps by name.
  | "success"
  | "warning"
  | "danger";

type BadgeProps = {
  children: React.ReactNode;
  tone?: BadgeTone;
  icon?: React.ReactNode;
  className?: string;
};

const toneClasses: Record<BadgeTone, string> = {
  default:  "bg-canvas-elevated text-ink border border-border",
  ink:      "bg-ink text-white border border-ink",
  inverse:  "bg-white/15 text-white border border-white/20 backdrop-blur",
  royal:    "bg-royal-soft text-royal-ink border border-royal/25",
  sky:      "bg-sky-soft text-sky-ink border border-sky/25",
  emerald:  "bg-emerald-soft text-emerald-ink border border-emerald/25",
  lapis:    "bg-lapis-soft text-lapis-ink border border-lapis/25",
  basil:    "bg-basil-soft text-basil-ink border border-basil/25",
  honey:    "bg-honey-soft text-cream-ink border border-honey/40",
  cream:    "bg-cream text-cream-ink border border-honey/40",
  brick:    "bg-brick-soft text-brick-ink border border-brick/25",

  success:  "bg-emerald-soft text-emerald-ink border border-emerald/25",
  warning:  "bg-honey-soft text-cream-ink border border-honey/40",
  danger:   "bg-brick-soft text-brick-ink border border-brick/25",
};

export function Badge({ children, tone = "default", icon, className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em]",
        toneClasses[tone],
        className,
      )}
    >
      {icon ? <span className="flex h-3 w-3 items-center justify-center">{icon}</span> : null}
      {children}
    </span>
  );
}
