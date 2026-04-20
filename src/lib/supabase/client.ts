"use client";

// Supabase client for Client Components / browser code.
// Session state is managed in HTTP cookies by @supabase/ssr so
// server + client stay in sync without localStorage.

import { createBrowserClient } from "@supabase/ssr";

const URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export function getSupabaseBrowserClient() {
  if (!URL || !ANON) {
    throw new Error(
      "Supabase env vars missing. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    );
  }
  return createBrowserClient(URL, ANON);
}

export const isSupabaseConfigured = Boolean(URL && ANON);
