"use client";

// DoorHandleCard — the signature landing-hero interaction. A card
// themed as a navy door with a brass handle. The user drags or taps
// the handle and it rotates down ~75°. When fully turned, the card
// "opens" (inner content slides + fades in), the card border-radius
// relaxes, and a subtle "click" of motion confirms the action.
//
// This is the kind of singular interaction that makes a product feel
// built by humans. It's the *literal* metaphor for Fixpass: you own
// the door, you turn the handle, the home is handled.
//
// Falls back to a normal card + button on prefers-reduced-motion or
// pointer:coarse devices where drag is awkward — the unopened copy
// is still meaningful on its own.

import { AnimatePresence, motion, useMotionValue, useReducedMotion, useTransform } from "framer-motion";
import Link from "next/link";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { FixpassMark } from "@/components/ui/brand-mark";

// Rotation range in degrees. 0 = resting horizontal, -75 = fully down.
const CLOSED = 0;
const OPEN = -75;
// Threshold at which we lock into the open state and fire the reveal.
const SNAP_THRESHOLD = -55;

export function DoorHandleCard() {
  const reduced = useReducedMotion();
  const [opened, setOpened] = useState(false);
  const hintTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [hinting, setHinting] = useState(false);

  // The handle's rotation in degrees. Driven by drag on pointer devices,
  // by click-and-hold or tap on touch.
  const rotation = useMotionValue(CLOSED);

  // Derived visuals.
  const ringOpacity = useTransform(rotation, [CLOSED, OPEN], [0, 0.55]);
  const glowOpacity = useTransform(rotation, [CLOSED, SNAP_THRESHOLD], [0, 1]);

  // Show a soft "nudge" animation after 3s of idle so visitors who
  // don't understand it's draggable still see it's interactive.
  useEffect(() => {
    if (opened || reduced) return;
    hintTimerRef.current = setTimeout(() => setHinting(true), 3000);
    return () => {
      if (hintTimerRef.current) clearTimeout(hintTimerRef.current);
    };
  }, [opened, reduced]);

  // Snap to open or closed based on current rotation.
  function settle() {
    setHinting(false);
    const current = rotation.get();
    if (current <= SNAP_THRESHOLD) {
      // Past the threshold — commit to fully open.
      rotation.set(current); // lock current
      animateTo(rotation, OPEN, 180);
      setOpened(true);
    } else {
      animateTo(rotation, CLOSED, 260);
    }
  }

  // For touch / click-to-open (no drag support on coarse pointers).
  function handleTap() {
    if (opened || reduced) return;
    animateTo(rotation, OPEN, 360);
    setOpened(true);
  }

  function reset() {
    animateTo(rotation, CLOSED, 260);
    setOpened(false);
  }

  // Reduced-motion / fallback: skip the interaction, just show the
  // opened state immediately. The content stays equivalent.
  if (reduced) {
    return <OpenedCard />;
  }

  return (
    <div className="relative">
      <motion.div
        // The door-card itself. When opened, the container relaxes its
        // corner radii slightly and lifts up, as if the door swung free.
        animate={{
          y: opened ? -4 : 0,
          borderRadius: opened ? "28px" : "24px",
        }}
        transition={{ type: "spring", stiffness: 240, damping: 26 }}
        className="relative overflow-hidden bg-gradient-to-br from-ink via-royal to-lapis p-8 sm:p-10 shadow-[0_32px_80px_-40px_rgb(11_27_58_/_0.6)]"
      >
        {/* Subtle grid overlay + ambient orbs */}
        <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.6)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.6)_1px,transparent_1px)] [background-size:32px_32px]" />
        <motion.div
          aria-hidden
          style={{ opacity: glowOpacity }}
          className="pointer-events-none absolute -top-24 -right-24 h-72 w-72 rounded-full bg-honey/30 blur-3xl"
        />

        {/* Header row — eyebrow + mark */}
        <div className="relative flex items-start justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
            Membership promise
          </span>
          <FixpassMark size={36} onDark />
        </div>

        {/* Before-open copy (closed state) + after-open copy swap in via
            AnimatePresence — the content layout is identical so the card
            doesn't jump. */}
        <div className="relative mt-10 min-h-[220px]">
          <AnimatePresence mode="wait">
            {!opened ? (
              <motion.div
                key="closed"
                initial={{ opacity: 1 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <p className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-white sm:text-4xl">
                  You own the door.
                  <br />
                  <span className="text-honey">We handle the house.</span>
                </p>
                <p className="mt-5 max-w-md text-sm leading-6 text-white/80">
                  Turn the handle to see what&apos;s covered — or skip the
                  metaphor and start a membership.
                </p>
              </motion.div>
            ) : (
              <OpenedContent />
            )}
          </AnimatePresence>
        </div>

        {/* CTAs */}
        <div className="relative mt-8 flex flex-wrap items-center gap-3">
          <Link
            href="/join"
            className="focus-ring inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-honey-soft"
          >
            Start membership
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
          {opened ? (
            <button
              type="button"
              onClick={reset}
              className="focus-ring inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs font-semibold text-white/70 transition hover:text-white"
            >
              Close the door
            </button>
          ) : null}
        </div>

        {/* The handle lives on the right edge, vertically centered.
            Drag constraints keep it within the sensible rotation arc. */}
        <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
          <motion.div
            // Halo ring that fades in as the handle turns, suggests
            // progress without being a crass progress bar.
            style={{ opacity: ringOpacity }}
            className="absolute inset-0 -m-3 rounded-full border border-honey/40"
          />

          <motion.button
            type="button"
            aria-label="Turn the handle"
            onClick={handleTap}
            onDragEnd={settle}
            drag={opened ? false : "y"}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={0}
            // Convert drag Y (px) into rotation degrees. We fake "y" drag
            // as rotation by tracking drag and mapping manually via a
            // motionValue; dragConstraints locks the element in place.
            onDrag={(_, info) => {
              if (opened) return;
              // Total expected drag ≈ 90px to reach full rotation.
              const next = Math.max(OPEN, Math.min(CLOSED, (info.offset.y / 90) * OPEN));
              rotation.set(next);
            }}
            animate={
              hinting && !opened
                ? { rotate: [CLOSED, -10, CLOSED] }
                : undefined
            }
            transition={
              hinting
                ? {
                    duration: 1.6,
                    times: [0, 0.5, 1],
                    ease: "easeInOut",
                    repeat: 1,
                  }
                : undefined
            }
            whileHover={opened ? undefined : { scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className="pointer-events-auto relative flex h-24 w-12 cursor-grab items-center justify-start rounded-l-full rounded-r-xl pr-0 focus:outline-none active:cursor-grabbing"
            style={{
              transformOrigin: "100% 50%", // hinge pivots on the right edge
              rotate: rotation,
            }}
          >
            {/* Brass handle — a rectangle tapering into a ball pivot.
                Uses layered gradients to read as metal on a tiny canvas. */}
            <span
              aria-hidden
              className="block h-4 w-20 rounded-full"
              style={{
                background:
                  "linear-gradient(180deg, #F7D98A 0%, #D9A34A 45%, #B07A2C 55%, #F5D07A 100%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.6), inset 0 -1px 0 rgba(0,0,0,0.3), 0 6px 14px -6px rgba(0,0,0,0.6)",
              }}
            />
            {/* Pivot ball on the right */}
            <span
              aria-hidden
              className="absolute right-1 top-1/2 h-7 w-7 -translate-y-1/2 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 30% 25%, #FBE3A3 0%, #D9A34A 50%, #8C5C1A 100%)",
                boxShadow:
                  "inset 0 1px 1px rgba(255,255,255,0.7), inset 0 -2px 3px rgba(0,0,0,0.4), 0 4px 12px -4px rgba(0,0,0,0.6)",
              }}
            />
          </motion.button>

          {/* Tiny hint label, disappears once opened */}
          <AnimatePresence>
            {!opened ? (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.7 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 2 }}
                className="pointer-events-none absolute -left-20 top-1/2 -translate-y-1/2 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/70"
              >
                Turn →
              </motion.span>
            ) : null}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

