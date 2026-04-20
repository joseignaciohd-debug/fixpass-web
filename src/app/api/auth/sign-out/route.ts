// Server-side sign-out. Wipes the Supabase session cookie + clears
// PostHog identity on the next client render.

import { NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  try {
    const supabase = await getSupabaseServerClient();
    await supabase.auth.signOut();
  } catch {
    // If Supabase is not configured or fails, fall through — we still
    // redirect the user to /sign-in so they don't get stuck.
  }

  const url = new URL("/sign-in", request.url);
  return NextResponse.redirect(url, { status: 303 });
}

export async function GET(request: Request) {
  // Allow GET for convenience (nav from a broken session).
  return POST(request);
}
