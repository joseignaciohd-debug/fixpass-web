"use client";

// SiteHeader — public nav for marketing pages.
// Scroll > 12px switches from transparent to frosted-glass with border.
// Active route gets a sliding royal pill indicator (framer-motion layoutId).

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FixpassWordmark } from "@/components/ui/brand-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { marketingRoutes } from "@/lib/config/navigation";
import { cn } from "@/lib/utils";

export function SiteHeader() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close mobile drawer on route change. Reset-on-prop-change is a
  // legitimate React 19 pattern; the lint rule overflags it.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMobileOpen(false);
  }, [pathname]);

  return (
    <header
      className={cn(
        "sticky top-0 z-40 transition-all duration-300",
        scrolled ? "surface-glass border-b border-border" : "bg-transparent",
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-5 py-4 sm:px-8 lg:px-12">
        <Link
          href="/"
          className="focus-ring group flex items-center gap-3 rounded-full transition-opacity hover:opacity-90"
        >
          <FixpassWordmark size="md" />
          <span className="hidden items-center gap-2 border-l border-border pl-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-ink-muted md:inline-flex">
            Katy, TX
          </span>
        </Link>

        <nav
          aria-label="Primary"
          className="hidden items-center gap-1 rounded-full border border-border bg-surface/70 px-1.5 py-1.5 text-sm text-ink-muted shadow-[0_18px_50px_-32px_rgb(var(--shadow)/0.25)] backdrop-blur-md lg:flex"
        >
          {marketingRoutes.slice(1).map((item) => {
            const isActive =
              pathname === item.href || (item.href !== "/" && pathname?.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "focus-ring relative rounded-full px-4 py-2 font-medium transition",
                  isActive ? "text-white" : "hover:text-ink",
                )}
              >
                {isActive ? (
                  <motion.span
                    layoutId="nav-active-pill"
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-ink via-royal to-lapis shadow-sm"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                ) : null}
                <span className="relative z-10">{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <ThemeToggle className="hidden sm:inline-flex" />
          <Button href="/sign-in" variant="ghost" size="sm" className="hidden sm:inline-flex">
            Log in
          </Button>
          <Button href="/join" size="sm" className="hidden sm:inline-flex">
            Join Fixpass
          </Button>
          <button
            type="button"
            onClick={() => setMobileOpen((v) => !v)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            aria-expanded={mobileOpen}
            className="focus-ring inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-surface text-ink lg:hidden"
          >
            {mobileOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <motion.div
            key="mobile-nav"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="lg:hidden"
          >
            <div className="mx-4 mb-4 mt-1 overflow-hidden rounded-2xl border border-border bg-surface shadow-[0_24px_64px_-36px_rgb(var(--shadow)/0.2)]">
              <div className="flex flex-col divide-y divide-border/60 text-sm">
                {marketingRoutes.slice(1).map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={cn(
                        "px-5 py-3 font-medium transition hover:bg-canvas-elevated",
                        isActive ? "text-ink" : "text-ink-muted",
                      )}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </div>
              <div className="flex items-center justify-between gap-2 border-t border-border/60 px-4 py-3">
                <ThemeToggle />
                <div className="flex items-center gap-2">
                  <Button href="/sign-in" variant="ghost" size="sm">
                    Log in
                  </Button>
                  <Button href="/join" size="sm">
                    Join
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </header>
  );
}
