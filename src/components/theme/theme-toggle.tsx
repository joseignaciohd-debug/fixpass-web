"use client";

// Three-state cycling button for theme: system / light / dark.
// The icon reflects the current `mode` (not resolved theme) so the
// user can see whether they're following the OS or overriding.

import { Monitor, Moon, Sun } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

export function ThemeToggle({ className = "" }: { className?: string }) {
  const { mode, toggle } = useTheme();
  const label =
    mode === "system" ? "Theme: follow system" : mode === "light" ? "Theme: light" : "Theme: dark";
  const Icon = mode === "system" ? Monitor : mode === "light" ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={label}
      title={label}
      className={cn(
        "focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface/80 text-ink-muted transition",
        "hover:text-ink hover:border-border-strong hover:bg-surface",
        className,
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );
}
