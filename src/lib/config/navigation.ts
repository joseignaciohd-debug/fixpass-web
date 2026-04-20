// Navigation config — single source of truth for routes surfaced in
// headers, footers, sitemap. Keep this in sync with file-system routes.

export const marketingRoutes = [
  { href: "/", label: "Home" },
  { href: "/plans", label: "Plans" },
  { href: "/how-it-works", label: "How it works" },
  { href: "/coverage", label: "Coverage" },
  { href: "/faq", label: "FAQ" },
  { href: "/contact", label: "Contact" },
] as const;

// Signed-in app navigation — mirrors mobile bottom tabs.
export const appNav = [
  { href: "/app", label: "Home", icon: "home" as const },
  { href: "/app/requests", label: "Requests", icon: "wrench" as const },
  { href: "/app/inbox", label: "Inbox", icon: "inbox" as const },
  { href: "/app/membership", label: "Membership", icon: "crown" as const },
  { href: "/app/profile", label: "Profile", icon: "user" as const },
];

// Ops portal navigation — only staff roles see this.
export const adminNav = [
  { href: "/admin", label: "Overview", icon: "layout-dashboard" as const },
  { href: "/admin/requests", label: "Requests", icon: "clipboard-list" as const },
  { href: "/admin/schedule", label: "Schedule", icon: "calendar-days" as const },
  { href: "/admin/customers", label: "Customers", icon: "users" as const },
  { href: "/admin/quotes", label: "Quotes", icon: "file-text" as const },
  { href: "/admin/plans", label: "Plans", icon: "layers" as const },
  { href: "/admin/analytics", label: "Analytics", icon: "activity" as const },
  { href: "/admin/settings", label: "Settings", icon: "settings" as const },
];
