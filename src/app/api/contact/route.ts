// Contact form endpoint — validates + logs the lead. We don't ship
// email delivery yet, but the shape of this route makes it easy to
// plug in Resend / Postmark later without touching the client.

import { NextResponse } from "next/server";
import { z } from "zod";
import { notifyOpsOfLead } from "@/lib/email/resend";
import { rateLimit } from "@/lib/rate-limit";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(2000),
});

export async function POST(request: Request) {
  // Rate limit by IP — 5 submissions per 10 minutes. Blocks dumb bots.
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anon";
  const limited = rateLimit(`contact:${ip}`, { max: 5, windowMs: 10 * 60 * 1000 });
  if (!limited.ok) {
    return NextResponse.json({ error: "Too many requests. Try again later." }, { status: 429 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON." }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Validation failed.", issues: parsed.error.flatten() }, { status: 400 });
  }

  // Email the ops inbox. If RESEND_API_KEY isn't set, the helper logs
  // the lead and returns ok:true so the user's form still succeeds.
  const email = await notifyOpsOfLead({ ...parsed.data, source: "contact" });
  if (!email.ok) {
    console.error("[contact] email send failed", email.error);
    // Still return ok — we logged the lead; ops will triage via Sentry.
  }

  return NextResponse.json({ ok: true });
}
