"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";

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

    // Resolve customer id for this user.
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (!customer) return { error: "No customer record yet — finish onboarding first." };

    // Upsert the single property tied to this customer.
    const { data: existing } = await supabase
      .from("properties")
      .select("id")
      .eq("customer_id", customer.id)
      .maybeSingle();

    const payload = {
      customer_id: customer.id,
      nickname: parsed.data.nickname,
      address_line1: parsed.data.addressLine1,
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
