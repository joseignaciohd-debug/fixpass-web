// Server-side auth helpers — fetch the current session + resolved role
// so Server Components + Route Handlers can gate content without
// rerolling the same Supabase calls.

import { redirect } from "next/navigation";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export type Role = "customer" | "technician" | "admin";

export type AppSession = {
  userId: string;
  email: string;
  name: string;
  role: Role;
};

/**
 * Returns the current session or null. Reads the user row from
 * `public.users` to resolve role. RLS on that table allows users
 * to read their own row.
 */
export async function getCurrentSession(): Promise<AppSession | null> {
  let supabase;
  try {
    supabase = await getSupabaseServerClient();
  } catch {
    // Supabase not configured yet — treat as signed-out.
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return null;

  const { data: profile } = await supabase
    .from("users")
    .select("id, email, full_name, role")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!profile) return null;

  const role = (profile.role ?? "customer") as Role;
  return {
    userId: profile.id as string,
    email: (profile.email ?? user.email ?? "") as string,
    name: (profile.full_name ?? "Member") as string,
    role,
  };
}

/**
 * Enforce a role on a page. Redirects to /sign-in if signed out,
 * or to the user's home if they have the wrong role.
 */
export async function requireRole(role: Role, nextPath?: string): Promise<AppSession> {
  const session = await getCurrentSession();
  if (!session) {
    const qs = nextPath ? `?next=${encodeURIComponent(nextPath)}` : "";
    redirect(`/sign-in${qs}`);
  }
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
      return "/admin/schedule";
    default:
      return "/app";
  }
}
