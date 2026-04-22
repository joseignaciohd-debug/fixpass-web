"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";

// Full-viewport hero that reads like a live architectural drawing of
// the Fixpass house. Sky-blue linework on deep navy, staggered draw-in
// cadence the way a draftsman would actually lay down the sheet:
//   grid paper → ground line → framing → envelope → interior F-walls
//   → doors/windows → dimensions → title block + detail callouts.
//
// Interactivity layer on top:
//   - three parallax layers (grid, drawing, callouts) shift against
//     each other on mouse move — feels like a 3D drafting table
//   - subtle paper-rotation on mouseX so the sheet "lifts" as you look
//     across it
//   - drafting crosshair cursor with live coord readout
//   - hover reveals on the roof, door and foundation (brighter stroke +
//     floating label) so the drawing rewards inspection
// Everything collapses to the finished drawing with no motion when
// prefers-reduced-motion is on.
//
// The house itself references the Fixpass mark: pentagon envelope with
// a double-chevron roof (outer peak + inner chevron), and interior
// load-bearing walls traced in the shape of the F inside the logo.

export type BlueprintHeroProps = {
  trustBadge?: { text: string; dotTone?: "emerald" | "sky" | "honey" };
  headline: { line1: string; line2: string };
  subtitle: string;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string };
};

// ---- drawing rhythm ------------------------------------------------
const EASE = [0.22, 1, 0.36, 1] as const;
const DRAW = {
  grid:     { delay: 0.00, dur: 1.40 },
  gridCol:  { delay: 0.30, dur: 0.80 },
  ground:   { delay: 0.40, dur: 0.90 },
  envelope: { delay: 0.80, dur: 1.70 },
  roofIn:   { delay: 1.60, dur: 1.00 },
  floors:   { delay: 1.90, dur: 0.90 },
  fWalls:   { delay: 2.20, dur: 1.10 },
  door:     { delay: 2.80, dur: 0.60 },
  windows:  { delay: 2.95, dur: 0.60 },
  details:  { delay: 3.15, dur: 0.80 },
  dims:     { delay: 3.40, dur: 0.70 },
  title:    { delay: 3.60, dur: 0.70 },
};