// Extracted so the reduced-motion fallback and the post-open state share
// the same inner markup (single source of truth for opened copy).
function OpenedContent() {
  return (
    <motion.div
      key="open"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
    >
      <p className="font-[family-name:var(--font-display)] text-3xl font-semibold leading-tight text-white sm:text-4xl">
        You&apos;re in. Here&apos;s what you get.
      </p>
      <ul className="mt-5 grid gap-2 text-sm leading-6 text-white/90">
        {[
          "Vetted in-house technicians, never a marketplace",
          "Operator review on every request — no bot dispatch",
          "Prepaid 3, 6, or 12 months — lock in a lower per-month",
          "One membership, one property, zero handyman-hunting",
        ].map((line) => (
          <li key={line} className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-honey" />
            {line}
          </li>
        ))}
      </ul>
    </motion.div>
  );
}

function OpenedCard() {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-ink via-royal to-lapis p-8 sm:p-10 shadow-[0_32px_80px_-40px_rgb(11_27_58_/_0.6)]">
      <div className="relative flex items-start justify-between">
        <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-white/70">
          Membership promise
        </span>
        <FixpassMark size={36} onDark />
      </div>
      <div className="mt-10">
        <OpenedContent />
      </div>
      <div className="mt-8">
        <Link
          href="/join"
          className="focus-ring inline-flex items-center gap-2 rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-ink transition hover:bg-honey-soft"
        >
          Start membership
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}

// Small helper — framer-motion's `animate()` imports would bloat the
// bundle; we only need a basic spring-to-target on a single motion
// value, so this is enough.
function animateTo(mv: ReturnType<typeof useMotionValue<number>>, target: number, stiffness: number) {
  const start = mv.get();
  const startTime = performance.now();
  const duration = 420;
  function step(now: number) {
    const t = Math.min(1, (now - startTime) / duration);
    // Spring-ish ease for snappy feel.
    const eased = 1 - Math.pow(1 - t, 3);
    mv.set(start + (target - start) * eased);
    if (t < 1) requestAnimationFrame(step);
  }
  requestAnimationFrame(step);
  // Mark stiffness param so TS doesn't complain if someone passes it;
  // visually we use a fixed cubic. Keep the arg for future tuning.
  void stiffness;
}
