// SectionGroup — iOS-settings-style grouped rows.
// Used in profile + billing + admin settings for tidy lists of
// label+value rows with optional icons, chevrons, or destructive tones.

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

type Row = {
  icon?: React.ReactNode;
  label: string;
  value?: string;
  href?: string;
  onClick?: () => void;
  destructive?: boolean;
  trailing?: React.ReactNode;
};

export function SectionGroup({
  title,
  rows,
  className,
}: {
  title?: string;
  rows: Row[];
  className?: string;
}) {
  return (
    <div className={cn("space-y-2", className)}>
      {title ? (
        <p className="px-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
          {title}
        </p>
      ) : null}
      <div className="overflow-hidden rounded-[var(--radius-md)] border border-border bg-surface shadow-[inset_0_1px_0_rgb(var(--highlight)/0.5)]">
        {rows.map((row, i) => (
          <RowInner key={i} row={row} last={i === rows.length - 1} />
        ))}
      </div>
    </div>
  );
}

function RowInner({ row, last }: { row: Row; last: boolean }) {
  const content = (
    <>
      {row.icon ? (
        <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-canvas-elevated text-ink">
          {row.icon}
        </span>
      ) : null}
      <span className="flex-1 truncate text-sm font-medium">{row.label}</span>
      {row.value ? <span className="text-sm text-ink-muted">{row.value}</span> : null}
      {row.trailing ??
        (row.href || row.onClick ? (
          <ChevronRight className="h-4 w-4 text-ink-subtle" aria-hidden />
        ) : null)}
    </>
  );

  const classes = cn(
    "flex items-center gap-3 px-4 py-3.5 transition",
    !last && "border-b border-border/70",
    (row.href || row.onClick) && "hover:bg-canvas-elevated",
    row.destructive ? "text-brick-ink" : "text-ink",
  );

  if (row.href) {
    return (
      <Link href={row.href} className={classes}>
        {content}
      </Link>
    );
  }
  if (row.onClick) {
    return (
      <button
        type="button"
        onClick={row.onClick}
        className={cn(classes, "w-full text-left focus-ring")}
      >
        {content}
      </button>
    );
  }
  return <div className={classes}>{content}</div>;
}