export function BlueprintHero({
  trustBadge,
  headline,
  subtitle,
  primaryCta,
  secondaryCta,
}: BlueprintHeroProps) {
  const reduced = useReducedMotion() ?? false;
  const sectionRef = useRef<HTMLElement>(null);

  // Raw cursor position in normalized [-0.5, 0.5] range. Spring-smoothed
  // motion values feed the parallax layers so the drawing reacts like
  // a weighted piece of paper, not jitter-tracked to every pixel.
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const smx = useSpring(mx, { stiffness: 60, damping: 16, mass: 0.8 });
  const smy = useSpring(my, { stiffness: 60, damping: 16, mass: 0.8 });

  // Pre-compute feet-inch readout in the event handler so the cursor
  // component never has to read refs during render (React 19 disallows
  // that). Stored alongside pixel position for a single state update.
  const [cursor, setCursor] = useState<{
    x: number;
    y: number;
    feetX: number;
    feetY: number;
    on: boolean;
  }>({ x: 0, y: 0, feetX: 0, feetY: 0, on: false });

  useEffect(() => {
    if (reduced) return;
    const el = sectionRef.current;
    if (!el) return;
    const onMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const localX = e.clientX - rect.left;
      const localY = e.clientY - rect.top;
      const nx = localX / rect.width - 0.5;
      const ny = localY / rect.height - 0.5;
      mx.set(nx);
      my.set(ny);
      setCursor({
        x: localX,
        y: localY,
        feetX: (localX - rect.width / 2) / 14,
        feetY: (rect.height / 2 - localY) / 12,
        on: true,
      });
    };
    const onLeave = () => setCursor((c) => ({ ...c, on: false }));
    el.addEventListener("mousemove", onMove);
    el.addEventListener("mouseleave", onLeave);
    return () => {
      el.removeEventListener("mousemove", onMove);
      el.removeEventListener("mouseleave", onLeave);
    };
  }, [reduced, mx, my]);

  // Parallax shift amounts — grid (far) < drawing (mid) < callouts (near)
  const gridX = useTransform(smx, (v) => v * -10);
  const gridY = useTransform(smy, (v) => v * -6);
  const drawX = useTransform(smx, (v) => v * -22);
  const drawY = useTransform(smy, (v) => v * -14);
  const callX = useTransform(smx, (v) => v * -42);
  const callY = useTransform(smy, (v) => v * -26);
  // Paper tilt — tiny rotation on mouseX so the sheet "lifts" as eye
  // sweeps across. Clamped at ±1.6deg so it stays subliminal.
  const paperRot = useTransform(smx, (v) => v * 2.6);

  const dotColor =
    trustBadge?.dotTone === "honey"
      ? "bg-honey"
      : trustBadge?.dotTone === "emerald"
        ? "bg-emerald"
        : "bg-sky";

  return (
    <section
      ref={sectionRef}
      className="relative h-[100svh] min-h-[680px] w-full overflow-hidden bg-[rgb(6_11_27)]"
    >
      {/* Paper sits on a gently rotating wrapper so the whole drawing
          tilts as mouse sweeps across. All three blueprint layers then
          shift within it, each by a different amount, for 3D depth. */}
      <motion.div
        style={{ rotate: reduced ? 0 : paperRot }}
        className="absolute inset-0"
      >
        <BlueprintBackdrop
          reduced={reduced}
          gridX={gridX}
          gridY={gridY}
          drawX={drawX}
          drawY={drawY}
          callX={callX}
          callY={callY}
        />
      </motion.div>

      {/* Drafting crosshair cursor — follows mouse, snaps to a 12px grid
          so the motion feels like a CAD tool not a paint cursor. */}
      {!reduced && (
        <DraftingCursor
          x={cursor.x}
          y={cursor.y}
          feetX={cursor.feetX}
          feetY={cursor.feetY}
          on={cursor.on}
        />
      )}

      {/* Center vignette so the headline doesn't fight the linework. */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-[5]"
        style={{
          background:
            "radial-gradient(62% 50% at 50% 48%, rgb(6 11 27 / 0.55) 0%, rgb(6 11 27 / 0) 72%)",
        }}
      />

      <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center sm:px-8">
        {trustBadge && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: -14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="mb-9 inline-flex items-center gap-2.5 rounded-full border border-white/15 bg-white/[0.06] px-5 py-2.5 text-[11px] font-semibold uppercase tracking-[0.22em] text-white/85 backdrop-blur-md"
          >
            <span className={`h-1.5 w-1.5 rounded-full ${dotColor}`} />
            {trustBadge.text}
          </motion.div>
        )}

        <h1 className="display-hero max-w-5xl text-[3.5rem] leading-[0.95] sm:text-[5rem] md:text-[6.5rem] lg:text-[7.5rem]">
          <motion.span
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.15 }}
            className="block"
            style={{ color: "#ffffff" }}
          >
            {headline.line1}
          </motion.span>
          <motion.span
            initial={reduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.35 }}
            className="block"
            // Royal blue — Fixpass's primary brand blue. Soft glow
            // gives it enough presence to read against the dark navy.
            style={{
              color: "rgb(var(--royal))",
              textShadow:
                "0 0 28px rgb(var(--royal) / 0.55), 0 0 60px rgb(var(--royal) / 0.28)",
            }}
          >
            {headline.line2}
          </motion.span>
        </h1>

        <motion.p
          initial={reduced ? false : { opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: EASE, delay: 0.55 }}
          className="mt-7 max-w-2xl font-[family-name:var(--font-display)] text-lg font-medium leading-8 tracking-[0.005em] text-white/80 sm:text-xl md:text-[1.4rem] md:leading-[1.5]"
        >
          {subtitle}
        </motion.p>

        {(primaryCta || secondaryCta) && (
          <motion.div
            initial={reduced ? false : { opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: EASE, delay: 0.75 }}
            className="mt-10 flex flex-col items-center gap-3 sm:flex-row"
          >
            {primaryCta && (
              <Button
                href={primaryCta.href}
                variant="inverse"
                size="lg"
                iconRight={<ArrowRight size={18} />}
              >
                {primaryCta.label}
              </Button>
            )}
            {secondaryCta && (
              <Link
                href={secondaryCta.href}
                className="focus-ring inline-flex items-center justify-center rounded-full border border-white/30 px-7 py-3.5 text-base font-semibold text-white transition hover:border-white/60 hover:bg-white/10"
              >
                {secondaryCta.label}
              </Link>
            )}
          </motion.div>
        )}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-8 z-10 flex justify-center">
        <div className="h-8 w-5 rounded-full border border-white/25">
          <motion.div
            className="mx-auto mt-1.5 h-1.5 w-1 rounded-full bg-white/70"
            animate={
              reduced
                ? { opacity: 0.6 }
                : { y: [0, 10, 0], opacity: [0.9, 0.2, 0.9] }
            }
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>
    </section>
  );
}

