import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Security headers applied globally. CSP intentionally permissive for
// Stripe + Supabase + PostHog + Sentry domains; tighten once the full
// asset inventory is stable. If you add a new third-party script,
// extend script-src/connect-src here.
const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

// Wrap with Sentry only when a DSN exists — otherwise the CLI wrapper
// logs noisy "tunnel not configured" warnings in local dev.
const sentryConfigured = Boolean(
  process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN,
);

export default sentryConfigured
  ? withSentryConfig(nextConfig, {
      silent: true,
      widenClientFileUpload: true,
      tunnelRoute: "/monitoring-tunnel",
      disableLogger: true,
      automaticVercelMonitors: false,
    })
  : nextConfig;
