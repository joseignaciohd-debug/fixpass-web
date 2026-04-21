// Stripe Checkout session creation. Mirrors the mobile app's
// mobile-billing Edge Function — sets client_reference_id so the
// webhook can write a payment_events row and unlock access in real
// time (see mobile session recap).

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentSession } from "@/lib/auth/session";

const PRICE_MAP: Record<string, Record<string, string | undefined>> = {
  silver: {
    monthly: process.env.STRIPE_PRICE_SILVER_MONTHLY,
    annual: process.env.STRIPE_PRICE_SILVER_ANNUAL,
  },
  gold: {
    monthly: process.env.STRIPE_PRICE_GOLD_MONTHLY,
    annual: process.env.STRIPE_PRICE_GOLD_ANNUAL,
  },
  platinum: {
    monthly: process.env.STRIPE_PRICE_PLATINUM_MONTHLY,
    annual: process.env.STRIPE_PRICE_PLATINUM_ANNUAL,
  },
};

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.redirect(new URL("/sign-in", request.url), { status: 303 });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { error: "Stripe is not configured yet. Ask ops to finish setup." },
      { status: 503 },
    );
  }

  const form = await request.formData();
  const planId = String(form.get("planId") ?? "");
  const billingCycle = String(form.get("billingCycle") ?? "monthly");
  const priceId = PRICE_MAP[planId]?.[billingCycle];
  if (!priceId) {
    return NextResponse.json({ error: "Unknown plan / cycle." }, { status: 400 });
  }

  const stripe = new Stripe(stripeKey);
  const origin = new URL(request.url).origin;

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
    return NextResponse.json({ error: "Stripe returned no checkout URL." }, { status: 502 });
  }

  return NextResponse.redirect(checkout.url, { status: 303 });
}