// ---- drafting crosshair cursor -------------------------------------
// CAD-style tracker that follows the mouse, snapped to a coarse grid.
// The coordinate readout converts pixel offsets into feet-inches at the
// hero's nominal scale, so the HUD feels diegetic to the drawing.
function DraftingCursor({
  x,
  y,
  feetX,
  feetY,
  on,
}: {
  x: number;
  y: number;
  feetX: number;
  feetY: number;
  on: boolean;
}) {
  const snap = 12;
  const sx = Math.round(x / snap) * snap;
  const sy = Math.round(y / snap) * snap;

  const format = (f: number) => {
    const sign = f < 0 ? "-" : "";
    const abs = Math.abs(f);
    const ft = Math.floor(abs);
    const inch = Math.round((abs - ft) * 12);
    return `${sign}${ft}'-${String(inch).padStart(2, "0")}"`;
  };

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[6]"
      aria-hidden
      style={{ opacity: on ? 1 : 0, transition: "opacity 180ms" }}
    >
      {/* Thin guide lines spanning the viewport through cursor */}
      <div
        className="absolute left-0 right-0 h-px"
        style={{
          top: sy,
          background:
            "linear-gradient(to right, transparent 0%, rgb(var(--sky) / 0.25) 15%, rgb(var(--sky) / 0.35) 50%, rgb(var(--sky) / 0.25) 85%, transparent 100%)",
        }}
      />
      <div
        className="absolute top-0 bottom-0 w-px"
        style={{
          left: sx,
          background:
            "linear-gradient(to bottom, transparent 0%, rgb(var(--sky) / 0.25) 15%, rgb(var(--sky) / 0.35) 50%, rgb(var(--sky) / 0.25) 85%, transparent 100%)",
        }}
      />
      {/* Crosshair marker */}
      <div
        className="absolute flex h-5 w-5 items-center justify-center"
        style={{ left: sx - 10, top: sy - 10 }}
      >
        <div className="absolute h-full w-px bg-[rgb(var(--sky))] opacity-80" />
        <div className="absolute h-px w-full bg-[rgb(var(--sky))] opacity-80" />
        <div className="h-1.5 w-1.5 rounded-full border border-[rgb(var(--sky))] bg-[rgb(6_11_27)]" />
      </div>
      {/* Coord readout floating just off the crosshair */}
      <div
        className="absolute rounded-sm border border-[rgb(var(--sky)/0.3)] bg-[rgb(6_11_27)/0.7] px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-[rgb(var(--sky)/0.85)] backdrop-blur-[2px]"
        style={{
          left: sx + 18,
          top: sy + 18,
          fontFamily: "var(--font-mono)",
        }}
      >
        <span className="mr-3">X {format(feetX)}</span>
        <span>Y {format(feetY)}</span>
      </div>
    </div>
  );
}

// ---- backdrop ------------------------------------------------------
type MV = MotionValue<number>;

