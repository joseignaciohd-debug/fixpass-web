// Supabase client for Server Components + Route Handlers.
// Uses @supabase/ssr's cookie adapter so session tokens round-trip
// through HTTP cookies — this is what keeps the browser + server in
// agreement about who's signed in.

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export async function getSupabaseServerClient() {
  if (!URL || !ANON) {
    throw new Error(
      "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  const cookieStore = await cookies();
  return createServerClient(URL, ANON, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(toSet) {
        try {
          for (const { name, value, options } of toSet) {
            cookieStore.set(name, value, options);
          }
        } catch {
          // Called from a Server Component — cookies can only be
          // modified in Route Handlers or Server Actions. Ignoring
          // here is safe because middleware also refreshes the cookie
          // on every navigation.
        }
      },
    },
  });
}

/**
 * Service-role client for trusted server work (webhook processing,
 * admin queries that need to bypass RLS). Never expose to the client.
 */
export function getSupabaseServiceRoleClient() {
  const ROLE = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!URL || !ROLE) {
    throw new Error(
      "Service-role Supabase env vars missing. Set SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  // Service-role skips RLS; do not accept user-controlled inputs unsanitized.
  return createServerClient(URL, ROLE, {
    cookies: {
      getAll() { return []; },
      setAll() { /* no-op */ },
    },
  });
}
