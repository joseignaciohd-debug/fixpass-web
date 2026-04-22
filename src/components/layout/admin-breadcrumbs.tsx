"use client";

// AdminBreadcrumbs — derives "you are here" from the current path so
// every admin screen gets a clickable trail for free. No config per
// page needed; each path segment becomes a crumb with title-case label.
// Replacements map handles segments where the URL slug differs from
// the human label (e.g. "requests" → "Requests", a UUID → "Detail").

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight, Home } from "lucide-react";

// Segments we want to rename from the URL slug to a nicer label.
const LABEL_OVERRIDES: Record<string, string> = {
  admin: "Admin",
  requests: "Requests",
  schedule: "Schedule",
  customers: "Customers",
  quotes: "Quotes",
  plans: "Plans",
  analytics: "Analytics",
  settings: "Settings",
};

// UUID / ID-ish segments collapse into "Detail" so the crumb stays
// readable instead of showing a 36-char UUID.
function prettify(segment: string): string {
  if (/^[0-9a-f]{8}-[0-9a-f]{4}/i.test(segment)) return "Detail";
  if (/^\d+$/.test(segment)) return "Detail";
  return (
    LABEL_OVERRIDES[segment] ??
    segment
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase())
  );
}

export function AdminBreadcrumbs() {
  const pathname = usePathname() ?? "/admin";
  const segments = pathname.split("/").filter(Boolean);
  if (segments.length === 0) return null;

  // Build cumulative hrefs: /admin, /admin/requests, /admin/requests/123 …
  const crumbs = segments.map((seg, i) => ({
    href: "/" + segments.slice(0, i + 1).join("/"),
    label: prettify(seg),
    isLast: i === segments.length - 1,
  }));

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex items-center gap-1.5 text-xs text-ink-muted"
    >
      <Link
        href="/admin"
        className="flex items-center gap-1 rounded-full px-2 py-1 transition hover:bg-canvas-elevated hover:text-ink"
      >
        <Home className="h-3 w-3" aria-hidden />
        <span className="sr-only">Admin home</span>
      </Link>
      {crumbs.slice(1).map((c) => (
        <span key={c.href} className="flex items-center gap-1.5">
          <ChevronRight className="h-3 w-3 text-ink-subtle" aria-hidden />
          {c.isLast ? (
            <span className="font-semibold text-ink" aria-current="page">
              {c.label}
            </span>
          ) : (
            <Link
              href={c.href}
              className="rounded-full px-2 py-1 transition hover:bg-canvas-elevated hover:text-ink"
            >
              {c.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
