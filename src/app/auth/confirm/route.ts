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
//
// Edge case: mail clients (Gmail, Outlook, corporate spam filters)
// pre-fetch links to scan them, which consumes the single-use OTP
// before the user clicks. We detect "already used / expired" errors
// and check whether the user already has a valid session before
// surfacing an error — in many cases they do (verifyOtp was actually
// successful, just on a different device or earlier scan).

import { type EmailOtpType } from "@supabase/supabase-js";
import { type NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const tokenHash = url.searchParams.get("token_hash");
  const type = url.searchParams.get("type") as EmailOtpType | null;
  // Reject protocol-relative ("//evil.com") to close an open-redirect
  // hole — startsWith("/") alone would accept it because the leading
  // slash matches.
  const rawNext = url.searchParams.get("next") || "/app";
  const next = rawNext.startsWith("/") && !rawNext.startsWith("//") ? rawNext : "/app";

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
    // verifyOtp failed. Two real-world causes:
    //  1. Link genuinely expired (>1h) or never valid.
    //  2. Mail-client pre-fetcher already consumed it; the actual
    //     human has been confirmed and may already have a session.
    // For (2), if there's an existing valid session, just send them
    // through — the link did its job. Otherwise show the friendly
    // resend page on /sign-in.
    try {
      const { data } = await supabase.auth.getUser();
      if (data.user) {
        const safeNext = next; // already sanitized at the top of the handler
        return NextResponse.redirect(new URL(safeNext, request.url));
      }
    } catch {
      /* fall through */
    }
    return NextResponse.redirect(
      new URL(
        `/sign-in?error=confirm_expired&detail=${encodeURIComponent(error.message)}`,
        request.url,
      ),
    );
  }

  // Verified. Cookies are set by the SSR client's setAll() callback
  // during verifyOtp; the redirect carries them forward.
  const safeNext = next; // already sanitized at the top of the handler
  return NextResponse.redirect(new URL(safeNext, request.url));
}
