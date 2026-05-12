// Server-side auth helpers — fetch the current session + resolved role
// so Server Components + Route Handlers can gate content without
// rerolling the same Supabase calls.

import { redirect } from "next/navigation";
import { getSupabaseServerClient, getSupabaseServiceRoleClient } from "@/lib/supabase/server";

export type Role = "customer" | "technician" | "admin";

export type AppSession = {
  userId: string;
  /** auth.users.id — needed for Realtime filters + payment_events lookups. */
  authUserId: string;
  email: string;
  name: string;
  role: Role;
};

/**
 * Returns the current session or null. Reads the user row from
 * `public.users` to resolve role. RLS on that table allows users
 * to read their own row.
 *
 * Auto-provisions the public.users row if missing — covers signups
 * that happened before the Supabase auth trigger was installed (or
 * without one at all). Without this, freshly-confirmed users hit a
 * redirect loop because every server page sees null.
 *
 * Resilient to transient Supabase errors: catches throws from
 * auth.getUser() so a downed Supabase doesn't crash every server
 * component on the site.
 */
export async function getCurrentSession(): Promise<AppSession | null> {
  let supabase;
  try {
    supabase = await getSupabaseServerClient();
  } catch {
    // Supabase not configured yet — treat as signed-out.
    return null;
  }

  let user;
  try {
    const result = await supabase.auth.getUser();
    user = result.data.user;
  } catch (err) {
    console.warn("[session] auth.getUser threw", err);
    return null;
  }

  if (!user) return null;

  let { data: profile } = await supabase
    .from("users")
    .select("id, email, full_name, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  // Self-heal: if there's a valid auth user but no public.users row,
  // provision one from the auth metadata so the app stops bouncing
  // them to /sign-in. Idempotent — on a race (parallel requests),
  // the unique constraint on auth_user_id rejects the duplicate and
  // we just re-read the winning row. Uses the service-role client to
  // bypass RLS on the INSERT (typical RLS permits SELECT-own-row but
  // not INSERT); we already verified the auth.uid via auth.getUser()
  // so stamping the auth_user_id here is safe.
  if (!profile) {
    const metadata = (user.user_metadata as Record<string, unknown> | null) ?? {};
    const fullName = (metadata.full_name as string | undefined) ?? user.email ?? "Member";
    const phone = (metadata.phone as string | undefined) ?? null;
    try {
      const admin = getSupabaseServiceRoleClient();
      const { data: inserted, error: insertErr } = await admin
        .from("users")
        .insert({
          auth_user_id: user.id,
          email: user.email ?? "",
          full_name: fullName,
          phone,
          role: "customer",
        })
        .select("id, email, full_name, role")
        .maybeSingle();
      if (insertErr) {
        // Race condition — another request inserted first. Re-read.
        const { data: refetched } = await supabase
          .from("users")
          .select("id, email, full_name, role")
          .eq("auth_user_id", user.id)
          .maybeSingle();
        profile = refetched;
      } else {
        profile = inserted;
      }
    } catch (err) {
      console.warn("[session] auto-provision skipped (service role unavailable)", err);
    }
  }

  if (!profile) return null;

  const role = (profile.role ?? "customer") as Role;
  return {
    userId: profile.id as string,
    authUserId: user.id,
    email: (profile.email ?? user.email ?? "") as string,
    name: (profile.full_name ?? "Member") as string,
    role,
  };
}

/**
 * Enforce that a session exists. Redirects to /sign-in if not.
 * Use in server components instead of `(await getCurrentSession())!`
 * — the bang assertion crashes the page with a 500 if Supabase
 * returns null (stale cookies, race with the layout's own auth read,
 * etc.); this redirects cleanly instead.
 */
export async function requireSession(nextPath?: string): Promise<AppSession> {
  const session = await getCurrentSession();
  if (!session) {
    const qs = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/sign-in${qs}`);
  }
  return session;
}

/**
 * Enforce a role on a page. Redirects to /sign-in if signed out,
 * or to the user's home if they have the wrong role.
 */
export async function requireRole(role: Role, nextPath?: string): Promise<AppSession> {
  const session = await requireSession(nextPath);
  if (session.role !== role) {
    redirect(homeForRole(session.role));
  }
  return session;
}

export function homeForRole(role: Role): string {
  switch (role) {
    case "admin":
      return "/admin";
    case "technician":
      // Was "/admin/schedule" — but that route is gated by the admin
      // layout's requireRole("admin"), which redirects non-admins
      // back through homeForRole(role) and creates an infinite loop
      // for every technician sign-in. /tech is a standalone route
      // outside any role-gated layout.
      return "/tech";
    default:
      return "/app";
  }
}
