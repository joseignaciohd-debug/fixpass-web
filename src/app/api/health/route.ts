// Health check — returns 200 + a JSON summary of subsystem status.
// Uptime monitors (BetterStack, Pingdom, Vercel) hit this every minute.
//
// We explicitly don't fail hard if a subsystem is down — we report its
// status and let the monitor decide how to interpret. Checking Supabase
// + Stripe via a HEAD on public endpoints (no secrets required) gives
// us a signal without burning db connections or Stripe API budget.

import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

type CheckResult = { ok: boolean; latencyMs: number; detail?: string };

async function checkUrl(url: string, timeoutMs = 3000): Promise<CheckResult> {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const res = await fetch(url, { method: "HEAD", signal: controller.signal });
    return { ok: res.status < 500, latencyMs: Date.now() - started, detail: `HTTP ${res.status}` };
  } catch (err) {
    return {
      ok: false,
      latencyMs: Date.now() - started,
      detail: err instanceof Error ? err.message : "unknown",
    };
  } finally {
    clearTimeout(timer);
  }
}

export async function GET() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const sentryDsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

  const checks: Record<string, CheckResult | "skipped"> = {
    supabase: supabaseUrl ? await checkUrl(`${supabaseUrl}/rest/v1/`) : "skipped",
    stripe: await checkUrl("https://api.stripe.com/healthcheck"),
  };

  const anyDown = Object.values(checks).some((c) => c !== "skipped" && !c.ok);

  return NextResponse.json(
    {
      status: anyDown ? "degraded" : "ok",
      timestamp: new Date().toISOString(),
      version: process.env.VERCEL_GIT_COMMIT_SHA?.slice(0, 7) ?? "dev",
      region: process.env.VERCEL_REGION ?? "local",
      runtime: "edge",
      features: {
        supabase: Boolean(supabaseUrl),
        sentry: Boolean(sentryDsn),
        posthog: Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY),
        stripe: Boolean(process.env.STRIPE_SECRET_KEY),
        stripeWebhook: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
        stripePrices: {
          silver3mo: Boolean(process.env.STRIPE_PRICE_SILVER_3MO),
          silver6mo: Boolean(process.env.STRIPE_PRICE_SILVER_6MO),
          silver1yr: Boolean(process.env.STRIPE_PRICE_SILVER_1YR),
          gold3mo: Boolean(process.env.STRIPE_PRICE_GOLD_3MO),
          gold6mo: Boolean(process.env.STRIPE_PRICE_GOLD_6MO),
          gold1yr: Boolean(process.env.STRIPE_PRICE_GOLD_1YR),
          platinum3mo: Boolean(process.env.STRIPE_PRICE_PLATINUM_3MO),
          platinum6mo: Boolean(process.env.STRIPE_PRICE_PLATINUM_6MO),
          platinum1yr: Boolean(process.env.STRIPE_PRICE_PLATINUM_1YR),
        },
        resend: Boolean(process.env.RESEND_API_KEY),
      },
      checks,
    },
    {
      // Always 200 — uptime monitors parse the JSON `status` field.
      // Returning 503 here would page ops for a Supabase hiccup when
      // our site itself is fine; that's the uptime tool's call, not ours.
      status: 200,
      headers: {
        "Cache-Control": "no-store",
      },
    },
  );
}
