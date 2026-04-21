"use client";

// Tiny confetti burst — pure CSS + framer-motion, no canvas. Fires
// once on mount (when the welcome page loads post-checkout). Skipped
// if prefers-reduced-motion.

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

const COLORS = [
  "rgb(var(--royal))",
  "rgb(var(--sky))",
  "rgb(var(--emerald))",
  "rgb(var(--honey))",
  "rgb(var(--lapis))",
];

function pieces(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    color: COLORS[i % COLORS.length],
    left: Math.random() * 100,
    delay: Math.random() * 0.3,
    rotate: Math.random() * 720 - 360,
    duration: 1.8 + Math.random() * 1.2,
  }));
}

export function WelcomeConfetti() {
  const [items, setItems] = useState<ReturnType<typeof pieces>>([]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    setItems(pieces(36));
    const t = setTimeout(() => setItems([]), 3500);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[90] overflow-hidden">
      <AnimatePresence>
        {items.map((p) => (
          <motion.span
            key={p.id}
            initial={{ top: "-5%", opacity: 0, rotate: 0 }}
            animate={{ top: "110%", opacity: [0, 1, 1, 0], rotate: p.rotate }}
            exit={{ opacity: 0 }}
            transition={{ delay: p.delay, duration: p.duration, ease: [0.22, 1, 0.36, 1] }}
            className="absolute block h-2.5 w-2.5 rounded-[2px]"
            style={{ left: `${p.left}%`, background: p.color }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
