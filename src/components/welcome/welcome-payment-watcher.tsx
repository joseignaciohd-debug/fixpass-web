"use client";

// Subscribes to Supabase Realtime on `payment_events` for the signed-in
// user, then flips a toast when the webhook confirms the checkout.
// Mirrors the mobile app's `usePaymentEventListener`. If Realtime
// isn't reachable, the user still sees the welcome UI — the toast is
// an enhancement, not critical.

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function WelcomePaymentWatcher({ userId }: { userId: string }) {
  const router = useRouter();
  const toast = useToast();

  useEffect(() => {
    let supabase;
    try {
      supabase = getSupabaseBrowserClient();
    } catch {
      return; // Env vars missing → skip watcher, welcome page still renders.
    }

    const channel = supabase
      .channel(`payment_events:user:${userId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "payment_events",
          filter: `user_id=eq.${userId}`,
        },
        () => {
          toast.show("Membership confirmed!", "success");
          // Refresh server components so /app/membership shows active status.
          router.refresh();
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, router, toast]);

  return null;
}
