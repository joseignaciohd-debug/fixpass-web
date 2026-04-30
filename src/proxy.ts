// Edge proxy — runs before every request. Does two things:
//
//   1. Refreshes the Supabase session cookie so SSR pages see fresh
//      auth state (otherwise access tokens can silently expire
//      between navigations).
//
//   2. Gates /app/* and /admin/* routes. Signed-out users get redirected
//      to /sign-in?next=<original>. The role check itself happens in
//      the page via requireRole() — this proxy just ensures there's
//      SOMEONE signed in.
//
// Renamed from `middleware` to `proxy` per Next 16's file-convention
// rename (the old name still works but emits a deprecation warning).

import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

const GATED_PREFIXES = ["/app", "/admin"];

export async function proxy(request: NextRequest) {
  const response = NextResponse.next({ request: { headers: request.headers } });

  const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  // If Supabase isn't configured yet (first deploy / preview), don't
  // lock anyone out — just let the request through.
  if (!URL_ || !ANON) return response;

  const supabase = createServerClient(URL_, ANON, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(toSet) {
        toSet.forEach(({ name, value }) => request.cookies.set(name, value));
        toSet.forEach(({ name, value, options }) => response.cookies.set(name, value, options));
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isGated = GATED_PREFIXES.some((p) => path === p || path.startsWith(`${p}/`));

  if (isGated && !user) {
    const signIn = request.nextUrl.clone();
    signIn.pathname = "/sign-in";
    signIn.searchParams.set("next", path);
    return NextResponse.redirect(signIn);
  }

  return response;
}

// Run on every non-asset request. Exclude Next internal paths + static files.
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|txt|xml)$).*)",
  ],
};
