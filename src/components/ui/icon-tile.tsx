// IconTile — colored square with icon + label + optional description.
// Used for marketing pillars grid, service inventory, quick-actions.

import { cn } from "@/lib/utils";

type IconTileTone = "royal" | "emerald" | "sky" | "lapis" | "basil" | "honey" | "brick" | "ink";

type Props = {
  icon: React.ReactNode;
  label: string;
  description?: string;
  tone?: IconTileTone;
  className?: string;
};

const tones: Record<IconTileTone, string> = {
  royal:   "bg-royal-soft text-royal-ink",
  emerald: "bg-emerald-soft text-emerald-ink",
  sky:     "bg-sky-soft text-sky-ink",
  lapis:   "bg-lapis-soft text-lapis-ink",
  basil:   "bg-basil-soft text-basil-ink",
  honey:   "bg-honey-soft text-cream-ink",
  brick:   "bg-brick-soft text-brick-ink",
  ink:     "bg-canvas-elevated text-ink",
};

export function IconTile({ icon, label, description, tone = "royal", className }: Props) {
  return (
    <div
      className={cn(
        "group flex flex-col gap-3 rounded-[var(--radius-md)] border border-border bg-surface p-5 transition-shadow hover:shadow-[0_18px_45px_-24px_rgb(var(--shadow)/0.3)]",
        className,
      )}
    >
      <span
        className={cn("inline-flex h-10 w-10 items-center justify-center rounded-xl", tones[tone])}
        aria-hidden
      >
        {icon}
      </span>
      <div>
        <p className="text-sm font-semibold text-ink">{label}</p>
        {description ? (
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">{description}</p>
        ) : null}
      </div>
    </div>
  );
}
