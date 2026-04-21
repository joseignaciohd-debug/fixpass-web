"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";

const markSchema = z.object({ id: z.string().uuid() });
const markAllSchema = z.object({ ids: z.array(z.string().uuid()).max(100) });

export async function markNotificationRead(input: unknown) {
  const parsed = markSchema.safeParse(input);
  if (!parsed.success) return { error: "Bad input." };

  const session = await getCurrentSession();
  if (!session) return { error: "Not signed in." };

  try {
    const supabase = await getSupabaseServerClient();
    // RLS: users can only update their own notifications; we don't
    // need to filter by user_id here since the policy enforces it.
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", parsed.data.id);
    if (error) return { error: error.message };
    revalidatePath("/app/inbox");
    revalidatePath("/app");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}

export async function markAllNotificationsRead(input: unknown) {
  const parsed = markAllSchema.safeParse(input);
  if (!parsed.success) return { error: "Bad input." };
  if (parsed.data.ids.length === 0) return { ok: true };

  const session = await getCurrentSession();
  if (!session) return { error: "Not signed in." };

  try {
    const supabase = await getSupabaseServerClient();
    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .in("id", parsed.data.ids);
    if (error) return { error: error.message };
    revalidatePath("/app/inbox");
    revalidatePath("/app");
    return { ok: true };
  } catch (err) {
    return { error: err instanceof Error ? err.message : "Unexpected error." };
  }
}
