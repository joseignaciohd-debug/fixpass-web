"use client";

// Sticky bottom CTA visible only on small viewports (< md). Anchors the
// "pick a plan" call-to-action while the user scrolls through the
// comparison table + calculator + FAQ. Hidden by default at the top
// of the viewport; slides up after ~30% scroll so it doesn't compete
// with the hero.

import { ArrowRight } from "lucide-react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { DEFAULT_BILLING_CYCLE, planPerMonth, plans } from "@/lib/config/site-data";
import { currency } from "@/lib/utils";

export function StickyPlansCTA() {
  const { scrollYProgress } = useScroll();
  const [visible, setVisible] = useState(false);

  // Only show after the user has scrolled past the hero + plan cards
  // (~25% of page). Don't show once they're near the footer (>90%).
  useEffect(() => {
    return scrollYProgress.on("change", (v) => {
      setVisible(v > 0.18 && v < 0.92);
    });
  }, [scrollYProgress]);

  const silverFrom = planPerMonth(plans[0], DEFAULT_BILLING_CYCLE);

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ y: 80, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 80, opacity: 0 }}
          transition={{ type: "spring", stiffness: 420, damping: 36 }}
          className="fixed inset-x-3 bottom-3 z-40 md:hidden"
        >
          <div className="flex items-center gap-3 rounded-full border border-border bg-surface/95 p-1.5 pl-4 shadow-[0_20px_48px_-24px_rgb(var(--shadow)/0.5)] backdrop-blur">
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-semibold uppercase tracking-[0.14em] text-ink-subtle">
                From
              </div>
              <div className="truncate text-sm font-semibold text-ink">
                {currency(silverFrom)}/mo · Silver 1-year
              </div>
            </div>
            <Button href="/plans#plan-cards" size="sm" iconRight={<ArrowRight size={14} />}>
              Pick plan
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
