// OAuth callback for Supabase Auth (Google, Apple).
//
// signInWithOAuth() sends the user to the provider, and the provider
// returns them here with a one-time `code`. We exchange it for a
// session server-side (PKCE — the code verifier round-trips in a
// cookie set by the browser client), then redirect to `next`. The
// (app) layout finishes role-aware routing from there.
//
// Add this URL to the Supabase dashboard's Auth → URL Configuration
// redirect allow-list:
//   https://www.getfixpass.com/auth/callback
//   http://localhost:3000/auth/callback

import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  // Reject protocol-relative ("//evil.com") to close an open-redirect
  // hole — startsWith("/") alone would accept it because the leading
  // slash matches.
  const rawNext = url.searchParams.get("next") || "/app";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/app";

  // Provider-side denial (user hit "Cancel" on the consent screen)
  // arrives as ?error=access_denied with no code.
  if (!code) {
    return NextResponse.redirect(
      new URL("/sign-in?error=oauth_cancelled", request.url),
    );
  }

  let supabase;
  try {
    supabase = await getSupabaseServerClient();
  } catch {
    return NextResponse.redirect(
      new URL("/sign-in?error=config", request.url),
    );
  }

  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return NextResponse.redirect(
      new URL(
        `/sign-in?error=oauth&detail=${encodeURIComponent(error.message)}`,
        request.url,
      ),
    );
  }

  // Session cookies are set by the SSR client's setAll() callback
  // during the exchange; the redirect carries them forward.
  return NextResponse.redirect(new URL(next, request.url));
}
