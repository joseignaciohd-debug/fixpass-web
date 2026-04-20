// Stripe Customer Portal — opens Stripe's managed billing UI where
// members can update cards, view invoices, or cancel.

import { NextResponse } from "next/server";
import Stripe from "stripe";
import { getCurrentSession } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const session = await getCurrentSession();
  if (!session) return NextResponse.redirect(new URL("/sign-in", request.url), { status: 303 });

  const stripeKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeKey) {
    return NextResponse.json(
      { error: "Stripe is not configured yet." },
      { status: 503 },
    );
  }

  try {
    const supabase = await getSupabaseServerClient();
    const { data: customer } = await supabase
      .from("customers")
      .select("id")
      .eq("user_id", session.userId)
      .maybeSingle();

    if (!customer) {
      return NextResponse.redirect(new URL("/app/subscribe", request.url), { status: 303 });
    }

    const { data: sub } = await supabase
      .from("subscriptions")
      .select("stripe_customer_id")
      .eq("customer_id", customer.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    const stripeCustomerId = sub?.stripe_customer_id as string | undefined;
    if (!stripeCustomerId) {
      // No Stripe customer yet — punt to checkout flow.
      return NextResponse.redirect(new URL("/app/subscribe", request.url), { status: 303 });
    }

    const stripe = new Stripe(stripeKey);
    const portal = await stripe.billingPortal.sessions.create({
      customer: stripeCustomerId,
      return_url: new URL("/app/membership", request.url).toString(),
    });

    return NextResponse.redirect(portal.url, { status: 303 });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Unexpected error." },
      { status: 500 },
    );
  }
}
