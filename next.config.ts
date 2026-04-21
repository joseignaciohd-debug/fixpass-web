import type { NextConfig } from "next";
import { withSentryConfig } from "@sentry/nextjs";

// Security headers applied globally. CSP is scoped to the domains we
// actually load from: self (Vercel), Stripe (checkout + portal),
// Supabase (auth + storage), PostHog (analytics), Sentry (crash reporting),
// Google Fonts (font CDN, used by @vercel/og only). Adjust if a new
// third-party is added.
const CSP_DIRECTIVES = [
  "default-src 'self'",
  // 'unsafe-inline' needed for Next.js's inline <script> chunks + the theme
  // pre-paint script in layout.tsx. Without nonce-based inline scripts,
  // this is the pragmatic trade-off. Tighten with nonces if paranoid.
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://*.posthog.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https: http:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://*.supabase.co https://api.stripe.com https://*.ingest.sentry.io https://*.sentry.io https://*.posthog.com https://api.posthog.com https://fonts.googleapis.com https://fonts.gstatic.com",
  // Stripe checkout + billing portal open inline in iframes occasionally.
  "frame-src 'self' https://js.stripe.com https://hooks.stripe.com https://checkout.stripe.com",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self' https://checkout.stripe.com https://billing.stripe.com",
  "object-src 'none'",
  "upgrade-insecure-requests",
].join("; ");

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(self), microphone=(), geolocation=(), interest-cohort=()",
  },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "Content-Security-Policy", value: CSP_DIRECTIVES },
  { key: "X-DNS-Prefetch-Control", value: "on" },
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
