"use client";

// AppShell — signed-in customer chrome. Mirrors the mobile app's tab
// bar but laid out as a sidebar on desktop + bottom bar on mobile.
// Wraps every /app/* route.

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Crown,
  Home,
  Inbox,
  LogOut,
  User,
  Wrench,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { FixpassWordmark } from "@/components/ui/brand-mark";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/app", label: "Home", icon: Home, exact: true },
  { href: "/app/requests", label: "Requests", icon: Wrench },
  { href: "/app/inbox", label: "Inbox", icon: Inbox },
  { href: "/app/membership", label: "Membership", icon: Crown },
  { href: "/app/profile", label: "Profile", icon: User },
];

export function AppShell({
  children,
  userName,
  userEmail,
}: {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
}) {
  const pathname = usePathname();

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <div className="relative min-h-screen">
      {/* Mobile top bar (lg: hidden) */}
      <header className="surface-glass sticky top-0 z-30 border-b border-border lg:hidden">
        <div className="flex items-center justify-between gap-3 px-5 py-3">
          <Link href="/app" className="focus-ring rounded-full">
            <FixpassWordmark size="sm" />
          </Link>
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-[1500px] gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[264px_1fr] lg:px-8 lg:py-6">
        {/* Desktop sidebar */}
        <aside className="hidden h-fit flex-col gap-4 lg:sticky lg:top-4 lg:flex">
          <Link
            href="/"
            className="focus-ring flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3.5 transition hover:border-border-strong"
          >
            <FixpassWordmark size="sm" />
          </Link>

          <div className="flex items-center gap-3 rounded-[var(--radius-md)] border border-border bg-surface px-4 py-3">
            <Avatar name={userName} size="md" ring />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{userName}</p>
              <p className="truncate text-[11px] text-ink-muted">{userEmail}</p>
            </div>
          </div>

          <nav aria-label="App" className="grid gap-1">
            {nav.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "focus-ring flex items-center gap-3 rounded-[var(--radius-sm)] px-4 py-3 text-sm font-medium transition",
                    active
                      ? "bg-royal-soft text-royal-ink shadow-[inset_0_1px_0_rgb(var(--highlight)/0.5)]"
                      : "text-ink-muted hover:bg-canvas-elevated hover:text-ink",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-2 flex items-center justify-between gap-2 border-t border-border pt-4">
            <ThemeToggle />
            <form action="/api/auth/sign-out" method="post">
              <button
                type="submit"
                className="focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:text-ink"
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden />
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <main className="min-w-0 space-y-6 pb-24 lg:pb-0">{children}</main>
      </div>

      {/* Mobile bottom tab bar */}
      <nav
        aria-label="App tabs"
        className="surface-glass fixed inset-x-0 bottom-0 z-30 border-t border-border lg:hidden"
      >
        <div className="mx-auto flex max-w-md items-center justify-between px-2 py-2">
          {nav.map((item) => {
            const active = isActive(item.href, item.exact);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "focus-ring flex flex-1 flex-col items-center gap-0.5 rounded-[var(--radius-sm)] px-2 py-1.5 text-[10px] font-semibold uppercase tracking-[0.08em] transition",
                  active ? "text-royal" : "text-ink-subtle hover:text-ink",
                )}
              >
                <Icon className={cn("h-5 w-5", active && "scale-110")} aria-hidden />
                {item.label}
              </Link>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
