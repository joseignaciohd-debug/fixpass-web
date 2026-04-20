"use server";

// Server actions for /app/requests — keeps write-path on the server
// so RLS enforces ownership + nothing sneaks through from client code.

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const schema = z.object({
  title: z.string().trim().min(4).max(120),
  description: z.string().trim().min(10).max(2000),
  area: z.string().trim().max(120).optional().or(z.literal("")),
  preferredWindow: z.string().trim().max(120).optional().or(z.literal("")),
  notes: z.string().trim().max(1000).optional().or(z.literal("")),
});

export async function createServiceRequest(input: unknown): Promise<{ error?: string; id?: string }> {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { error: "Validation failed." };

  const session = await getCurrentSession();
  if (!session) return { error: "Not signed in." };

  try {
    const supabase = await getSupabaseServerClient();

    // Look up the customer row tied to this user.
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (!customer) {
      return { error: "No customer record yet — finish onboarding first." };
    }

    const { data, error } = await supabase
      .from("service_requests")
      .insert({
        customer_id: customer.id,
        title: parsed.data.title,
        description: parsed.data.description,
        area: parsed.data.area || null,
        preferred_window: parsed.data.preferredWindow || null,
        notes: parsed.data.notes || null,
        status: "pending",
      })
      .select("id")
      .single();

    if (error) return { error: error.message };

    revalidatePath("/app/requests");
    revalidatePath("/app");
    return { id: data.id as string };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}
