// Lightweight per-IP / per-email rate-check that forms can call BEFORE
// hitting supabase.auth.signInWithPassword or resetPasswordForEmail.
// Without this layer, sign-in and reset run at Supabase's generous
// default rate from a single IP — enough headroom for credential
// stuffing against a known email.
//
// Returns 429 with a friendly message when the bucket is full;
// 200 otherwise. The form should treat any non-200 as "wait."

import { NextResponse } from "next/server";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "edge";

type Body = { kind?: "sign-in" | "reset"; email?: string };

const LIMITS: Record<string, { max: number; windowMs: number }> = {
  "sign-in": { max: 8, windowMs: 5 * 60 * 1000 }, // 8 attempts / 5min
  reset: { max: 4, windowMs: 15 * 60 * 1000 }, // 4 attempts / 15min
};

function ip(request: Request): string {
  return (
    request.headers.get("x-real-ip") ??
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    "unknown"
  );
}

export async function POST(request: Request) {
  let body: Body = {};
  try {
    body = (await request.json()) as Body;
  } catch {
    return NextResponse.json({ ok: false, error: "bad request" }, { status: 400 });
  }
  const kind = body.kind === "reset" ? "reset" : "sign-in";
  const email = (body.email ?? "").trim().toLowerCase();

  const limit = LIMITS[kind];
  const ipKey = `${kind}:ip:${ip(request)}`;
  const ipRes = rateLimit(ipKey, limit);
  if (!ipRes.ok) {
    return NextResponse.json(
      { ok: false, error: "Too many attempts. Try again in a few minutes." },
      { status: 429 },
    );
  }

  if (email) {
    const emailKey = `${kind}:email:${email}`;
    const emailRes = rateLimit(emailKey, limit);
    if (!emailRes.ok) {
      return NextResponse.json(
        { ok: false, error: "Too many attempts for this account. Try again in a few minutes." },
        { status: 429 },
      );
    }
  }

  return NextResponse.json({ ok: true });
}
