import { redirect } from "next/navigation";
import { CalendarClock, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { NewRequestForm } from "@/components/forms/new-request-form";
import { requireSession } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { getVisitStatus, loadVisitSubscription, type VisitStatus } from "@/lib/repositories/visits";

export const dynamic = "force-dynamic";

export default async function NewRequestPage() {
  const session = await requireSession("/app/requests/new");
  const supabase = await getSupabaseServerClient();

  // Visit status is computed during the gate below and reused for the
  // render branch, so it lives at function scope.
  let visits: VisitStatus | null = null;

  // Pre-emptive gates — bounce members without a paid plan to /plans
  // BEFORE the form renders, so they don't fill it out only to fail at
  // submit. Mirrors createServiceRequest; this is the front-line check,
  // the action is the safety net.
  //
  // Accepts status in ('active','trialing'). Cancelled / past_due /
  // paused / incomplete all bounce.
  try {
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (!customer) {
      // No customer row → onboarding incomplete, send to welcome.
      redirect("/app/welcome");
    }

    const subscription = await loadVisitSubscription(supabase, customer.id);
    if (!subscription) {
      redirect("/plans?intent=new-request");
    }

    visits = await getVisitStatus(supabase, {
      customerId: customer.id,
      planCode: subscription.planCode,
      anchorISO: subscription.anchorISO,
    });
  } catch (err) {
    // Next 13+ marks redirect signals via `digest` (starting with
    // "NEXT_REDIRECT"), NOT `message`. Re-throw on either marker so we
    // don't depend on which Next internal we happen to be running.
    const isRedirect =
      typeof (err as { digest?: unknown }).digest === "string" &&
      (err as { digest: string }).digest.startsWith("NEXT_REDIRECT");
    if (isRedirect || (err instanceof Error && err.message === "NEXT_REDIRECT")) {
      throw err;
    }
    // Any other error: fail open so a transient DB issue doesn't lock a
    // paying member out of requesting. `visits` stays null → form renders.
  }

  // Out of covered visits this billing month — show an explicit sign
  // instead of the form.
  if (visits?.outOfVisits) {
    return <OutOfVisits visits={visits} />;
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
        {typeof visits?.remaining === "number" ? (
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-border bg-canvas-elevated px-3 py-1.5 text-xs font-semibold text-ink-muted">
            <CalendarClock size={14} className="text-royal" />
            {visits.remaining} of {visits.included} covered visit{visits.included === 1 ? "" : "s"} left this month
          </p>
        ) : null}
      </Card>

      <Card>
        {/* Photo storage bucket RLS pins paths to auth.uid(), so pass
            authUserId here, not the public.users.id. */}
        <NewRequestForm userId={session.authUserId} />
      </Card>
    </div>
  );
}

function OutOfVisits({ visits }: { visits: VisitStatus }) {
  const resetDate = visits.resetsOn
    ? new Date(visits.resetsOn).toLocaleDateString(undefined, {
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <div className="space-y-6">
      <Card animate={false}>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-honey-soft text-cream-ink">
          <Lock className="h-5 w-5" />
        </div>
        <p className="eyebrow mt-5">No visits left this month</p>
        <h1 className="display-section mt-2 text-3xl text-ink">
          You&apos;ve used all {visits.included} covered visit{visits.included === 1 ? "" : "s"} this month.
        </h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted">
          That includes visits we&apos;ve completed and any request still in progress.
          {resetDate ? ` Your covered visits reset on ${resetDate}.` : ""} You can still browse your
          past requests and account in the meantime.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Button href="/app/requests" variant="secondary">
            View my requests
          </Button>
          <Button href="/plans">Upgrade my plan</Button>
        </div>
      </Card>

      <Card variant="muted" animate={false}>
        <p className="text-sm leading-7 text-ink-muted">
          Have something urgent that can&apos;t wait for the reset? Email{" "}
          <a href="mailto:hello@getfixpass.com" className="font-semibold text-royal underline">
            hello@getfixpass.com
          </a>{" "}
          and an operator will help you sort out the next step.
        </p>
      </Card>
    </div>
  );
}
