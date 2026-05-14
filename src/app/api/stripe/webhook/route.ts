// Stripe webhook — syncs subscription state from Stripe into Supabase
// and writes a payment_events row on checkout.session.completed so the
// customer's /app/membership screen can flip to active via Realtime.
//
// Mirrors the mobile app's supabase/functions/stripe-webhook. Both
// platforms share the same Supabase project, so one of them receiving
// the webhook is sufficient — but running it on web too means the
// site works even when the Edge Function is down.
//
// IMPORTANT: requires raw request body for signature verification.
// Next.js App Router's Route Handler receives the raw body via
// request.text() — do not call request.json() first.

import { NextResponse } from "next/server";
import * as Sentry from "@sentry/nextjs";
import type Stripe from "stripe";
import { getSupabaseServiceRoleClient } from "@/lib/supabase/server";

// Explicitly opt out of body parsing since we need the raw bytes.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type StripeEvent = Stripe.Event;

const PRICE_TO_PLAN: Record<string, string> = {};
const PRICE_TO_CYCLE: Record<string, string> = {};
for (const [envKey, envValue] of Object.entries(process.env)) {
  // Build price-id → plan-code + cycle map from env vars at module load.
  // e.g. STRIPE_PRICE_GOLD_6MO → gold + 6mo
  const m = envKey.match(/^STRIPE_PRICE_(SILVER|GOLD|PLATINUM)_(3MO|6MO|1YR)$/);
  if (m && envValue) {
    PRICE_TO_PLAN[envValue] = m[1].toLowerCase();
    PRICE_TO_CYCLE[envValue] = m[2].toLowerCase();
  }
}

