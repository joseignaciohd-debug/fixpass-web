"use client";

// AdminShell — ops chrome. Dense sidebar, wider content area, darker
// signal that this is a staff surface.

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  FileText,
  Layers,
  LayoutDashboard,
  LogOut,
  Settings,
  Users,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { FixpassWordmark } from "@/components/ui/brand-mark";
import { AdminBreadcrumbs } from "@/components/layout/admin-breadcrumbs";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { cn } from "@/lib/utils";

const nav = [
  { href: "/admin", label: "Overview", icon: LayoutDashboard, exact: true },
  { href: "/admin/requests", label: "Requests", icon: ClipboardList },
  { href: "/admin/schedule", label: "Schedule", icon: CalendarDays },
  { href: "/admin/customers", label: "Customers", icon: Users },
  { href: "/admin/quotes", label: "Quotes", icon: FileText },
  { href: "/admin/plans", label: "Plans", icon: Layers },
  { href: "/admin/analytics", label: "Analytics", icon: Activity },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

export function AdminShell({
  children,
  userName,
  userEmail,
  roleLabel = "Operations",
}: {
  children: React.ReactNode;
  userName: string;
  userEmail: string;
  roleLabel?: string;
}) {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <div className="min-h-screen">
      <div className="mx-auto grid max-w-[1600px] gap-6 px-4 py-4 sm:px-6 lg:grid-cols-[260px_1fr] lg:px-8 lg:py-6">
        <aside className="h-fit rounded-[var(--radius-lg)] border border-border bg-surface/80 p-3 shadow-[inset_0_1px_0_rgb(var(--highlight)/0.3)] backdrop-blur-md lg:sticky lg:top-4">
          <Link
            href="/"
            className="focus-ring flex items-center gap-3 rounded-[var(--radius-sm)] px-3 py-3 transition hover:bg-canvas-elevated"
          >
            <FixpassWordmark size="sm" />
          </Link>

          <div className="mt-3 flex items-center gap-3 rounded-[var(--radius-sm)] border border-border bg-canvas-elevated px-3 py-2.5">
            <Avatar name={userName} size="sm" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-ink">{userName}</p>
              <p className="truncate text-[10px] uppercase tracking-[0.16em] text-ink-muted">
                {roleLabel}
              </p>
            </div>
          </div>

          <nav aria-label="Admin" className="mt-3 grid gap-0.5">
            {nav.map((item) => {
              const active = isActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "focus-ring flex items-center gap-3 rounded-[var(--radius-xs)] px-3 py-2 text-sm font-medium transition",
                    active
                      ? "bg-royal-soft text-royal-ink"
                      : "text-ink-muted hover:bg-canvas-elevated hover:text-ink",
                  )}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <div className="mt-3 flex items-center justify-between gap-2 border-t border-border pt-3">
            <ThemeToggle />
            <form action="/api/auth/sign-out" method="post">
              <button
                type="submit"
                className="focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold text-ink-muted transition hover:text-ink"
                title={userEmail}
              >
                <LogOut className="h-3.5 w-3.5" aria-hidden />
                Sign out
              </button>
            </form>
          </div>
        </aside>

        <main className="min-w-0 space-y-6">
          <AdminBreadcrumbs />
          {children}
        </main>
      </div>
    </div>
  );
}
