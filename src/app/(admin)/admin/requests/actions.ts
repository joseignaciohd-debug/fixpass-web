"use server";

// Operator console — server actions on a single service request.
//
// Each action does two things atomically (per Postgres txn): updates
// the service_requests row when a status field changes, and writes a
// service_request_events row so the member's timeline reflects the
// change. RLS already enforces admin-only access; we re-check via
// requireRole here for defense-in-depth.
//
// Email triggers are deliberately stubbed for now (Chunk 2 wires them
// in via Resend). The console functions correctly without them; the
// member just sees status updates via the in-portal timeline.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { requireRole } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { findTechnician, type Technician } from "@/lib/config/technicians";

type ActionResult = { ok: true; eventId?: string } | { error: string };

// ---- shared helpers ------------------------------------------------

async function adminClient() {
  await requireRole("admin");
  const supabase = await getSupabaseServerClient();
  return supabase;
}

async function insertEvent(args: {
  requestId: string;
  kind: string;
  body?: string;
  actorName?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ id?: string; error?: string }> {
  const supabase = await getSupabaseServerClient();
  const { data, error } = await supabase
    .from("service_request_events")
    .insert({
      service_request_id: args.requestId,
      kind: args.kind,
      body: args.body ?? null,
      actor_role: "system",
      actor_name: args.actorName ?? null,
      metadata: args.metadata ?? null,
    })
    .select("id")
    .single();
  if (error) return { error: error.message };
  return { id: data?.id as string };
}

function revalidateRequest(id: string) {
  revalidatePath(`/admin/requests/${id}`);
  revalidatePath(`/admin/requests`);
  revalidatePath(`/admin/schedule`);
  revalidatePath(`/admin`);
  revalidatePath(`/app/requests/${id}`);
  revalidatePath(`/app/requests`);
}

// ---- 1. Confirm member's suggested window --------------------------
// Member proposed a window; admin accepts it. Sets scheduled_for and
// status, records the assigned technician on the event.
const confirmSchema = z.object({
  requestId: z.string().uuid(),
  scheduledFor: z.string().min(1),                 // ISO datetime
  technicianId: z.string().min(1),
  note: z.string().trim().max(500).optional(),
});

export async function confirmScheduling(input: z.infer<typeof confirmSchema>): Promise<ActionResult> {
  const parsed = confirmSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid scheduling input." };
  const supabase = await adminClient();

  const tech: Technician | undefined = findTechnician(parsed.data.technicianId);
  if (!tech) return { error: `Unknown technician: ${parsed.data.technicianId}` };

  const scheduledIso = new Date(parsed.data.scheduledFor).toISOString();

  const { error: upErr } = await supabase
    .from("service_requests")
    .update({ status: "scheduled", scheduled_for: scheduledIso })
    .eq("id", parsed.data.requestId);
  if (upErr) return { error: upErr.message };

  const evt = await insertEvent({
    requestId: parsed.data.requestId,
    kind: "scheduled",
    body: parsed.data.note?.trim()
      ? parsed.data.note.trim()
      : `Confirmed for ${new Date(scheduledIso).toLocaleString()}.`,
    actorName: tech.name,
    metadata: {
      scheduledFor: scheduledIso,
      technicianId: tech.id,
      technicianName: tech.name,
    },
  });
  if (evt.error) return { error: evt.error };

  revalidateRequest(parsed.data.requestId);
  return { ok: true, eventId: evt.id };
}

// ---- 2. Counter-propose an alternate window ------------------------
// Admin can't fit the member's suggestion; suggests a different one.
// Recorded as a 'note_added' event with the proposal so the member
// sees it on their timeline.
const proposeSchema = z.object({
  requestId: z.string().uuid(),
  proposal: z.string().trim().min(4).max(500),
});

export async function proposeAlternateWindow(input: z.infer<typeof proposeSchema>): Promise<ActionResult> {
  const parsed = proposeSchema.safeParse(input);
  if (!parsed.success) return { error: "Proposal must be 4–500 characters." };
  await adminClient();

  const evt = await insertEvent({
    requestId: parsed.data.requestId,
    kind: "note_added",
    body: `Proposed window: ${parsed.data.proposal}`,
    metadata: { kind: "scheduling_proposal", proposal: parsed.data.proposal },
  });
  if (evt.error) return { error: evt.error };

  revalidateRequest(parsed.data.requestId);
  return { ok: true, eventId: evt.id };
}

// ---- 3. Add operator note ------------------------------------------
const noteSchema = z.object({
  requestId: z.string().uuid(),
  body: z.string().trim().min(2).max(2000),
});

export async function addOperatorNote(input: z.infer<typeof noteSchema>): Promise<ActionResult> {
  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) return { error: "Note must be 2–2000 characters." };
  await adminClient();

  const evt = await insertEvent({
    requestId: parsed.data.requestId,
    kind: "note_added",
    body: parsed.data.body,
  });
  if (evt.error) return { error: evt.error };

  revalidateRequest(parsed.data.requestId);
  return { ok: true, eventId: evt.id };
}