export async function POST(request: Request) {
  const signature = request.headers.get("stripe-signature");
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const stripeSecret = process.env.STRIPE_SECRET_KEY;

  if (!webhookSecret || !stripeSecret) {
    return NextResponse.json({ error: "Stripe webhook not configured." }, { status: 503 });
  }
  if (!signature) {
    return NextResponse.json({ error: "Missing Stripe signature." }, { status: 400 });
  }

  const rawBody = await request.text();

  // Verify signature via the Stripe SDK.
  const Stripe = (await import("stripe")).default;
  const stripe = new Stripe(stripeSecret);

  let event: StripeEvent;
  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err) {
    return NextResponse.json(
      { error: `Invalid signature: ${err instanceof Error ? err.message : "unknown"}` },
      { status: 400 },
    );
  }

  // Service-role client bypasses RLS so we can write regardless of which
  // authenticated user (if any) triggered the webhook.
  let admin;
  try {
    admin = getSupabaseServiceRoleClient();
  } catch {
    return NextResponse.json({ error: "Supabase admin client not configured." }, { status: 503 });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const s = event.data.object as Stripe.Checkout.Session;
        const subscriptionId = typeof s.subscription === "string" ? s.subscription : s.subscription?.id;
        const sessionId = s.id;
        // client_reference_id is set at checkout creation to session.userId,
        // which is the public.users.id (not the auth.users.id). The
        // payment_events table FKs to auth.users(id) and the matching
        // RLS policy compares against auth.uid(), so we have to resolve
        // the auth_user_id here before inserting — otherwise Postgres
        // rejects the row and the welcome screen's Realtime listener
        // never fires.
        const publicUserId = (s.client_reference_id ?? (s.metadata?.user_id as string | undefined)) ?? "";

        if (subscriptionId) {
          await syncSubscription(admin, stripe, subscriptionId);
        }
        if (sessionId && publicUserId) {
          const { data: userRow } = await admin
            .from("users")
            .select("auth_user_id")
            .eq("id", publicUserId)
            .maybeSingle();
          const authUserId = (userRow?.auth_user_id as string | undefined) ?? null;
          if (authUserId) {
            await admin.from("payment_events").insert({
              user_id: authUserId,
              session_id: sessionId,
              event_type: event.type,
              status: "succeeded",
            });
          } else {
            console.warn("[stripe webhook] cannot resolve auth_user_id for payment_events", {
              publicUserId,
            });
          }
        }
        break;
      }
      case "customer.subscription.updated":
      case "customer.subscription.created":
      case "invoice.paid":
      case "invoice.payment_failed": {
        // event.data.object is a Stripe.Subscription on subscription.*
        // events and a Stripe.Invoice on invoice.* events. Both have
        // either a .subscription field (invoice) or .id field
        // (subscription) — narrowest shared shape we need.
        const obj = event.data.object as { subscription?: string | null; id?: string };
        const subscriptionId = obj.subscription ?? obj.id;
        if (subscriptionId) await syncSubscription(admin, stripe, String(subscriptionId));
        break;
      }
      case "customer.subscription.deleted": {
        const sub = event.data.object as Stripe.Subscription;
        if (sub.id) {
          await admin
            .from("subscriptions")
            .update({ status: "cancelled", cancel_at_period_end: true })
            .eq("stripe_subscription_id", sub.id);
        }
        break;
      }
      default:
        // Intentionally ignore — Stripe sends dozens of event types we don't care about.
        break;
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    // Classify the failure:
    //   - True infrastructure errors (DB down, network timeout, etc.)
    //     → return 500 so Stripe retries on its own schedule (up to
    //     3 days). Stripe's dashboard becomes a free pager.
    //   - Semantic / data-shape errors (validation, unknown plan
    //     code, missing FK target) → return 200 with a warning,
    //     because retrying won't help and Stripe will retry forever.
    // Both paths capture to Sentry so we see them either way.
    Sentry.captureException(err, { tags: { area: "stripe_webhook", event_type: event.type } });
    console.error("[stripe webhook] handler error", err);

    const e = err as { code?: string; message?: string };
    const msg = (e.message ?? "").toLowerCase();
    // Heuristic: "fetch failed", "timeout", "ECONN", "network", "EAI_AGAIN"
    // → likely transient. Postgres errors that include "violates" are
    // data-shape and won't recover.
    const transient =
      msg.includes("fetch failed") ||
      msg.includes("timeout") ||
      msg.includes("econn") ||
      msg.includes("network") ||
      msg.includes("eai_again") ||
      msg.includes("supabase") && !msg.includes("violates");

    if (transient) {
      return NextResponse.json({ error: "transient", message: e.message }, { status: 500 });
    }
    return NextResponse.json({ received: true, warning: "handler error" });
  }
}

