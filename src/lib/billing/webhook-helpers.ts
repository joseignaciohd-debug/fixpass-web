// Small pure helpers extracted from the Stripe webhook handler so
// they can be unit-tested without spinning up Supabase + Stripe.
//
// Keep these aligned with the behaviour in
// `src/app/api/stripe/webhook/route.ts` — the route imports nothing
// from here yet (to avoid churning the verified-working handler), but
// these match the in-line logic step-by-step and the tests pin the
// expected behaviour so we notice drift.

/**
 * Map Stripe subscription status string to the Fixpass-side
 * `subscriptions.status` value.
 */
export function normalizeStripeStatus(status: string): "active" | "cancelled" | "paused" {
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

/**
 * Derive the Fixpass billing cycle id from the Stripe recurring spec
 * when the checkout metadata didn't include `billing_cycle` explicitly.
 */
export function deriveBillingCycle(opts: {
  interval?: string | null;
  intervalCount?: number | null;
}): "3mo" | "6mo" | "1yr" {
  const interval = opts.interval ?? "month";
  const count = opts.intervalCount ?? 1;
  if (interval === "year") return "1yr";
  if (count === 6) return "6mo";
  if (count === 3) return "3mo";
  return "1yr";
}

/**
 * Classify a webhook handler error: should Stripe retry it (true) or
 * is it a semantic / data-shape error we won't recover from (false)?
 * Transient errors should bubble as 500 so Stripe re-delivers; the
 * rest should return 200 so we don't get a retry storm.
 */
export function isTransientError(err: unknown): boolean {
  const msg = ((err as { message?: string })?.message ?? "").toLowerCase();
  if (!msg) return false;
  if (msg.includes("violates")) return false; // PG constraint failure
  return (
    msg.includes("fetch failed") ||
    msg.includes("timeout") ||
    msg.includes("econn") ||
    msg.includes("network") ||
    msg.includes("eai_again") ||
    msg.includes("supabase")
  );
}
