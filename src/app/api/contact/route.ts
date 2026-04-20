// Contact form endpoint — validates + logs the lead. We don't ship
// email delivery yet, but the shape of this route makes it easy to
// plug in Resend / Postmark later without touching the client.

import { NextResponse } from "next/server";
import { z } from "zod";

const schema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email(),
  phone: z.string().trim().max(30).optional().or(z.literal("")),
  city: z.string().trim().max(80).optional().or(z.literal("")),
  address: z.string().trim().max(200).optional().or(z.literal("")),
  message: z.string().trim().min(10).max(2000),
});

export async function POST(request: Request) {
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

  // TODO: integrate email provider here (Resend / Postmark / SES).
  // For now the lead is logged — structured so log aggregators can
  // alert on it. Sentry also captures structured logs via breadcrumb.
  console.log("[contact] lead received", parsed.data);

  return NextResponse.json({ ok: true });
}
