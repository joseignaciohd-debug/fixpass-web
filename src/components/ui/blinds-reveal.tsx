"use client";

// BlindsReveal — horizontal-slat reveal inspired by vintage Venetian
// blinds opening. Each slat is a row of the underlying content masked
// by an opaque div; staggered transforms reveal the text one slat at a
// time. Matches the editorial mood of Fraunces display headlines and
// keeps the brand voice from feeling mechanical.
//
// Respects prefers-reduced-motion: skips the animation and shows the
// content immediately when the user has reduced motion set.

import { motion, useReducedMotion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Props = {
  children: React.ReactNode;
  /** Number of horizontal slats. 6 gives a nice textured reveal for 1-line hero headlines; 3–4 works for subtitles. */
  slats?: number;
  /** Delay before the animation starts, in seconds. */
  delay?: number;
  /** Per-slat delay in seconds — higher values stretch the animation. */
  stagger?: number;
  /** Additional Tailwind classes on the outer wrapper. */
  className?: string;
  /**
   * Animation trigger. `onMount` fires once per hydration (great for
   * above-the-fold heroes). `onView` uses IntersectionObserver so a
   * reveal lower on the page fires when it scrolls into view.
   */
  trigger?: "onMount" | "onView";
  /**
   * Slat color — must match the background the text sits on so the
   * mask is invisible. Defaults to `--canvas` (site background).
   * Override on dark surfaces. Provide any valid CSS color string.
   */
  slatColor?: string;
};

export function BlindsReveal({
  children,
  slats = 6,
  delay = 0.05,
  stagger = 0.045,
  className = "",
  trigger = "onMount",
  slatColor = "rgb(var(--canvas))",
}: Props) {
  const reduced = useReducedMotion();
  const wrapRef = useRef<HTMLSpanElement>(null);
  const [play, setPlay] = useState(trigger === "onMount");

  useEffect(() => {
    if (trigger !== "onView" || !wrapRef.current) return;
    const el = wrapRef.current;
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setPlay(true);
          io.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [trigger]);

  // Reduced-motion users see the content instantly — no masking.
  if (reduced) {
    return <span className={`relative inline-block ${className}`}>{children}</span>;
  }

  return (
    <span ref={wrapRef} className={`relative inline-block overflow-hidden ${className}`}>
      {/* The visible content. Lifted into place on mount. */}
      <motion.span
        className="inline-block"
        initial={{ y: "0.12em" }}
        animate={play ? { y: 0 } : undefined}
        transition={{
          duration: slats * stagger + 0.3,
          ease: [0.22, 1, 0.36, 1],
          delay,
        }}
      >
        {children}
      </motion.span>

      {/* The slat stack, absolutely positioned on top, each slat slides
          up-and-away with a stagger. Pointer-events-none so hover/tap
          hit the underlying text once they finish animating. */}
      <span aria-hidden className="pointer-events-none absolute inset-0">
        {Array.from({ length: slats }).map((_, i) => (
          <motion.span
            key={i}
            className="absolute inset-x-0"
            style={{
              top: `${(i / slats) * 100}%`,
              height: `${100 / slats + 0.5}%`, // +0.5 prevents sub-pixel gaps
              backgroundColor: slatColor,
            }}
            initial={{ y: 0, opacity: 1 }}
            animate={
              play
                ? { y: "-110%", opacity: 0 }
                : { y: 0, opacity: 1 }
            }
            transition={{
              duration: 0.55,
              ease: [0.22, 1, 0.36, 1],
              delay: delay + i * stagger,
            }}
          />
        ))}
      </span>
    </span>
  );
}
