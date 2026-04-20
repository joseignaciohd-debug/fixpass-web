"use client";

// Sidecar component — boots PostHog and fires $pageview on soft
// navigations. Renders no DOM, takes no children. Placed as a
// SIBLING of the page tree (not a wrapper) so its `useSearchParams`
// bailout doesn't cascade the whole app to client-side rendering.

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { initAnalytics, track } from "@/lib/analytics/posthog";

export function AnalyticsProvider() {
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

  return null;
}
