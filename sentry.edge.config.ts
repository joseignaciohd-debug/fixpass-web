import * as Sentry from "@sentry/nextjs";

const DSN = process.env.SENTRY_DSN ?? process.env.NEXT_PUBLIC_SENTRY_DSN;

if (DSN) {
  Sentry.init({
    dsn: DSN,
    environment: process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development",
    release: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7),
    tracesSampleRate: process.env.NODE_ENV === "production" ? 0.1 : 1.0,
    sendDefaultPii: false,
  });
}
