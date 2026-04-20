"use client";

// GradientCard — hero panel with Navy Atelier's royal gradient + ambient
// orbs. The mobile app's greeting hero. Use sparingly — one per section.

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Tone = "royal" | "lapis" | "ink" | "basil";

const tones: Record<Tone, string> = {
  royal:
    "bg-[linear-gradient(135deg,rgb(var(--royal))_0%,rgb(var(--lapis))_70%,rgb(var(--sky))_100%)]",
  lapis:
    "bg-[linear-gradient(135deg,rgb(var(--ink))_0%,rgb(var(--royal))_55%,rgb(var(--lapis))_100%)]",
  ink:
    "bg-[linear-gradient(145deg,rgb(var(--ink))_0%,rgb(var(--royal-deep))_100%)]",
  basil:
    "bg-[linear-gradient(135deg,rgb(var(--basil))_0%,rgb(var(--emerald))_100%)]",
};

export function GradientCard({
  children,
  tone = "royal",
  className,
  animate = true,
}: {
  children: React.ReactNode;
  tone?: Tone;
  className?: string;
  animate?: boolean;
}) {
  const classes = cn(
    "relative overflow-hidden rounded-[var(--radius-xl)] p-8 sm:p-10 text-white shadow-[0_40px_120px_-48px_rgb(var(--royal)/0.6)]",
    tones[tone],
    className,
  );

  const inner = (
    <>
      {/* Ambient orbs — give the gradient atmosphere. */}
      <div
        aria-hidden
        className="pointer-events-none absolute -left-16 -top-20 h-64 w-64 rounded-full bg-sky/30 blur-3xl"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -bottom-16 -right-10 h-56 w-56 rounded-full bg-honey/25 blur-3xl"
      />
      <div className="relative z-10">{children}</div>
    </>
  );

  if (!animate) return <div className={classes}>{inner}</div>;

  return (
    <motion.div
      className={classes}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {inner}
    </motion.div>
  );
}
