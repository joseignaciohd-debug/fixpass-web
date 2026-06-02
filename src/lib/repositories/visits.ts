// Visit allowance + usage. A member's covered visits per month come from
// the plan's `includedVisits` in site-data.ts (the same numbers the
// marketing site shows — single source of truth, no DB denormalization).
//
// Usage model (product decisions, 2026-06):
//   - The allowance resets monthly, anchored to the subscription's start
//     DAY — paid on Jun 10 => resets Jul 10, Aug 10, ... (NOT calendar
//     month). See `monthlyPeriod`.
//   - A visit "slot" is consumed by any request that is COMPLETED in the
//     current monthly window OR still IN FLIGHT (open). So a Silver member
//     (1/mo) can't queue a second request until the first resolves.
//   - Completion is recorded by the admin "mark complete" action, which
//     writes a `completed` event we count by timestamp — no schema change.
//
// `unlimited` is kept as a concept for safety/forward-compat, but no
// current plan is unlimited. Unknown plan codes fail OPEN (never block).

import type { SupabaseClient } from "@supabase/supabase-js";
import { plans, type PlanId } from "@/lib/config/site-data";

// Request statuses that still occupy a visit slot (non-terminal). Mirrors
// service_requests.request_status in the canonical schema. Terminal
// statuses that do NOT consume a slot: completed (counted separately by
// completion date), quoted separately, declined, cancelled.
export const OPEN_REQUEST_STATUSES = [
  "pending",
  "under review",
  "scheduled",
  "technician assigned",
  "in progress",
] as const;

export type VisitStatus = {
  planCode: string | null;
  included: number | null; // null => unlimited / unknown
  unlimited: boolean;
  used: number;
  remaining: number | "Unlimited";
  outOfVisits: boolean;
  // ISO date the allowance next resets (start of the next monthly window).
  resetsOn: string | null;
};

// Add `n` whole months to a UTC date, clamping the day to the target
// month's length (Jan 31 + 1mo => Feb 28/29).
function addMonthsUTC(date: Date, n: number): Date {
  const day = date.getUTCDate();
  const target = new Date(
    Date.UTC(
      date.getUTCFullYear(),
      date.getUTCMonth() + n,
      1,
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
    ),
  );
  const daysInMonth = new Date(
    Date.UTC(target.getUTCFullYear(), target.getUTCMonth() + 1, 0),
  ).getUTCDate();
  target.setUTCDate(Math.min(day, daysInMonth));
  return target;
}

// The current monthly window [start, end) anchored to the subscription
// start day. Pure + exported for testing.
export function monthlyPeriod(anchor: Date, now: Date): { start: Date; end: Date } {
  if (now <= anchor) {
    return { start: anchor, end: addMonthsUTC(anchor, 1) };
  }
  let months =
    (now.getUTCFullYear() - anchor.getUTCFullYear()) * 12 +
    (now.getUTCMonth() - anchor.getUTCMonth());
  let start = addMonthsUTC(anchor, months);
  if (start > now) {
    months -= 1;
    start = addMonthsUTC(anchor, months);
  }
  return { start, end: addMonthsUTC(anchor, months + 1) };
}

// Resolve a plan's monthly visit allowance from its code via site-data.
// Pure + exported for testing.
export function allowanceForCode(code: string | null): { included: number | null; unlimited: boolean } {
  const plan = plans.find((p) => p.id === (code as PlanId));
  if (!plan) return { included: null, unlimited: true }; // unknown => fail open
  return typeof plan.includedVisits === "number"
    ? { included: plan.includedVisits, unlimited: false }
    : { included: null, unlimited: true };
}

// Combine allowance with raw counts into a usage verdict. Pure + tested.
export function computeUsage(args: {
  included: number | null;
  unlimited: boolean;
  openCount: number;
  completedThisPeriod: number;
}): { used: number; remaining: number | "Unlimited"; outOfVisits: boolean } {
  const used = args.openCount + args.completedThisPeriod;
  if (args.unlimited || args.included === null) {
    return { used, remaining: "Unlimited", outOfVisits: false };
  }
  const remaining = Math.max(0, args.included - used);
  return { used, remaining, outOfVisits: used >= args.included };
}

