"use client";

// Reveal — drop-in fade-in-up wrapper. Pure convenience over writing
// the same framer-motion props on every section. Honors reduced motion
// automatically via the CSS @media rule in globals.css.

import { motion } from "framer-motion";
import type { CSSProperties, ReactNode } from "react";

type Direction = "up" | "down" | "left" | "right";

const offsets: Record<Direction, { x?: number; y?: number }> = {
  up: { y: 18 },
  down: { y: -18 },
  left: { x: 18 },
  right: { x: -18 },
};

type RevealProps = {
  children: ReactNode;
  direction?: Direction;
  delay?: number;
  className?: string;
  style?: CSSProperties;
  as?: "div" | "section" | "article" | "li";
};

export function Reveal({
  children,
  direction = "up",
  delay = 0,
  className,
  style,
  as = "div",
}: RevealProps) {
  const { x = 0, y = 0 } = offsets[direction];
  const initial = { opacity: 0, x, y };
  const whileInView = { opacity: 1, x: 0, y: 0 };
  const viewport = { once: true, margin: "-40px" };
  const transition = { duration: 0.55, delay, ease: [0.22, 1, 0.36, 1] as const };

  // framer-motion's generic HTML tags need explicit branches — unifying
  // via `as` prop produces union-type conflicts.
  if (as === "section") {
    return (
      <motion.section
        className={className}
        style={style}
        initial={initial}
        whileInView={whileInView}
        viewport={viewport}
        transition={transition}
      >
        {children}
      </motion.section>
    );
  }
  if (as === "article") {
    return (
      <motion.article
        className={className}
        style={style}
        initial={initial}
        whileInView={whileInView}
        viewport={viewport}
        transition={transition}
      >
        {children}
      </motion.article>
    );
  }
  if (as === "li") {
    return (
      <motion.li
        className={className}
        style={style}
        initial={initial}
        whileInView={whileInView}
        viewport={viewport}
        transition={transition}
      >
        {children}
      </motion.li>
    );
  }
  return (
    <motion.div
      className={className}
      style={style}
      initial={initial}
      whileInView={whileInView}
      viewport={viewport}
      transition={transition}
    >
      {children}
    </motion.div>
  );
}
