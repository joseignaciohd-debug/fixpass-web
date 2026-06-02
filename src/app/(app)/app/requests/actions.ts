"use server";

// Server actions for /app/requests — keeps write-path on the server
// so RLS enforces ownership + nothing sneaks through from client code.

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { notifyOpsAndMemberOfRequest } from "@/lib/email/resend";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getVisitStatus, loadVisitSubscription } from "@/lib/repositories/visits";

const schema = z.object({
  title: z.string().trim().min(4).max(120),
  description: z.string().trim().min(10).max(2000),
  area: z.string().trim().max(120).optional().or(z.literal("")),
  preferredWindow: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
  // Storage paths already uploaded on the client. We don't validate
  // existence here — a separate batch job / trigger could do that.
  photoPaths: z.array(z.string().max(300)).max(3).optional(),
});

export async function createServiceRequest(input: unknown): Promise<{ error?: string; id?: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Validation failed." };

  const session = await getCurrentSession();
  if (!session) return { error: "Not signed in." };

  try {
    const supabase = await getSupabaseServerClient();

    // Look up customer + their default property + active subscription.
    // service_requests requires property_id + subscription_id (both
    // non-nullable per schema), so all three lookups have to succeed
    // before we can write the row.
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (!customer) {
      return { error: "No customer record yet — finish onboarding first." };
    }

    const [{ data: property }, subscription] = await Promise.all([
      supabase
        .from("properties")
        .select("id")
        .eq("customer_id", customer.id)
        .order("created_at", { ascending: true })
        .limit(1)
        .maybeSingle(),
      loadVisitSubscription(supabase, customer.id),
    ]);

    if (!property) {
      return { error: "Add a property to your account before submitting a request." };
    }
    if (!subscription) {
      return {
        error:
          "An active membership is required before submitting a request. Reactivate via the billing portal.",
      };
    }

    // Visit-limit gate (safety net behind the new-request page's check):
    // block when this billing month's covered visits are used up — counting
    // both completed and in-flight requests.
    const visits = await getVisitStatus(supabase, {
      customerId: customer.id,
      planCode: subscription.planCode,
      anchorISO: subscription.anchorISO,
    });
    if (visits.outOfVisits) {
      const resets = visits.resetsOn
        ? ` They reset on ${new Date(visits.resetsOn).toLocaleDateString()}.`
        : "";
      return {
        error: `You've used all ${visits.included} covered visit${visits.included === 1 ? "" : "s"} for this billing month.${resets}`,
      };
    }

    // Column names per the canonical schema (types.ts):
    //   request_status (not 'status'), internal_notes (not 'notes').
    const { data, error } = await supabase
      .from("service_requests")
      .insert({
        customer_id: customer.id,
        property_id: property.id,
        subscription_id: subscription.id,
        title: parsed.data.title,
        description: parsed.data.description,
        area: parsed.data.area || null,
        preferred_window: parsed.data.preferredWindow || null,
        internal_notes: parsed.data.notes || null,
        request_status: "pending",
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    // Persist photo paths in service_request_photos. Non-fatal — if
    // this table doesn't exist or RLS blocks, we still succeed on the
    // base request so the user flow isn't stuck.
    //
    // SECURITY: every submitted path must start with this user's
    // auth.uid() prefix. The upload UI enforces this already, but a
    // crafted POST could submit another user's path and we'd attach
    // it to the new request, exposing it via signed URLs on the
    // detail page. The storage RLS *also* gates download by prefix,
    // but defence-in-depth: reject the path here.
    const prefix = `${session.authUserId}/`;
    const photoPaths = (parsed.data.photoPaths ?? []).filter((p) => p.startsWith(prefix));
    if (photoPaths.length > 0 && data?.id) {
      // service_request_photos schema: id, service_request_id,
       // storage_path, photo_kind, created_at — uploader_id is not a
       // column, so we drop it. The bucket RLS already pins the file
       // path to auth.uid(), which serves the same audit purpose.
      const { error: photoErr } = await supabase.from("service_request_photos").insert(
        photoPaths.map((path) => ({
          service_request_id: data.id,
          storage_path: path,
        })),
      );
      if (photoErr) {
        console.warn("[new-request] photo row insert failed", photoErr.message);
      }
    }

    // Member-facing notification so /app/inbox shows the submission.
    // Non-fatal — the request itself succeeds even if notifications
    // is misconfigured.
    try {
      await supabase.from("notifications").insert({
        user_id: session.authUserId,
        title: "Request received",
        body: `We've got your request "${parsed.data.title}". Operations reviews within 24h.`,
        is_read: false,
        request_id: data.id,
      });
    } catch (notifyErr) {
      console.warn("[new-request] notification insert failed", notifyErr);
    }

    // Fire-and-forget email: confirmation to the member + lead to ops.
    // Best-effort — if Resend isn't configured it silently no-ops.
    try {
      const h = await headers();
      const host = h.get("x-forwarded-host") ?? h.get("host") ?? "www.getfixpass.com";
      const proto = h.get("x-forwarded-proto") ?? "https";
      const siteOrigin = `${proto}://${host}`;
      await notifyOpsAndMemberOfRequest({
        memberName: session.name,
        memberEmail: session.email,
        requestId: data.id as string,
        title: parsed.data.title,
        description: parsed.data.description,
        area: parsed.data.area || undefined,
        preferredWindow: parsed.data.preferredWindow || undefined,
        siteOrigin,
      });
    } catch (mailErr) {
      console.warn("[new-request] email notify failed", mailErr);
    }

    revalidatePath("/app/requests");
    revalidatePath("/app/inbox");
    revalidatePath("/app");
    return { id: data.id as string };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}
