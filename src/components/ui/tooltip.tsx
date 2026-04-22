"use client";

// Tooltip — Apple-style tooltip with soft shadow + squircle radius +
// spring arrival. Used to clarify dense UI (why 1-year is cheaper
// per-month, what "fair use" means, etc.) without cluttering the
// primary layout. Keyboard + touch friendly: opens on focus, closes
// on blur/escape, works on pointer:coarse via tap-to-toggle.
//
// No Radix dependency — rolled with framer-motion + native events so
// the bundle stays small. If we ever need collision detection against
// the viewport edges, swap in @radix-ui/react-tooltip.

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";

type Placement = "top" | "bottom" | "left" | "right";

export function Tooltip({
  children,
  content,
  placement = "top",
  delay = 120,
  className = "",
}: {
  /** Trigger element. Typically an info icon, text span, or badge. */
  children: React.ReactNode;
  /** Tooltip body. Short string ideally, but any ReactNode is fine. */
  content: React.ReactNode;
  placement?: Placement;
  /** Open delay in ms — Apple uses ~150ms. */
  delay?: number;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function scheduleOpen() {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setOpen(true), delay);
  }
  function scheduleClose() {
    if (timerRef.current) clearTimeout(timerRef.current);
    setOpen(false);
  }

  // Close on escape so keyboard users aren't trapped.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const posStyles: Record<Placement, string> = {
    top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
    bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
    left: "right-full top-1/2 -translate-y-1/2 mr-2",
    right: "left-full top-1/2 -translate-y-1/2 ml-2",
  };

  // Initial offset for the spring-in. Matches the placement direction
  // so the tooltip appears to fly in from the trigger.
  const offset: Record<Placement, { x: number; y: number }> = {
    top: { x: 0, y: 6 },
    bottom: { x: 0, y: -6 },
    left: { x: 6, y: 0 },
    right: { x: -6, y: 0 },
  };

  return (
    <span
      ref={wrapRef}
      className={`relative inline-flex ${className}`}
      onMouseEnter={scheduleOpen}
      onMouseLeave={scheduleClose}
      onFocus={scheduleOpen}
      onBlur={scheduleClose}
      // On touch, tap toggles (no hover to rely on).
      onTouchStart={(e) => {
        e.stopPropagation();
        setOpen((v) => !v);
      }}
    >
      {children}
      <AnimatePresence>
        {open ? (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, scale: 0.94, ...offset[placement] }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, ...offset[placement] }}
            transition={{ type: "spring", stiffness: 540, damping: 34, mass: 0.6 }}
            className={`pointer-events-none absolute z-50 w-max max-w-[18rem] rounded-[10px] bg-ink px-2.5 py-1.5 text-xs font-medium leading-tight text-white shadow-[0_12px_32px_-16px_rgb(0_0_0_/_0.35),0_1px_3px_rgba(0,0,0,0.08)] ring-1 ring-white/10 ${posStyles[placement]}`}
          >
            {content}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </span>
  );
}
