"use client";

// Client-only provider that boots PostHog + fires $pageview on
// soft navigations (Next.js App Router doesn't auto-fire those).

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { initAnalytics, track } from "@/lib/analytics/posthog";

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const search = useSearchParams();

  useEffect(() => {
    initAnalytics();
  }, []);

  useEffect(() => {
    if (!pathname) return;
    const url = search?.toString() ? `${pathname}?${search.toString()}` : pathname;
    track("$pageview", { $current_url: url });
  }, [pathname, search]);

  return <>{children}</>;
}