async function syncSubscription(
  admin: ReturnType<typeof getSupabaseServiceRoleClient>,
  stripe: Stripe,
  subscriptionId: string,
) {
  const subscription = await stripe.subscriptions.retrieve(subscriptionId, {
    expand: ["items.data.price"],
  });

  const metadata = subscription.metadata ?? {};
  const stripeCustomerId =
    typeof subscription.customer === "string" ? subscription.customer : subscription.customer.id;
  const firstItem = subscription.items.data[0];
  const priceId = firstItem?.price?.id ?? "";
  // Prefer explicit metadata written at checkout (3mo/6mo/1yr). Fall back
  // to the env-var map for subs created outside the app. Final fallback
  // uses Stripe's interval + count (month×3, month×6, year).
  const recurring = firstItem?.price?.recurring;
  const intervalCount = recurring?.interval_count ?? 1;
  const interval = recurring?.interval ?? "month";
  const derivedCycle =
    interval === "year" ? "1yr" : intervalCount === 6 ? "6mo" : intervalCount === 3 ? "3mo" : "1yr";
  const billingCycle = metadata.billing_cycle ?? PRICE_TO_CYCLE[priceId] ?? derivedCycle;
  const planCode = metadata.plan_code ?? PRICE_TO_PLAN[priceId];
  if (!planCode) {
    // Can't map to a plan — log + skip. Still acknowledge the webhook.
    console.warn("[stripe webhook] cannot map price to plan_code", { priceId });
    return;
  }

  // Resolve customer_id, in this order:
  //   1. metadata.customer_id (rarely set today)
  //   2. customers.user_id matching the auth user we attached at checkout
  //   3. subscriptions.stripe_customer_id from a prior sub
  //   4. Auto-create a customers row keyed to the auth user — covers
  //      first-time payers whose customer record was never provisioned.
  // Without (2) and (4) the very first checkout for any new user
  // would silently bail out and the user would never be activated.
  const userId = metadata.user_id as string | undefined;
  let customerId = metadata.customer_id as string | undefined;

  if (!customerId && userId) {
    const { data: customer } = await admin
      .from("customers")
      .select("id")
      .eq("user_id", userId)
      .maybeSingle();
    customerId = (customer?.id as string | undefined) ?? undefined;
  }
  if (!customerId) {
    const { data: existing } = await admin
      .from("subscriptions")
      .select("customer_id")
      .eq("stripe_customer_id", stripeCustomerId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    customerId = (existing?.customer_id as string | undefined) ?? undefined;
  }
  if (!customerId && userId) {
    const { data: created, error: createErr } = await admin
      .from("customers")
      .insert({ user_id: userId })
      .select("id")
      .maybeSingle();
    if (createErr) {
      console.error("[stripe webhook] failed to auto-create customer row", {
        userId,
        error: createErr.message,
      });
      Sentry.captureMessage("[stripe webhook] failed to auto-create customer row", {
        level: "error",
        tags: { area: "stripe_webhook", reason: "customer_insert" },
        extra: { userId, error: createErr.message },
      });
    } else {
      customerId = (created?.id as string | undefined) ?? undefined;
    }
  }
  if (!customerId) {
    console.warn("[stripe webhook] cannot resolve customer_id", { stripeCustomerId, userId });
    Sentry.captureMessage("[stripe webhook] cannot resolve customer_id", {
      level: "warning",
      tags: { area: "stripe_webhook", reason: "customer_id" },
      extra: { stripeCustomerId, userId },
    });
    return;
  }

  const { data: property } = await admin
    .from("properties")
    .select("id")
    .eq("customer_id", customerId)
    .order("created_at", { ascending: true })
    .limit(1)
    .maybeSingle();

  // properties.id is REQUIRED on subscriptions (the column is NOT NULL).
  // If the member hasn't registered their home yet — common, because the
  // /app/welcome flow asks them to do that AFTER paying — we create a
  // placeholder property using the address Stripe collected at checkout
  // (or TBD fields if Stripe didn't capture one). The member can replace
  // the placeholder via /app/property; saveProperty() upserts in place.
  let propertyId = property?.id as string | undefined;
  if (!propertyId) {
    let line1 = "TBD";
    let city = "TBD";
    let state = "TX";
    let postal = "00000";
    try {
      const stripeCustomer = await stripe.customers.retrieve(stripeCustomerId);
      const isDeleted = (stripeCustomer as { deleted?: boolean }).deleted === true;
      if (!isDeleted) {
        const addr = (stripeCustomer as Stripe.Customer).address;
        if (addr) {
          line1 = addr.line1 ?? line1;
          city = addr.city ?? city;
          state = addr.state ?? state;
          postal = addr.postal_code ?? postal;
        }
      }
    } catch (err) {
      console.warn("[stripe webhook] failed to fetch stripe customer address", err);
    }
    const { data: created, error: propErr } = await admin
      .from("properties")
      .insert({
        customer_id: customerId,
        nickname: "My home",
        address_line_1: line1,
        city,
        state,
        postal_code: postal,
      })
      .select("id")
      .maybeSingle();
    if (propErr) {
      console.error("[stripe webhook] failed to auto-create property", propErr.message);
      Sentry.captureMessage("[stripe webhook] failed to auto-create property", {
        level: "error",
        tags: { area: "stripe_webhook", reason: "property_insert" },
        extra: { customerId, error: propErr.message },
      });
      return;
    }
    propertyId = (created?.id as string | undefined) ?? undefined;
  }
  if (!propertyId) {
    console.warn("[stripe webhook] cannot resolve property_id", { customerId });
    Sentry.captureMessage("[stripe webhook] cannot resolve property_id", {
      level: "warning",
      tags: { area: "stripe_webhook", reason: "property_id" },
      extra: { customerId },
    });
    return;
  }

  const { data: plan } = await admin
    .from("membership_plans")
    .select("id")
    .eq("code", planCode)
    .maybeSingle();

  if (!plan?.id) {
    console.warn("[stripe webhook] missing membership_plans row", { planCode });
    Sentry.captureMessage("[stripe webhook] missing membership_plans row", {
      level: "warning",
      tags: { area: "stripe_webhook", reason: "plan_missing" },
      extra: { planCode, priceId },
    });
    return;
  }

  const status = normalizeStatus(subscription.status);
  // Stripe API 2025+ moved `current_period_start` / `current_period_end`
  // off the Subscription object onto each SubscriptionItem. Read from
  // the item first, fall back to the subscription for older API
  // versions, and skip the upsert gracefully if neither is present
  // (otherwise `new Date(undefined * 1000).toISOString()` throws
  // RangeError: Invalid time value and the entire activation aborts).
  const subFields = subscription as unknown as {
    current_period_start?: number;
    current_period_end?: number;
    cancel_at_period_end?: boolean;
  };
  const itemFields = firstItem as unknown as {
    current_period_start?: number;
    current_period_end?: number;
  } | undefined;
  const periodStartUnix =
    itemFields?.current_period_start ?? subFields.current_period_start;
  const periodEndUnix = itemFields?.current_period_end ?? subFields.current_period_end;

  if (typeof periodStartUnix !== "number" || typeof periodEndUnix !== "number") {
    console.warn("[stripe webhook] missing current_period_start/end", {
      subscriptionId,
      hasItemStart: typeof itemFields?.current_period_start,
      hasSubStart: typeof subFields.current_period_start,
    });
    Sentry.captureMessage("[stripe webhook] missing current_period_start/end", {
      level: "warning",
      tags: { area: "stripe_webhook", reason: "period_fields" },
      extra: {
        subscriptionId,
        itemKeys: firstItem ? Object.keys(firstItem) : null,
        subKeys: Object.keys(subscription),
      },
    });
    return;
  }

  const currentPeriodStart = new Date(periodStartUnix * 1000).toISOString();
  const currentPeriodEnd = new Date(periodEndUnix * 1000).toISOString();

  // Cancel any OTHER active subscription for this customer (defensive —
  // member shouldn't have two active subs).
  await admin
    .from("subscriptions")
    .update({ status: "cancelled", cancel_at_period_end: true })
    .eq("customer_id", customerId)
    .neq("stripe_subscription_id", subscriptionId)
    .eq("status", "active");

  const payload: Record<string, unknown> = {
    customer_id: customerId,
    property_id: propertyId,
    membership_plan_id: plan.id,
    status,
    billing_cycle: billingCycle,
    stripe_customer_id: stripeCustomerId,
    stripe_subscription_id: subscriptionId,
    current_period_start: currentPeriodStart,
    current_period_end: currentPeriodEnd,
    cancel_at_period_end: subFields.cancel_at_period_end ?? false,
  };

  const { data: existing } = await admin
    .from("subscriptions")
    .select("id")
    .eq("stripe_subscription_id", subscriptionId)
    .maybeSingle();

  if (existing?.id) {
    await admin.from("subscriptions").update(payload).eq("id", existing.id);
  } else {
    await admin.from("subscriptions").insert(payload);
  }
}

function normalizeStatus(status: string): "active" | "cancelled" | "paused" {
  switch (status) {
    case "active":
    case "trialing":
      return "active";
    case "canceled":
    case "incomplete_expired":
      return "cancelled";
    default:
      return "paused";
  }
}
