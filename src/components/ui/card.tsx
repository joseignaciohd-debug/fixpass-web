"use client";

// Card — the workhorse surface. Seven variants mirror the mobile
// app's Card primitive. Fades in on scroll-into-view by default;
// disable with animate={false} for nested cards where the entrance
// motion would stack weirdly.

import { motion } from "framer-motion";
import type { HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type CardVariant = "default" | "muted" | "dark" | "royal" | "glass" | "flat" | "ivory";

type CardProps = {
  children: React.ReactNode;
  className?: string;
  variant?: CardVariant;
  as?: "div" | "article" | "section" | "aside";
  animate?: boolean;
  delay?: number;
} & Omit<HTMLMotionProps<"div">, "variants">;

const variantClasses: Record<CardVariant, string> = {
  default: "surface-card text-ink",
  muted: "surface-muted text-ink",
  dark: "surface-dark",
  royal: "surface-royal",
  glass: "surface-glass text-ink",
  flat: "bg-surface border border-border text-ink",
  ivory: "bg-canvas-elevated border border-border text-ink",
};

export function Card({
  children,
  className,
  variant = "default",
  as = "div",
  animate = true,
  delay = 0,
  ...rest
}: CardProps) {
  const classes = cn(
    "relative overflow-hidden rounded-[var(--radius-lg)] p-6 sm:p-8 transition-shadow duration-300",
    variantClasses[variant],
    className,
  );

  if (!animate) {
    const Tag = as;
    return <Tag className={classes}>{children}</Tag>;
  }

  const MotionTag =
    as === "article"
      ? motion.article
      : as === "section"
      ? motion.section
      : as === "aside"
      ? motion.aside
      : motion.div;

  return (
    <MotionTag
      className={classes}
      initial={{ opacity: 0, y: 14 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </MotionTag>
  );
}
