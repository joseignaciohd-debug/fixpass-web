// Stripe Checkout session creation. Mirrors the mobile app's
// mobile-billing Edge Function — sets client_reference_id so the
// webhook can write a payment_events row and unlock access in real
// time (see mobile session recap).

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentSession } from "@/lib/auth/session";
import { rateLimit } from "@/lib/rate-limit";

// Billing cycles: 3mo / 6mo / 1yr prepaid. Each tier has its own
// Stripe price per cycle. Env var naming: STRIPE_PRICE_<TIER>_<CYCLE>
// where CYCLE ∈ { 3MO, 6MO, 1YR }.
const PRICE_MAP: Record<string, Record<string, string | undefined>> = {
  silver: {
    "3mo": process.env.STRIPE_PRICE_SILVER_3MO,
    "6mo": process.env.STRIPE_PRICE_SILVER_6MO,
    "1yr": process.env.STRIPE_PRICE_SILVER_1YR,
  },
  gold: {
    "3mo": process.env.STRIPE_PRICE_GOLD_3MO,
    "6mo": process.env.STRIPE_PRICE_GOLD_6MO,
    "1yr": process.env.STRIPE_PRICE_GOLD_1YR,
  },
  platinum: {
    "3mo": process.env.STRIPE_PRICE_PLATINUM_3MO,
    "6mo": process.env.STRIPE_PRICE_PLATINUM_6MO,
    "1yr": process.env.STRIPE_PRICE_PLATINUM_1YR,
  },
};

const VALID_CYCLES = new Set(["3mo", "6mo", "1yr"]);

export async function POST(request: Request) {
  // Native form POSTs (pre-hydration on Mobile Safari) can't parse a JSON
  // response and end up showing a "download" prompt. So we route by Accept:
  // JS callers send `Accept: application/json` and get JSON; everything else
  // gets a 303 redirect that the browser follows natively to Stripe.
  const wantsJson = request.headers.get("accept")?.includes("application/json") ?? false;
  const origin = new URL(request.url).origin;
  const fail = (status: number, error: string, redirectPath: string) =>
    wantsJson
      ? NextResponse.json({ error }, { status })
      : NextResponse.redirect(`${origin}${redirectPath}`, 303);

  const session = await getCurrentSession();
  if (!session) {
    return wantsJson
      ? NextResponse.json({ url: "/sign-in" }, { status: 401 })
      : NextResponse.redirect(`${origin}/sign-in`, 303);
  }

  // 10 checkout attempts per user per hour — more than enough for legit
  // users, blocks abuse. Keyed on user id so shared-IP office networks
  // don't hit each other's limits.
  const rl = rateLimit(`checkout:${session.userId}`, { max: 10, windowMs: 60 * 60 * 1000 });
  if (!rl.ok) {
    return fail(
      429,
      "Too many checkout attempts. Wait a moment and try again.",
      "/app/subscribe?error=rate-limited",
    );
  }

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return fail(
      503,
      "Stripe is not configured yet. Ask ops to finish setup.",
      "/app/subscribe?error=stripe-unavailable",
    );
  }

  const form = await request.formData();
  const planId = String(form.get("planId") ?? "");
  const billingCycle = String(form.get("billingCycle") ?? "1yr");
  if (!VALID_CYCLES.has(billingCycle)) {
    return fail(400, "Unknown billing cycle.", "/app/subscribe?error=bad-cycle");
  }
  const priceId = PRICE_MAP[planId]?.[billingCycle];
  if (!priceId) {
    return fail(400, "Unknown plan / cycle.", "/app/subscribe?error=bad-plan");
  }

  const stripe = new Stripe(stripeKey);

  const checkout = await stripe.checkout.sessions.create({
    mode: "subscription",
    line_items: [{ price: priceId, quantity: 1 }],
    allow_promotion_codes: true,
    success_url: `${origin}/app/welcome?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/app/subscribe?checkout=cancelled`,
    // client_reference_id lets the webhook write a payment_events row
    // so the app can unlock immediately via Supabase Realtime.
    client_reference_id: session.userId,
    metadata: {
      user_id: session.userId,
      plan_code: planId,
      billing_cycle: billingCycle,
    },
    subscription_data: {
      metadata: {
        user_id: session.userId,
        plan_code: planId,
        billing_cycle: billingCycle,
      },
    },
    customer_email: session.email,
  });

  if (!checkout.url) {
    return fail(502, "Stripe returned no checkout URL.", "/app/subscribe?error=stripe-no-url");
  }

  return wantsJson
    ? NextResponse.json({ url: checkout.url })
    : NextResponse.redirect(checkout.url, 303);
}
