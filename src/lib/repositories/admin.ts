// Admin ops data — KPI metrics, queue summary, request list, customer
// watchlist. Reads from Supabase with graceful empty-state fallback.

import { getSupabaseServerClient } from "@/lib/supabase/server";

export type AdminMetrics = {
  activeMembers: number;
  mrr: number;
  outstandingRevenue: number;
  quoteOpportunities: number;
  fairUseCount: number;
  averageLaborMinutes: number;
  coveredRequests: number;
};

export type QueueSummary = {
  newIntake: number;
  needsScheduling: number;
  quoteReview: number;
  fairUseReview: number;
  unassigned: number;
};

export type AdminRequest = {
  id: string;
  title: string;
  status: string;
  customerName: string;
  planName: string;
  category: string;
  area: string;
  preferredWindow: string;
  scheduledFor: string | null;
  assignedTechnicianName: string | null;
  notes: string;
  address: string;
};

export type AdminCustomer = {
  id: string;
  name: string;
  email: string;
  propertyLabel: string;
  planName: string;
  billingCycle: string;
  status: string;
  revenueLabel: string;
  openRequestCount: number;
  requestCount: number;
  visitsLabel: string;
  fairUseOpen: number;
  attention: "Healthy" | "Watch";
};

export type AdminSnapshot = {
  metrics: AdminMetrics;
  queueSummary: QueueSummary;
  requests: AdminRequest[];
  customers: AdminCustomer[];
  source: "live" | "empty";
};

const emptyMetrics: AdminMetrics = {
  activeMembers: 0,
  mrr: 0,
  outstandingRevenue: 0,
  quoteOpportunities: 0,
  fairUseCount: 0,
  averageLaborMinutes: 0,
  coveredRequests: 0,
};

const emptyQueue: QueueSummary = {
  newIntake: 0,
  needsScheduling: 0,
  quoteReview: 0,
  fairUseReview: 0,
  unassigned: 0,
};

export async function getAdminSnapshot(): Promise<AdminSnapshot> {
  try {
    const supabase = await getSupabaseServerClient();

    const [{ count: activeMembers }, { data: subs }, { data: requests }] = await Promise.all([
      supabase.from("subscriptions").select("id", { count: "exact", head: true }).eq("status", "active"),
      supabase.from("subscriptions").select("id, status").limit(500),
      supabase
        .from("service_requests")
        .select(
          // PostgREST aliasing — service_requests.status doesn't exist;
          // canonical columns are request_status + internal_notes. Alias
          // back so downstream readers keep using r.status / r.notes.
          "id, title, description, status:request_status, area, preferred_window, scheduled_for, notes:internal_notes, category",
        )
        .order("created_at", { ascending: false })
        .limit(50),
    ]);

    const reqs = (requests ?? []).map((r): AdminRequest => ({
      id: r.id as string,
      title: (r.title as string) ?? "Request",
      status: (r.status as string) ?? "pending",
      customerName: "—",
      planName: "—",
      category: (r.category as string) ?? "covered",
      area: (r.area as string) ?? "",
      preferredWindow: (r.preferred_window as string) ?? "—",
      scheduledFor: (r.scheduled_for as string) ?? null,
      assignedTechnicianName: null,
      notes: (r.notes as string) ?? "",
      address: "",
    }));

    const queue: QueueSummary = {
      newIntake: reqs.filter((r) => r.status.toLowerCase() === "pending").length,
      needsScheduling: reqs.filter((r) => r.status.toLowerCase() === "under review").length,
      quoteReview: reqs.filter((r) => r.status.toLowerCase() === "quoted separately").length,
      fairUseReview: 0,
      unassigned: reqs.filter((r) => !r.assignedTechnicianName && r.status.toLowerCase() !== "completed").length,
    };

    return {
      metrics: {
        ...emptyMetrics,
        activeMembers: activeMembers ?? 0,
        coveredRequests: reqs.filter((r) => r.category === "covered").length,
        quoteOpportunities: queue.quoteReview,
      },
      queueSummary: queue,
      requests: reqs,
      customers: [],
      source: subs ? "live" : "empty",
    };
  } catch {
    return {
      metrics: emptyMetrics,
      queueSummary: emptyQueue,
      requests: [],
      customers: [],
      source: "empty",
    };
  }
}
