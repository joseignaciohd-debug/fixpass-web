"use client";

// Subscribes to Supabase Realtime on `payment_events` for the signed-in
// user, then flips a toast when the webhook confirms the checkout.
// Mirrors the mobile app's `usePaymentEventListener`. If Realtime
// isn't reachable, the user still sees the welcome UI — the toast is
// an enhancement, not critical.
//
// Plus a SAFETY-NET poll every 5s for up to 90s: if the webhook is
// delayed or Realtime didn't deliver (or the row was inserted before
// the listener attached), we still re-render the server tree so
// /app/membership reflects the active status. This stops the welcome
// page from appearing to "hang forever" when the webhook is slow.

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/toast";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

const POLL_INTERVAL_MS = 5_000;
const POLL_MAX_MS = 90_000;

export function WelcomePaymentWatcher({ userId }: { userId: string }) {
  const router = useRouter();
  const toast = useToast();
  const firedRef = useRef(false);

  useEffect(() => {
    let supabase: ReturnType<typeof getSupabaseBrowserClient> | undefined;
    try {
      supabase = getSupabaseBrowserClient();
    } catch {
      return; // Env vars missing → skip watcher, welcome page still renders.
    }

    const fire = () => {
      if (firedRef.current) return;
      firedRef.current = true;
      toast.show("Membership confirmed!", "success");
      router.refresh();
    };

    // Realtime is best-effort. If .channel()/.subscribe() throws (transport
    // quirks, esp. on mobile Safari), the safety-net poll below still confirms
    // the payment — and a throw here must never bubble into React and crash
    // the welcome page for a customer who just paid.
    let channel: ReturnType<typeof supabase.channel> | undefined;
    try {
      channel = supabase
        .channel(`payment_events:user:${userId}`)
        .on(
          "postgres_changes",
          {
            event: "INSERT",
            schema: "public",
            table: "payment_events",
            filter: `user_id=eq.${userId}`,
          },
          () => fire(),
        )
        .subscribe();
    } catch {
      // Ignore — the poll is the safety net.
    }

    // Safety-net poll: check for a payment_events row directly in case
    // Realtime missed it (subscription race, network blip, etc.).
    const startedAt = Date.now();
    const poll = setInterval(async () => {
      if (firedRef.current) {
        clearInterval(poll);
        return;
      }
      if (Date.now() - startedAt > POLL_MAX_MS) {
        clearInterval(poll);
        return;
      }
      try {
        const { data } = await supabase!
          .from("payment_events")
          .select("id")
          .eq("user_id", userId)
          .limit(1)
          .maybeSingle();
        if (data?.id) fire();
      } catch {
        // Transient — keep polling until window expires.
      }
    }, POLL_INTERVAL_MS);

    return () => {
      clearInterval(poll);
      if (channel) supabase!.removeChannel(channel);
    };
  }, [userId, router, toast]);

  return null;
}
