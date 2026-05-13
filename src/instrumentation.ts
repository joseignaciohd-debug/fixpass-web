// Next.js instrumentation hook. Loads Sentry's per-runtime config so
// server errors route through Sentry and edge errors via the edge one.
//
// Also runs a boot-time env-var sanity check in production. A half-
// configured deploy used to silently 503 the first time a user tried
// to check out; now we fail fast at startup with a clear log line.

const REQUIRED_ALWAYS = ["NEXT_PUBLIC_SUPABASE_URL", "NEXT_PUBLIC_SUPABASE_ANON_KEY"] as const;
const REQUIRED_IN_PROD = [
  "SUPABASE_SERVICE_ROLE_KEY",
  "STRIPE_SECRET_KEY",
  "STRIPE_WEBHOOK_SECRET",
  "STRIPE_PRICE_SILVER_3MO",
  "STRIPE_PRICE_SILVER_6MO",
  "STRIPE_PRICE_SILVER_1YR",
  "STRIPE_PRICE_GOLD_3MO",
  "STRIPE_PRICE_GOLD_6MO",
  "STRIPE_PRICE_GOLD_1YR",
  "STRIPE_PRICE_PLATINUM_3MO",
  "STRIPE_PRICE_PLATINUM_6MO",
  "STRIPE_PRICE_PLATINUM_1YR",
] as const;

function checkEnv() {
  const missing: string[] = [];
  for (const k of REQUIRED_ALWAYS) {
    if (!process.env[k]) missing.push(k);
  }
  if (process.env.NODE_ENV === "production") {
    for (const k of REQUIRED_IN_PROD) {
      if (!process.env[k]) missing.push(k);
    }
  }
  if (missing.length > 0) {
    // Log loudly but don't throw — Next 16 instrumentation runs at
    // boot AND during build (where some env vars are intentionally
    // empty). The point is that the next deploy log clearly shows
    // what's missing instead of mysteriously 503-ing later.
    const msg = `[boot] Missing required env vars: ${missing.join(", ")}`;
    console.error(msg);
  }
}

export async function register() {
  checkEnv();
  if (process.env.NEXT_RUNTIME === "nodejs") {
    await import("../sentry.server.config");
  }
  if (process.env.NEXT_RUNTIME === "edge") {
    await import("../sentry.edge.config");
  }
}

export { captureRequestError as onRequestError } from "@sentry/nextjs";
