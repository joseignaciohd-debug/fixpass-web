"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { getSupabaseServerClient, getSupabaseServiceRoleClient } from "@/lib/supabase/server";

const schema = z.object({
  nickname: z.string().trim().min(1).max(60),
  addressLine1: z.string().trim().min(1).max(120),
  city: z.string().trim().min(1).max(80),
  state: z.string().trim().length(2),
  postalCode: z.string().trim().regex(/^\d{5}(-\d{4})?$/),
  homeType: z.string().trim().max(40).optional().or(z.literal("")),
  accessNotes: z.string().trim().max(400).optional().or(z.literal("")),
});

export async function saveProperty(input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Validation failed." };

  const session = await getCurrentSession();
  if (!session) return { error: "Not signed in." };

  try {
    const supabase = await getSupabaseServerClient();

    // Resolve customer id for this user. Auto-create the row if it
    // doesn't exist yet — a member can land on /app/property between
    // email-confirm and Stripe webhook firing, and we don't want to
    // dead-end them with "finish onboarding first" when the only
    // thing missing is a CRM-side bookkeeping row that we own.
    let { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (!customer) {
      try {
        const admin = getSupabaseServiceRoleClient();
        const { data: created } = await admin
          .from("customers")
          .insert({ user_id: session.userId })
          .select("id")
          .maybeSingle();
        customer = created;
        if (!customer) {
          // Race — another request inserted first; re-read.
          const { data: refetched } = await supabase
            .from("customers")
            .select("id")
            .eq("user_id", session.userId)
            .maybeSingle();
          customer = refetched;
        }
      } catch (err) {
        console.warn("[property] customer auto-create skipped", err);
      }
    }

    if (!customer) return { error: "Could not link your account. Try again in a moment." };

    // Upsert the single property tied to this customer.
    const { data: existing } = await supabase
      .from("properties")
      .select("id")
      .eq("customer_id", customer.id)
      .maybeSingle();

    const payload = {
      customer_id: customer.id,
      nickname: parsed.data.nickname,
      address_line_1: parsed.data.addressLine1,
      city: parsed.data.city,
      state: parsed.data.state.toUpperCase(),
      postal_code: parsed.data.postalCode,
      home_type: parsed.data.homeType || null,
      access_notes: parsed.data.accessNotes || null,
    };

    if (existing?.id) {
      const { error } = await supabase.from("properties").update(payload).eq("id", existing.id);
      if (error) return { error: error.message };
    } else {
      const { error } = await supabase.from("properties").insert(payload);
      if (error) return { error: error.message };
    }

    revalidatePath("/app/property");
    revalidatePath("/app");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}
