"use client";

// Button — pill-shaped primary UI element.
// ------------------------------------------------------------
// 6 variants mapped to the Navy-Atelier palette; acts as <Link>
// when `href` is set, <button> otherwise. Form submit buttons
// accept `name` + `value` for multi-action forms.

import Link from "next/link";
import { forwardRef } from "react";
import { cn } from "@/lib/utils";

export type ButtonVariant =
  | "primary"      // royal → lapis → sky gradient, white text
  | "secondary"    // paper surface, ink text, subtle border
  | "ghost"        // text-only, ink
  | "outline"      // bordered, transparent
  | "inverse"     // white on ink (for dark hero sections)
  | "destructive"; // brick, for delete / cancel danger
export type ButtonSize = "sm" | "md" | "lg";

type CommonProps = {
  children: React.ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  className?: string;
  iconLeft?: React.ReactNode;
  iconRight?: React.ReactNode;
  fullWidth?: boolean;
};

type AnchorProps = CommonProps & {
  href: string;
  type?: never;
  onClick?: never;
  disabled?: never;
  name?: never;
  value?: never;
};

type ButtonElProps = CommonProps & {
  href?: undefined;
  type?: "button" | "submit" | "reset";
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
  disabled?: boolean;
  name?: string;
  value?: string;
};

type ButtonProps = AnchorProps | ButtonElProps;

const variants: Record<ButtonVariant, string> = {
  primary:
    "text-white bg-gradient-to-br from-royal via-lapis to-sky " +
    "shadow-[0_18px_45px_-18px_rgb(var(--royal)/0.5)] " +
    "hover:-translate-y-[2px] hover:shadow-[0_28px_65px_-20px_rgb(var(--royal)/0.55)] " +
    "active:translate-y-0 active:scale-[0.985]",
  secondary:
    "bg-surface text-ink border border-border " +
    "hover:border-border-strong hover:bg-canvas-elevated " +
    "shadow-[inset_0_1px_0_rgb(var(--highlight)/0.5)] " +
    "active:scale-[0.985]",
  outline:
    "bg-transparent text-ink border border-border-strong " +
    "hover:bg-canvas-elevated active:scale-[0.985]",
  ghost:
    "bg-transparent text-ink hover:bg-canvas-elevated active:scale-[0.985]",
  inverse:
    "bg-surface text-ink border border-surface/30 " +
    "hover:bg-canvas-elevated active:scale-[0.985]",
  destructive:
    "bg-brick text-white hover:bg-brick/90 active:scale-[0.985] " +
    "shadow-[0_18px_40px_-20px_rgb(var(--brick)/0.5)]",
};

const sizes: Record<ButtonSize, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-5 py-2.5 text-sm",
  lg: "px-7 py-3.5 text-base",
};

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-semibold " +
  "transition-all duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] focus-ring " +
  "disabled:pointer-events-none disabled:opacity-60 whitespace-nowrap";

export const Button = forwardRef<HTMLAnchorElement | HTMLButtonElement, ButtonProps>(
  function Button(
    { children, variant = "primary", size = "md", className, loading, iconLeft, iconRight, fullWidth, ...rest },
    ref,
  ) {
    const classes = cn(base, variants[variant], sizes[size], fullWidth && "w-full", className);

    const content = (
      <>
        {loading ? <Spinner /> : iconLeft}
        <span className="leading-none">{children}</span>
        {!loading && iconRight}
      </>
    );

    if ("href" in rest && rest.href) {
      return (
        <Link
          ref={ref as React.Ref<HTMLAnchorElement>}
          href={rest.href}
          className={classes}
          aria-busy={loading || undefined}
        >
          {content}
        </Link>
      );
    }

    const { type, onClick, disabled, name, value } = rest as ButtonElProps;
    return (
      <button
        ref={ref as React.Ref<HTMLButtonElement>}
        type={type ?? "button"}
        onClick={onClick}
        disabled={disabled || loading}
        name={name}
        value={value}
        aria-busy={loading || undefined}
        className={classes}
      >
        {content}
      </button>
    );
  },
);

function Spinner() {
  return (
    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" opacity="0.25" />
      <path
        d="M22 12a10 10 0 0 1-10 10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
