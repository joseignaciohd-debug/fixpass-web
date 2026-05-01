// Email-confirmation callback for Supabase Auth.
//
// When a member signs up with email confirmation enabled, Supabase
// sends a "Confirm your email" link with a token_hash + type. The link
// points to this route. We verify the OTP server-side, set the session
// cookies via the SSR client, and then redirect to /app — the layout
// finishes the role-aware routing from there.
//
// Configure the Supabase project's email template "Confirmation URL"
// to:
//   {{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
//
// Other types (recovery, email_change, invite) route here too with
// `type` set accordingly.

import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  const next = url.searchParams.get("next") || "/app";

  if (!tokenHash || !type) {
    return NextResponse.redirect(
      new URL("/sign-in?error=confirm_invalid", request.url),
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

  const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });

  if (error) {
    // Most common case: link expired or already used.
    return NextResponse.redirect(
      new URL(
        `/sign-in?error=confirm_expired&detail=${encodeURIComponent(error.message)}`,
        request.url,
      ),
    );
  }

  // Verified. Cookies are set by the SSR client's setAll() callback
  // during verifyOtp; the redirect carries them forward.
  const safeNext = next.startsWith("/") ? next : "/app";
  return NextResponse.redirect(new URL(safeNext, request.url));
}
