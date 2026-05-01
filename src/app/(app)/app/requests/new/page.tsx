import { redirect } from "next/navigation";
import { Card } from "@/components/ui/card";
import { NewRequestForm } from "@/components/forms/new-request-form";
import { requireSession } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function NewRequestPage() {
  const session = await requireSession("/app/requests/new");

  // Pre-emptive subscription gate — bounce members without a paid plan
  // to /plans BEFORE the form renders, so they don't fill it out only
  // to fail at submit. Mirrors the validation in createServiceRequest;
  // this is the front-line check, the action is the safety net.
  //
  // Accepts status in ('active','trialing'). 'active' covers Stripe-
  // confirmed members; 'trialing' covers a future free-trial case.
  // Cancelled / past_due / paused / incomplete all bounce.
  try {
    const supabase = await getSupabaseServerClient();
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (!customer) {
      // No customer row → onboarding incomplete, send to welcome.
      redirect("/app/welcome");
    }

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("status")
      .eq("customer_id", customer.id)
      .in("status", ["active", "trialing"])
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!sub) {
      redirect("/plans?intent=new-request");
    }
  } catch (err) {
    // Don't swallow Next's redirect signal — re-throw so the redirect
    // actually fires. Other errors (DB unreachable etc.) fall through
    // to render the form and rely on the action gate as backup.
    if (err instanceof Error && err.message === "NEXT_REDIRECT") throw err;
  }

  return (
    <div className="space-y-6">
      <Card animate={false}>
        <p className="eyebrow">New request</p>
        <h1 className="display-section mt-2 text-3xl text-ink">Tell us what needs fixing.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted">
          Covered visits work best for up to 3 related small tasks in one area, or one moderately sized
          covered job. An operator reviews before anything gets scheduled.
        </p>
      </Card>

      <Card>
        <NewRequestForm userId={session.userId} />
      </Card>
    </div>
  );
}
