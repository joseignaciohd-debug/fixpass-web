// Customer portal data — reads from Supabase with RLS. Graceful
// empty-state if the DB isn't configured so UI renders useful
// placeholders instead of crashing.

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type CustomerRequest = {
  id: string;
  title: string;
  description: string;
  status: string;
  area: string;
  preferredWindow: string;
  createdAt: string;
  scheduledFor: string | null;
};

export type CustomerNotification = {
  id: string;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
};

export type CustomerBilling = {
  id: string;
  amount: number;
  status: string;
  method: string;
  billedAt: string;
};

export type CustomerSnapshot = {
  user: { id: string; name: string; email: string; phone: string };
  plan: { id: string; name: string; monthlyPrice: number; maxLaborMinutes: number; maxRelatedTasks: number } | null;
  subscription: {
    status: string;
    billingCycle: string;
    visitsUsed: number;
    visitsRemaining: number | "Unlimited";
    renewalDate: string;
  } | null;
  property: { nickname: string; address: string; homeType: string; accessNotes: string } | null;
  requests: CustomerRequest[];
  notifications: CustomerNotification[];
  billing: CustomerBilling[];
};

/**
 * Empty snapshot for brand-new accounts or when DB read fails. All
 * portal pages should handle this shape without throwing.
 */
export function emptySnapshot(name: string, email: string): CustomerSnapshot {
  return {
    user: { id: "", name, email, phone: "" },
    plan: null,
    subscription: null,
    property: null,
    requests: [],
    notifications: [],
    billing: [],
  };
}

export async function getCustomerSnapshot(
  authUserId: string,
  fallback: { name: string; email: string },
): Promise<CustomerSnapshot> {
  try {
    const supabase = await getSupabaseServerClient();

    const { data: userRow } = await supabase
      .from("users")
      .select("id, email, full_name, phone")
      .eq("auth_user_id", authUserId)
      .maybeSingle();

    if (!userRow) return emptySnapshot(fallback.name, fallback.email);

    // Best-effort reads — missing tables just yield nulls/empty arrays.
    const [customerRes, subRes, propRes, reqRes, notifRes, billRes] = await Promise.all([
      supabase.from("customers").select("id").eq("user_id", userRow.id).maybeSingle(),
      supabase
        .from("subscriptions")
        .select(
          "status, billing_cycle, current_period_end, membership_plan_id, customer_id",
        )
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle(),
      supabase.from("properties").select("nickname, address_line1, city, state, postal_code, home_type, access_notes").limit(1).maybeSingle(),
      supabase
        .from("service_requests")
        .select("id, title, description, status, area, preferred_window, created_at, scheduled_for")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("notifications")
        .select("id, title, body, is_read, created_at")
        .order("created_at", { ascending: false })
        .limit(20),
      supabase
        .from("billing_records")
        .select("id, amount, status, method, billed_at")
        .order("billed_at", { ascending: false })
        .limit(10),
    ]);

    return {
      user: {
        id: userRow.id as string,
        name: (userRow.full_name as string) ?? fallback.name,
        email: (userRow.email as string) ?? fallback.email,
        phone: (userRow.phone as string) ?? "",
      },
      plan: null, // Plan name resolution needs a second query — done on pages that need it.
      subscription: subRes.data
        ? {
            status: (subRes.data.status as string) ?? "inactive",
            billingCycle: (subRes.data.billing_cycle as string) ?? "monthly",
            visitsUsed: 0,
            visitsRemaining: 0,
            renewalDate: subRes.data.current_period_end
              ? new Date(subRes.data.current_period_end as string).toLocaleDateString()
              : "—",
          }
        : null,
      property: propRes.data
        ? {
            nickname: (propRes.data.nickname as string) ?? "My home",
            address: [
              propRes.data.address_line1,
              propRes.data.city,
              propRes.data.state,
              propRes.data.postal_code,
            ]
              .filter(Boolean)
              .join(", "),
            homeType: (propRes.data.home_type as string) ?? "Home",
            accessNotes: (propRes.data.access_notes as string) ?? "",
          }
        : null,
      requests:
        (reqRes.data ?? []).map((r) => ({
          id: r.id as string,
          title: (r.title as string) ?? "Request",
          description: (r.description as string) ?? "",
          status: (r.status as string) ?? "pending",
          area: (r.area as string) ?? "",
          preferredWindow: (r.preferred_window as string) ?? "—",
          createdAt: r.created_at as string,
          scheduledFor: (r.scheduled_for as string) ?? null,
        })) ?? [],
      notifications:
        (notifRes.data ?? []).map((n) => ({
          id: n.id as string,
          title: (n.title as string) ?? "",
          body: (n.body as string) ?? "",
          isRead: Boolean(n.is_read),
          createdAt: n.created_at as string,
        })) ?? [],
      billing:
        (billRes.data ?? []).map((b) => ({
          id: b.id as string,
          amount: Number(b.amount ?? 0),
          status: (b.status as string) ?? "pending",
          method: (b.method as string) ?? "card",
          billedAt: b.billed_at as string,
        })) ?? [],
    };
  } catch {
    return emptySnapshot(fallback.name, fallback.email);
  }
}