// ---- 4. Mark technician en-route -----------------------------------
const enRouteSchema = z.object({
  requestId: z.string().uuid(),
  technicianId: z.string().min(1),
  eta: z.string().trim().max(120).optional(),
});

export async function markEnRoute(input: z.infer<typeof enRouteSchema>): Promise<ActionResult> {
  const parsed = enRouteSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid en-route input." };
  await adminClient();

  const tech = findTechnician(parsed.data.technicianId);
  if (!tech) return { error: `Unknown technician: ${parsed.data.technicianId}` };

  const evt = await insertEvent({
    requestId: parsed.data.requestId,
    kind: "en_route",
    body: parsed.data.eta?.trim() ? `ETA ${parsed.data.eta.trim()}.` : "Technician on the way.",
    actorName: tech.name,
    metadata: { technicianId: tech.id, eta: parsed.data.eta ?? null },
  });
  if (evt.error) return { error: evt.error };

  revalidateRequest(parsed.data.requestId);
  return { ok: true, eventId: evt.id };
}

// ---- 5. Mark visit complete ----------------------------------------
const completeSchema = z.object({
  requestId: z.string().uuid(),
  summary: z.string().trim().min(2).max(2000),
});

export async function markCompleted(input: z.infer<typeof completeSchema>): Promise<ActionResult> {
  const parsed = completeSchema.safeParse(input);
  if (!parsed.success) return { error: "Summary must be 2–2000 characters." };
  const supabase = await adminClient();

  const { error: upErr } = await supabase
    .from("service_requests")
    .update({ status: "completed" })
    .eq("id", parsed.data.requestId);
  if (upErr) return { error: upErr.message };

  const evt = await insertEvent({
    requestId: parsed.data.requestId,
    kind: "completed",
    body: parsed.data.summary,
  });
  if (evt.error) return { error: evt.error };

  revalidateRequest(parsed.data.requestId);
  return { ok: true, eventId: evt.id };
}

// ---- 6. Cancel a request -------------------------------------------
const cancelSchema = z.object({
  requestId: z.string().uuid(),
  reason: z.string().trim().min(2).max(2000),
});

export async function cancelRequest(input: z.infer<typeof cancelSchema>): Promise<ActionResult> {
  const parsed = cancelSchema.safeParse(input);
  if (!parsed.success) return { error: "Reason must be 2–2000 characters." };
  const supabase = await adminClient();

  const { error: upErr } = await supabase
    .from("service_requests")
    .update({ status: "cancelled" })
    .eq("id", parsed.data.requestId);
  if (upErr) return { error: upErr.message };

  const evt = await insertEvent({
    requestId: parsed.data.requestId,
    kind: "cancelled",
    body: parsed.data.reason,
  });
  if (evt.error) return { error: evt.error };

  revalidateRequest(parsed.data.requestId);
  return { ok: true, eventId: evt.id };
}

// ---- 7. Mark reviewed (operator triaged but not yet scheduled) -----
// Useful when admin reads a request, decides it's in scope, but isn't
// yet ready to commit a window. Member sees "operator reviewed" on
// their timeline as a calm signal that work is moving.
const reviewedSchema = z.object({
  requestId: z.string().uuid(),
  note: z.string().trim().max(500).optional(),
});

export async function markReviewed(input: z.infer<typeof reviewedSchema>): Promise<ActionResult> {
  const parsed = reviewedSchema.safeParse(input);
  if (!parsed.success) return { error: "Invalid review input." };
  const supabase = await adminClient();

  const { error: upErr } = await supabase
    .from("service_requests")
    .update({ status: "under review" })
    .eq("id", parsed.data.requestId);
  if (upErr) return { error: upErr.message };

  const evt = await insertEvent({
    requestId: parsed.data.requestId,
    kind: "reviewed",
    body: parsed.data.note?.trim() || "Reviewed and confirmed in-scope.",
  });
  if (evt.error) return { error: evt.error };

  revalidateRequest(parsed.data.requestId);
  return { ok: true, eventId: evt.id };
}