/**
 * Compute a member's live visit status. Counts open requests + requests
 * completed within the current monthly window. Scoped to the customer
 * (RLS also restricts to their own rows). Reads are best-effort: on query
 * error we fail OPEN (treat as visits available) so a transient DB issue
 * never wrongly locks a paying member out.
 */
export async function getVisitStatus(
  supabase: SupabaseClient,
  args: { customerId: string; planCode: string | null; anchorISO: string | null; now?: Date },
): Promise<VisitStatus> {
  const { customerId, planCode, anchorISO } = args;
  const { included, unlimited } = allowanceForCode(planCode);

  if (unlimited || included === null) {
    return {
      planCode,
      included,
      unlimited: true,
      used: 0,
      remaining: "Unlimited",
      outOfVisits: false,
      resetsOn: null,
    };
  }

  const now = args.now ?? new Date();
  const anchor = anchorISO ? new Date(anchorISO) : now;
  const period = monthlyPeriod(anchor, now);

  const [openRes, completedRes] = await Promise.all([
    // In-flight requests occupying a slot right now.
    supabase
      .from("service_requests")
      .select("id", { count: "exact", head: true })
      .eq("customer_id", customerId)
      .in("request_status", OPEN_REQUEST_STATUSES as unknown as string[]),
    // Requests completed inside the current monthly window. Completion
    // time lives on the `completed` event (no completed_at column).
    supabase
      .from("service_request_events")
      .select("service_request_id, service_requests!inner(customer_id)")
      .eq("kind", "completed")
      .eq("service_requests.customer_id", customerId)
      .gte("created_at", period.start.toISOString())
      .lt("created_at", period.end.toISOString()),
  ]);

  const openCount = openRes.count ?? 0;
  // Dedupe by request id in case a request was completed more than once.
  const completedThisPeriod = new Set(
    (completedRes.data ?? []).map((r) => (r as { service_request_id: string }).service_request_id),
  ).size;

  const { used, remaining, outOfVisits } = computeUsage({
    included,
    unlimited: false,
    openCount,
    completedThisPeriod,
  });

  return {
    planCode,
    included,
    unlimited: false,
    used,
    remaining,
    outOfVisits,
    resetsOn: period.end.toISOString(),
  };
}

/**
 * Look up a membership plan's `code` (silver/gold/platinum) by id. Done as
 * an explicit second query rather than a PostgREST embed because the
 * subscriptions->membership_plans foreign-key relationship isn't exposed
 * to PostgREST (generated types show no relationship), so an embed would
 * error the parent query. membership_plans is readable by authenticated
 * members (RLS: active plans), so this works in member context.
 */
export async function resolvePlanCode(
  supabase: SupabaseClient,
  membershipPlanId: string | null | undefined,
): Promise<string | null> {
  if (!membershipPlanId) return null;
  const { data } = await supabase
    .from("membership_plans")
    .select("code")
    .eq("id", membershipPlanId)
    .maybeSingle();
  return (data?.code as string) ?? null;
}

/**
 * Load the member's active subscription with the fields needed to compute
 * visit status: the plan `code` (for allowance) and the start date (for the
 * monthly anchor). Returns null if there's no active subscription.
 */
export async function loadVisitSubscription(
  supabase: SupabaseClient,
  customerId: string,
): Promise<{ id: string; planCode: string | null; anchorISO: string | null } | null> {
  const { data } = await supabase
    .from("subscriptions")
    .select("id, current_period_start, created_at, membership_plan_id")
    .eq("customer_id", customerId)
    .eq("status", "active")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!data) return null;
  const planCode = await resolvePlanCode(supabase, data.membership_plan_id as string | null);
  return {
    id: data.id as string,
    planCode,
    anchorISO: (data.current_period_start as string) ?? (data.created_at as string) ?? null,
  };
}
