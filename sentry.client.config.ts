// Sentry client config — privacy-safe defaults matching the mobile app.
// No-ops if the DSN isn't set so local dev stays clean.

import * as Sentry from "@sentry/nextjs";

const DSN = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    // Tag every event with the deployed commit so stack traces + regressions
    // map back to an exact commit on GitHub. Vercel injects this automatically.
    release:
      process.env.NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ??
      process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    sendDefaultPii: false,
    replaysSessionSampleRate: 0,
    replaysOnErrorSampleRate: 0,
  });
}