function BlueprintBackdrop({
  reduced,
  gridX,
  gridY,
  drawX,
  drawY,
  callX,
  callY,
}: {
  reduced: boolean;
  gridX: MV;
  gridY: MV;
  drawX: MV;
  drawY: MV;
  callX: MV;
  callY: MV;
}) {
  const drawProps = (d: { delay: number; dur: number }, max = 1) =>
    reduced
      ? {
          initial: { pathLength: max, opacity: 1 },
          animate: { pathLength: max, opacity: 1 },
          transition: { duration: 0 },
        }
      : {
          initial: { pathLength: 0, opacity: 0 },
          animate: { pathLength: max, opacity: 1 },
          transition: { delay: d.delay, duration: d.dur, ease: EASE },
        };

  const fadeProps = (d: { delay: number; dur: number }, opacity = 1) =>
    reduced
      ? { initial: { opacity }, animate: { opacity }, transition: { duration: 0 } }
      : {
          initial: { opacity: 0 },
          animate: { opacity },
          transition: { delay: d.delay, duration: d.dur, ease: EASE },
        };

  const stroke = "rgb(var(--sky))";
  const gridTransform = useMotionTemplate`translate3d(${gridX}px, ${gridY}px, 0)`;
  const drawTransform = useMotionTemplate`translate3d(${drawX}px, ${drawY}px, 0)`;
  const callTransform = useMotionTemplate`translate3d(${callX}px, ${callY}px, 0)`;

  return (
    <>
      {/* LAYER 1 — graph-paper grid + column grid (far, parallax slowest) */}
      <motion.svg
        aria-hidden
        viewBox="0 0 1800 1000"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        style={{ transform: gridTransform, willChange: "transform" }}
      >
        <defs>
          <pattern id="fp-bp-grid-min" x="0" y="0" width="36" height="36" patternUnits="userSpaceOnUse">
            <path d="M 36 0 L 0 0 L 0 36" fill="none" stroke={stroke} strokeOpacity="0.065" strokeWidth="1" />
          </pattern>
          <pattern id="fp-bp-grid-maj" x="0" y="0" width="216" height="216" patternUnits="userSpaceOnUse">
            <path d="M 216 0 L 0 0 L 0 216" fill="none" stroke={stroke} strokeOpacity="0.14" strokeWidth="1" />
          </pattern>
        </defs>
        <motion.rect width="1800" height="1000" fill="url(#fp-bp-grid-min)" {...fadeProps(DRAW.grid, 1)} />
        <motion.rect width="1800" height="1000" fill="url(#fp-bp-grid-maj)" {...fadeProps(DRAW.grid, 0.9)} />

        {/* Column grid — letter bubbles A-D along top, number bubbles
            1-3 down the left. Draws in right after the grid. */}
        <motion.g {...fadeProps(DRAW.gridCol, 0.8)}>
          {[
            { x: 700, label: "A" },
            { x: 820, label: "B" },
            { x: 980, label: "C" },
            { x: 1100, label: "D" },
          ].map((c) => (
            <g key={c.label}>
              <line x1={c.x} y1="130" x2={c.x} y2="900" stroke={stroke} strokeOpacity="0.18" strokeWidth="1" strokeDasharray="18 4 2 4" />
              <circle cx={c.x} cy="118" r="14" fill="rgb(6 11 27)" stroke={stroke} strokeOpacity="0.6" strokeWidth="1" />
              <text x={c.x} y="122" textAnchor="middle" fill={stroke} fillOpacity="0.75" fontSize="12" style={{ fontFamily: "var(--font-mono)" }}>
                {c.label}
              </text>
            </g>
          ))}
          {[
            { y: 240, label: "1" },
            { y: 480, label: "2" },
            { y: 720, label: "3" },
          ].map((r) => (
            <g key={r.label}>
              <line x1="660" y1={r.y} x2="1150" y2={r.y} stroke={stroke} strokeOpacity="0.14" strokeWidth="1" strokeDasharray="18 4 2 4" />
              <circle cx="648" cy={r.y} r="14" fill="rgb(6 11 27)" stroke={stroke} strokeOpacity="0.6" strokeWidth="1" />
              <text x="648" y={r.y + 4} textAnchor="middle" fill={stroke} fillOpacity="0.75" fontSize="12" style={{ fontFamily: "var(--font-mono)" }}>
                {r.label}
              </text>
            </g>
          ))}
        </motion.g>
      </motion.svg>

      {/* LAYER 2 — main architectural drawing (medium parallax) */}
      <motion.svg
        aria-hidden
        viewBox="0 0 1800 1000"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        style={{ transform: drawTransform, willChange: "transform" }}
      >
        {/* Ground line — heaviest non-structural line. Extends beyond
            the house to anchor the section in landscape. */}
        <motion.line
          x1="40" y1="880" x2="1760" y2="880"
          stroke={stroke} strokeOpacity="0.52" strokeWidth="1.2" strokeLinecap="round"
          {...drawProps(DRAW.ground)}
        />
        {/* Foundation hatch — short diagonal ticks under the ground,
            standard earth-hatching shorthand. */}
        <motion.g {...fadeProps({ delay: DRAW.ground.delay + 0.35, dur: 0.6 }, 0.35)}>
          {Array.from({ length: 36 }, (_, i) => {
            const x = 60 + i * 48;
            return (
              <line
                key={i}
                x1={x} y1="886" x2={x - 10} y2="912"
                stroke={stroke} strokeOpacity="0.55" strokeWidth="1"
              />
            );
          })}
        </motion.g>

        {/* Pentagon envelope — references the Fixpass mark (double-
            pitched roof, square body). One continuous closed path. */}
        <motion.path
          d="M 700 880 L 700 420 L 900 200 L 1100 420 L 1100 880 Z"
          fill="none"
          stroke={stroke}
          strokeOpacity="0.82"
          strokeWidth="1.85"
          strokeLinejoin="miter"
          strokeLinecap="round"
          {...drawProps(DRAW.envelope)}
        />
        {/* Inner roof chevron — echoes the nested chevron inside the
            logo. Draws a beat after the envelope so the house reads
            one-shape-then-detail. */}
        <motion.path
          d="M 700 500 L 900 300 L 1100 500"
          fill="none"
          stroke={stroke}
          strokeOpacity="0.55"
          strokeWidth="1.3"
          {...drawProps(DRAW.roofIn)}
        />

        {/* Floor levels — separators with elevation callouts. */}
        <motion.g {...fadeProps(DRAW.floors, 0.55)}>
          <line x1="700" y1="720" x2="1100" y2="720" stroke={stroke} strokeOpacity="0.55" strokeWidth="1.1" />
          <line x1="700" y1="560" x2="1100" y2="560" stroke={stroke} strokeOpacity="0.45" strokeWidth="1" strokeDasharray="7 5" />
          <line x1="700" y1="420" x2="1100" y2="420" stroke={stroke} strokeOpacity="0.45" strokeWidth="1" strokeDasharray="7 5" />
          {/* Elevation level tags */}
          {[
            { y: 880, label: 'EL ±0\' - 0"' },
            { y: 720, label: 'EL +10\' - 0"' },
            { y: 560, label: 'EL +20\' - 0"' },
            { y: 420, label: 'EL +30\' - 0"' },
          ].map((l) => (
            <g key={l.y}>
              <line x1="1120" y1={l.y} x2="1165" y2={l.y} stroke={stroke} strokeOpacity="0.55" strokeWidth="1" />
              <text x="1172" y={l.y + 4} fill={stroke} fillOpacity="0.7" fontSize="10" letterSpacing="1.5" style={{ fontFamily: "var(--font-mono)" }}>
                {l.label}
              </text>
            </g>
          ))}
        </motion.g>

        {/* F-shaped interior walls — wink to the logo. Vertical load-
            bearing wall left-of-center, two horizontal floor beams
            extending rightward (top arm + middle arm of the F). */}
        <motion.g {...fadeProps(DRAW.fWalls, 1)}>
          <motion.line x1="780" y1="420" x2="780" y2="880" stroke={stroke} strokeOpacity="0.68" strokeWidth="1.5" {...drawProps({ delay: DRAW.fWalls.delay, dur: DRAW.fWalls.dur })} />
          <motion.line x1="780" y1="500" x2="1040" y2="500" stroke={stroke} strokeOpacity="0.62" strokeWidth="1.35" {...drawProps({ delay: DRAW.fWalls.delay + 0.15, dur: DRAW.fWalls.dur - 0.3 })} />
          <motion.line x1="780" y1="650" x2="960" y2="650" stroke={stroke} strokeOpacity="0.62" strokeWidth="1.35" {...drawProps({ delay: DRAW.fWalls.delay + 0.3, dur: DRAW.fWalls.dur - 0.4 })} />
          {/* End cap dot on the middle arm — matches the logo's F
              detail where the middle stroke terminates. */}
          <motion.circle cx="966" cy="650" r="4" fill={stroke} {...fadeProps({ delay: DRAW.fWalls.delay + 0.7, dur: 0.4 }, 0.85)} />
        </motion.g>

        {/* Front door + swing arc (plan-view convention — reads as a
            drafting detail even though the rest is a section). */}
        <motion.g {...fadeProps(DRAW.door, 1)}>
          <motion.path d="M 862 880 L 862 760 L 930 760 L 930 880" fill="none" stroke={stroke} strokeOpacity="0.78" strokeWidth="1.45" {...drawProps(DRAW.door)} />
          <motion.path d="M 862 760 A 68 68 0 0 1 930 828" fill="none" stroke={stroke} strokeOpacity="0.45" strokeWidth="1" strokeDasharray="3 3" {...drawProps({ delay: DRAW.door.delay + 0.3, dur: 0.5 })} />
          <motion.circle cx="920" cy="822" r="2.6" fill={stroke} {...fadeProps({ delay: DRAW.door.delay + 0.45, dur: 0.3 }, 0.9)} />
        </motion.g>

        {/* Windows — ground floor (below door level), mid floor
            (between 2nd level and roof shoulder). Four on first, two
            on second, two clerestory in the gable. */}
        <motion.g {...fadeProps(DRAW.windows, 1)}>
          {/* Ground floor — left of F-wall */}
          <motion.path d="M 718 840 L 718 770 L 762 770 L 762 840 M 740 840 L 740 770 M 718 805 L 762 805"
            fill="none" stroke={stroke} strokeOpacity="0.62" strokeWidth="1.15" {...drawProps(DRAW.windows)} />
          {/* Ground floor — right of door */}
          <motion.path d="M 1020 840 L 1020 770 L 1064 770 L 1064 840 M 1042 840 L 1042 770 M 1020 805 L 1064 805"
            fill="none" stroke={stroke} strokeOpacity="0.62" strokeWidth="1.15" {...drawProps(DRAW.windows)} />
          {/* Second floor — small paired sashes */}
          <motion.path d="M 720 680 L 720 620 L 762 620 L 762 680 Z M 1020 680 L 1020 620 L 1062 620 L 1062 680 Z"
            fill="none" stroke={stroke} strokeOpacity="0.54" strokeWidth="1.05" {...drawProps(DRAW.windows)} />
          {/* Clerestory — small circle-topped gable window */}
          <motion.circle cx="900" cy="400" r="22" fill="none" stroke={stroke} strokeOpacity="0.55" strokeWidth="1.1" {...fadeProps({ delay: DRAW.windows.delay + 0.1, dur: 0.5 }, 0.55)} />
          <motion.line x1="878" y1="400" x2="922" y2="400" stroke={stroke} strokeOpacity="0.55" strokeWidth="1" {...fadeProps({ delay: DRAW.windows.delay + 0.25, dur: 0.3 }, 0.55)} />
          <motion.line x1="900" y1="378" x2="900" y2="422" stroke={stroke} strokeOpacity="0.55" strokeWidth="1" {...fadeProps({ delay: DRAW.windows.delay + 0.25, dur: 0.3 }, 0.55)} />
        </motion.g>

        {/* Structural + MEP details — stud column marks, roof rafters,
            plumbing stack, chimney flue. Builds out the "complex
            blueprint" density the user asked for. */}
        <motion.g {...fadeProps(DRAW.details, 0.5)}>
          {/* Roof rafters — short parallel ticks up the inner roof slope */}
          {Array.from({ length: 9 }, (_, i) => {
            const t = (i + 1) / 10;
            const x1 = 700 + t * 200; const y1 = 420 - t * 220;
            const x2 = x1 + 16; const y2 = y1 + 8;
            return <line key={`rl${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeOpacity="0.45" strokeWidth="0.9" />;
          })}
          {Array.from({ length: 9 }, (_, i) => {
            const t = (i + 1) / 10;
            const x1 = 1100 - t * 200; const y1 = 420 - t * 220;
            const x2 = x1 - 16; const y2 = y1 + 8;
            return <line key={`rr${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeOpacity="0.45" strokeWidth="0.9" />;
          })}
          {/* Stud columns — ticks along each wall, ground floor */}
          {Array.from({ length: 5 }, (_, i) => {
            const y = 730 + i * 30;
            return (
              <g key={`st${i}`}>
                <line x1="694" y1={y} x2="706" y2={y} stroke={stroke} strokeOpacity="0.4" strokeWidth="0.8" />
                <line x1="1094" y1={y} x2="1106" y2={y} stroke={stroke} strokeOpacity="0.4" strokeWidth="0.8" />
              </g>
            );
          })}
          {/* Plumbing stack — vertical dashed line rising through F-wall */}
          <line x1="810" y1="420" x2="810" y2="880" stroke={stroke} strokeOpacity="0.38" strokeWidth="1" strokeDasharray="4 4" />
          <text x="816" y="440" fill={stroke} fillOpacity="0.55" fontSize="9" letterSpacing="1.5" style={{ fontFamily: "var(--font-mono)" }}>
            STK 3&quot; PVC
          </text>
          {/* Chimney flue + cap */}
          <path d="M 956 400 L 956 270 L 998 270 L 998 436" fill="none" stroke={stroke} strokeOpacity="0.58" strokeWidth="1.2" />
          <line x1="950" y1="260" x2="1004" y2="260" stroke={stroke} strokeOpacity="0.6" strokeWidth="1.3" />
          <text x="1010" y="266" fill={stroke} fillOpacity="0.55" fontSize="9" letterSpacing="1.5" style={{ fontFamily: "var(--font-mono)" }}>
            FLUE
          </text>
        </motion.g>

        {/* Dimension system — overall height on right, overall width
            top, floor-to-floor on the far left. Architect ticks + feet-
            inch labels. */}
        <motion.g {...fadeProps(DRAW.dims, 0.78)}>
          {/* TOP — overall width */}
          <line x1="700" y1="170" x2="700" y2="208" stroke={stroke} strokeOpacity="0.75" strokeWidth="1" />
          <line x1="1100" y1="170" x2="1100" y2="208" stroke={stroke} strokeOpacity="0.75" strokeWidth="1" />
          <line x1="700" y1="190" x2="860" y2="190" stroke={stroke} strokeOpacity="0.75" strokeWidth="1" />
          <line x1="940" y1="190" x2="1100" y2="190" stroke={stroke} strokeOpacity="0.75" strokeWidth="1" />
          {/* architect tick marks */}
          {[700, 1100].map((cx) => (
            <line key={cx} x1={cx - 5} y1="197" x2={cx + 5} y2="183" stroke={stroke} strokeOpacity="0.8" strokeWidth="1" />
          ))}
          <text x="900" y="195" textAnchor="middle" fill={stroke} fillOpacity="0.88" fontSize="13" letterSpacing="2" style={{ fontFamily: "var(--font-mono)" }}>
            40&apos; - 0&quot;
          </text>

          {/* RIGHT — overall height */}
          <line x1="1180" y1="200" x2="1220" y2="200" stroke={stroke} strokeOpacity="0.7" strokeWidth="1" />
          <line x1="1180" y1="880" x2="1220" y2="880" stroke={stroke} strokeOpacity="0.7" strokeWidth="1" />
          <line x1="1200" y1="200" x2="1200" y2="512" stroke={stroke} strokeOpacity="0.7" strokeWidth="1" />
          <line x1="1200" y1="568" x2="1200" y2="880" stroke={stroke} strokeOpacity="0.7" strokeWidth="1" />
          {[200, 880].map((cy) => (
            <line key={cy} x1="1193" y1={cy + 5} x2="1207" y2={cy - 5} stroke={stroke} strokeOpacity="0.75" strokeWidth="1" />
          ))}
          <text x="1200" y="544" textAnchor="middle" fill={stroke} fillOpacity="0.88" fontSize="13" letterSpacing="2" style={{ fontFamily: "var(--font-mono)" }} transform="rotate(-90 1200 544)">
            34&apos; - 0&quot;
          </text>

          {/* LEFT — floor-to-floor stack */}
          {[
            { y1: 720, y2: 880, label: '10\' - 0"' },
            { y1: 560, y2: 720, label: '10\' - 0"' },
            { y1: 420, y2: 560, label: '9\' - 0"' },
          ].map((d, i) => (
            <g key={i}>
              <line x1="620" y1={d.y1} x2="660" y2={d.y1} stroke={stroke} strokeOpacity="0.55" strokeWidth="1" />
              <line x1="640" y1={d.y1} x2="640" y2={(d.y1 + d.y2) / 2 - 12} stroke={stroke} strokeOpacity="0.55" strokeWidth="1" />
              <line x1="640" y1={(d.y1 + d.y2) / 2 + 12} x2="640" y2={d.y2} stroke={stroke} strokeOpacity="0.55" strokeWidth="1" />
              <text x="640" y={(d.y1 + d.y2) / 2 + 4} textAnchor="middle" fill={stroke} fillOpacity="0.72" fontSize="10.5" letterSpacing="1.5" style={{ fontFamily: "var(--font-mono)" }}>
                {d.label}
              </text>
            </g>
          ))}
        </motion.g>

        {/* Section cut marker — circle with arrow + A-A label, reading
            order "this drawing is the A-A cross section". */}
        <motion.g {...fadeProps(DRAW.title, 0.7)}>
          <circle cx="540" cy="920" r="18" fill="rgb(6 11 27)" stroke={stroke} strokeOpacity="0.7" strokeWidth="1.1" />
          <text x="540" y="916" textAnchor="middle" fill={stroke} fillOpacity="0.85" fontSize="11" letterSpacing="1.5" style={{ fontFamily: "var(--font-mono)" }}>
            A
          </text>
          <text x="540" y="932" textAnchor="middle" fill={stroke} fillOpacity="0.85" fontSize="11" letterSpacing="1.5" style={{ fontFamily: "var(--font-mono)" }}>
            A
          </text>
          <line x1="558" y1="920" x2="600" y2="920" stroke={stroke} strokeOpacity="0.7" strokeWidth="1.1" />
          <path d="M 600 920 L 590 915 L 590 925 Z" fill={stroke} fillOpacity="0.8" />
        </motion.g>
      </motion.svg>

      {/* LAYER 3 — callouts + title block + north arrow (nearest,
          parallax fastest) */}
      <motion.svg
        aria-hidden
        viewBox="0 0 1800 1000"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 h-full w-full"
        style={{ transform: callTransform, willChange: "transform" }}
      >
        {/* Detail callouts — circles with letter, leader lines to the
            house feature they reference. */}
        <motion.g {...fadeProps(DRAW.details, 1)}>
          {[
            { cx: 1300, cy: 300, letter: "1", tx: 1100, ty: 400 },
            { cx: 510, cy: 560, letter: "2", tx: 700, ty: 560 },
            { cx: 1300, cy: 720, letter: "3", tx: 1100, ty: 770 },
          ].map((c) => (
            <g key={c.letter}>
              <line x1={c.cx} y1={c.cy} x2={c.tx} y2={c.ty} stroke={stroke} strokeOpacity="0.4" strokeWidth="1" strokeDasharray="5 4" />
              <circle cx={c.cx} cy={c.cy} r="22" fill="rgb(6 11 27)" stroke={stroke} strokeOpacity="0.75" strokeWidth="1.2" />
              <circle cx={c.cx} cy={c.cy} r="16" fill="none" stroke={stroke} strokeOpacity="0.4" strokeWidth="1" strokeDasharray="3 3" />
              <text x={c.cx} y={c.cy + 5} textAnchor="middle" fill={stroke} fillOpacity="0.9" fontSize="14" letterSpacing="1.5" style={{ fontFamily: "var(--font-mono)" }}>
                {c.letter}
              </text>
            </g>
          ))}
        </motion.g>

        {/* North arrow — top right, with "N" and true-north tick. */}
        <motion.g {...fadeProps(DRAW.title, 0.85)}>
          <circle cx="1700" cy="170" r="34" fill="none" stroke={stroke} strokeOpacity="0.6" strokeWidth="1" />
          <circle cx="1700" cy="170" r="26" fill="none" stroke={stroke} strokeOpacity="0.35" strokeWidth="1" strokeDasharray="3 4" />
          <path d="M 1700 140 L 1706 170 L 1700 162 L 1694 170 Z" fill={stroke} fillOpacity="0.85" />
          <path d="M 1700 200 L 1696 180 L 1700 184 L 1704 180 Z" fill={stroke} fillOpacity="0.5" />
          <text x="1700" y="125" textAnchor="middle" fill={stroke} fillOpacity="0.9" fontSize="12" letterSpacing="2" style={{ fontFamily: "var(--font-mono)" }}>
            N
          </text>
        </motion.g>

        {/* Graphic scale bar — bottom left, divided into 4 parts. */}
        <motion.g {...fadeProps(DRAW.title, 0.8)}>
          {Array.from({ length: 4 }, (_, i) => (
            <rect
              key={i}
              x={60 + i * 40}
              y="946"
              width="40"
              height="8"
              fill={i % 2 === 0 ? "rgb(6 11 27)" : stroke}
              fillOpacity={i % 2 === 0 ? 1 : 0.75}
              stroke={stroke}
              strokeOpacity="0.7"
              strokeWidth="1"
            />
          ))}
          {["0", "5", "10", "15", "20 FT"].map((lbl, i) => (
            <text key={lbl} x={60 + i * 40} y="938" textAnchor="middle" fill={stroke} fillOpacity="0.7" fontSize="9" letterSpacing="1.2" style={{ fontFamily: "var(--font-mono)" }}>
              {lbl}
            </text>
          ))}
        </motion.g>

        {/* Title block — boxed, multi-row, bottom right. */}
        <motion.g {...fadeProps(DRAW.title, 1)}>
          <rect x="1360" y="870" width="380" height="100" fill="rgb(6 11 27)" stroke={stroke} strokeOpacity="0.7" strokeWidth="1.1" />
          <line x1="1360" y1="898" x2="1740" y2="898" stroke={stroke} strokeOpacity="0.55" strokeWidth="1" />
          <line x1="1360" y1="928" x2="1740" y2="928" stroke={stroke} strokeOpacity="0.55" strokeWidth="1" />
          <line x1="1560" y1="898" x2="1560" y2="970" stroke={stroke} strokeOpacity="0.55" strokeWidth="1" />
          <text x="1370" y="888" fill={stroke} fillOpacity="0.9" fontSize="13" letterSpacing="2.5" style={{ fontFamily: "var(--font-mono)" }}>
            FIXPASS · KATY · TEXAS
          </text>
          <text x="1370" y="918" fill={stroke} fillOpacity="0.75" fontSize="10.5" letterSpacing="1.8" style={{ fontFamily: "var(--font-mono)" }}>
            HOME MAINTENANCE, HANDLED
          </text>
          <text x="1370" y="948" fill={stroke} fillOpacity="0.7" fontSize="10" letterSpacing="1.5" style={{ fontFamily: "var(--font-mono)" }}>
            SHEET A-101
          </text>
          <text x="1370" y="963" fill={stroke} fillOpacity="0.55" fontSize="9" letterSpacing="1.4" style={{ fontFamily: "var(--font-mono)" }}>
            SECTION A-A
          </text>
          <text x="1570" y="948" fill={stroke} fillOpacity="0.7" fontSize="10" letterSpacing="1.5" style={{ fontFamily: "var(--font-mono)" }}>
            SCALE 1/4&quot; = 1&apos;
          </text>
          <text x="1570" y="963" fill={stroke} fillOpacity="0.55" fontSize="9" letterSpacing="1.4" style={{ fontFamily: "var(--font-mono)" }}>
            DRN · FP    REV · 01
          </text>
        </motion.g>

        {/* Revision tag stamp — circular, top-left corner. */}
        <motion.g {...fadeProps(DRAW.title, 0.85)}>
          <circle cx="120" cy="170" r="42" fill="none" stroke={stroke} strokeOpacity="0.55" strokeWidth="1" />
          <circle cx="120" cy="170" r="34" fill="none" stroke={stroke} strokeOpacity="0.35" strokeWidth="1" strokeDasharray="2 3" />
          <text x="120" y="160" textAnchor="middle" fill={stroke} fillOpacity="0.85" fontSize="11" letterSpacing="1.5" style={{ fontFamily: "var(--font-mono)" }}>
            ISSUED
          </text>
          <text x="120" y="178" textAnchor="middle" fill={stroke} fillOpacity="0.7" fontSize="10" letterSpacing="1.2" style={{ fontFamily: "var(--font-mono)" }}>
            FOR CARE
          </text>
          <text x="120" y="194" textAnchor="middle" fill={stroke} fillOpacity="0.55" fontSize="9" letterSpacing="1.2" style={{ fontFamily: "var(--font-mono)" }}>
            REV 01
          </text>
        </motion.g>
      </motion.svg>
    </>
  );
}
