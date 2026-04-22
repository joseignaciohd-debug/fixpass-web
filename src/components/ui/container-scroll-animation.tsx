"use client";

import React, { useEffect, useRef, useState } from "react";
import {
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";

// Tilt-and-reveal scroll container. As the section scrolls through the
// viewport, the framed surface pitches forward (rotateX 20 → 0) and
// settles into the page — reads like opening a premium display case.
// Frame is brushed-silver over a deep navy interior so any centered
// artwork (hammer, photograph, screenshot) reads immediately.

export function ContainerScroll({
  titleComponent,
  children,
}: {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: containerRef });

  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth <= 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  const rotate = useTransform(scrollYProgress, [0, 1], [20, 0]);
  const scale = useTransform(
    scrollYProgress,
    [0, 1],
    isMobile ? [0.72, 0.95] : [1.05, 1],
  );
  const translate = useTransform(scrollYProgress, [0, 1], [0, -100]);

  return (
    <div
      ref={containerRef}
      className="relative flex h-[60rem] items-center justify-center p-2 md:h-[80rem] md:p-20"
    >
      <div
        className="relative w-full py-10 md:py-40"
        style={{ perspective: "1200px" }}
      >
        <Header translate={translate}>{titleComponent}</Header>
        <Card rotate={rotate} scale={scale}>
          {children}
        </Card>
      </div>
    </div>
  );
}

function Header({
  translate,
  children,
}: {
  translate: MotionValue<number>;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      style={{ translateY: translate }}
      className="mx-auto max-w-5xl text-center"
    >
      {children}
    </motion.div>
  );
}

function Card({
  rotate,
  scale,
  children,
}: {
  rotate: MotionValue<number>;
  scale: MotionValue<number>;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      style={{
        rotateX: rotate,
        scale,
        // Layered navy-tinted drop shadow — cheaper than a stacked
        // box-shadow list once gpu-composited, and keeps the tone
        // consistent with surface-dark elsewhere on the site.
        boxShadow:
          "0 12px 32px -8px rgb(11 27 58 / 0.35), 0 48px 96px -32px rgb(11 27 58 / 0.45), 0 120px 140px -60px rgb(31 79 209 / 0.25)",
      }}
      // Asymmetric radii (xl top-left/bottom-right, 2xl elsewhere) —
      // matches the site's "diverse shapes, not machine-stamped" rule.
      className="relative mx-auto -mt-12 h-[30rem] w-full max-w-5xl overflow-hidden rounded-tl-[var(--radius-xl)] rounded-tr-[var(--radius-2xl)] rounded-br-[var(--radius-xl)] rounded-bl-[var(--radius-2xl)] border border-border-strong/70 p-2 md:h-[40rem] md:p-3"
    >
      {/* Silver bezel — a thin gradient ring sitting just inside the
          outer border. Reads as brushed metal under the navy. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-[inherit]"
        style={{
          background:
            "linear-gradient(145deg, rgb(255 255 255 / 0.9) 0%, rgb(198 206 222 / 0.4) 35%, rgb(11 27 58 / 0.05) 55%, rgb(196 206 222 / 0.5) 100%)",
          padding: "1px",
          WebkitMask:
            "linear-gradient(#000, #000) content-box, linear-gradient(#000, #000)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />
      <div
        className="surface-dark relative h-full w-full overflow-hidden rounded-tl-[calc(var(--radius-xl)-4px)] rounded-tr-[calc(var(--radius-2xl)-4px)] rounded-br-[calc(var(--radius-xl)-4px)] rounded-bl-[calc(var(--radius-2xl)-4px)] md:p-6"
      >
        {children}
      </div>
    </motion.div>
  );
}
