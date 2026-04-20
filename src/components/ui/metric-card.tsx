"use client";

// MetricCard — KPI tile. Number count-ups on scroll-into-view, mirroring
// the mobile StatTile. Tone drives the change-indicator color + dot.

import { animate, motion, useInView, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useRef } from "react";
import { Card } from "./card";
import { cn } from "@/lib/utils";

type Tone = "positive" | "neutral" | "alert";

const toneDot: Record<Tone, string> = {
  positive: "bg-emerald",
  neutral: "bg-sky",
  alert: "bg-honey",
};

const toneText: Record<Tone, string> = {
  positive: "text-emerald-ink",
  neutral: "text-ink-muted",
  alert: "text-cream-ink",
};

export function MetricCard({
  label,
  value,
  change,
  tone = "neutral",
  delay = 0,
}: {
  label: string;
  value: string;
  change: string;
  tone?: Tone;
  delay?: number;
}) {
  return (
    <Card delay={delay} className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-medium text-ink-muted">{label}</p>
        <span className={cn("h-2.5 w-2.5 rounded-full", toneDot[tone])} aria-hidden />
      </div>
      <AnimatedValue raw={value} />
      <p className={cn("text-sm", toneText[tone])}>{change}</p>
    </Card>
  );
}

// Splits "$12,450" / "48%" / "12.5k" into prefix + number + suffix,
// animates the number from 0 → target. Renders raw string unchanged
// if we can't parse a number.
function AnimatedValue({ raw }: { raw: string }) {
  const match = raw.match(/^([^\d-]*)(-?[\d,]+(?:\.\d+)?)(.*)$/);
  if (!match) return <p className="display-section text-3xl text-ink">{raw}</p>;

  const [, prefix, numStr, suffix] = match;
  const target = Number(numStr.replace(/,/g, ""));

  return (
    <p className="display-section text-3xl text-ink">
      {prefix}
      <CountUpNumber target={target} hasCommas={numStr.includes(",")} />
      {suffix}
    </p>
  );
}

function CountUpNumber({ target, hasCommas }: { target: number; hasCommas: boolean }) {
  const ref = useRef<HTMLSpanElement | null>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const motionValue = useMotionValue(0);
  const rounded = useTransform(motionValue, (latest) => {
    const n = Math.round(latest);
    return hasCommas ? n.toLocaleString() : String(n);
  });

  useEffect(() => {
    if (!inView) return;
    const controls = animate(motionValue, target, {
      duration: 1.1,
      ease: [0.22, 1, 0.36, 1],
    });
    return controls.stop;
  }, [inView, motionValue, target]);

  return (
    <motion.span ref={ref} aria-label={hasCommas ? target.toLocaleString() : String(target)}>
      {rounded}
    </motion.span>
  );
}
