// Resend wrapper — no-ops if RESEND_API_KEY is unset so local dev +
// unconfigured deploys don't throw. Add the key + RESEND_FROM env vars
// on Vercel to enable real delivery.

import { Resend } from "resend";

const KEY = process.env.RESEND_API_KEY;
const FROM = process.env.RESEND_FROM ?? "Fixpass <hello@getfixpass.com>";
const OPS_INBOX = process.env.OPS_INBOX_EMAIL ?? "hello@getfixpass.com";

type EmailPayload = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
};

export const isEmailConfigured = Boolean(KEY);

export async function sendEmail(payload: EmailPayload): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!KEY) {
    // Log + treat as success so the caller doesn't block — but ops
    // won't actually get the email until env vars are set.
    console.warn("[email] RESEND_API_KEY missing — skipping send", {
      to: payload.to,
      subject: payload.subject,
    });
    return { ok: true };
  }

  try {
    const resend = new Resend(KEY);
    const { error } = await resend.emails.send({
      from: FROM,
      to: payload.to,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
      replyTo: payload.replyTo,
    });
    if (error) return { ok: false, error: error.message };
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "Unknown email error." };
  }
}

/**
 * Notifies the ops inbox when a marketing lead submits the contact/join form.
 */
export async function notifyOpsOfLead(lead: {
  name: string;
  email: string;
  phone?: string;
  city?: string;
  address?: string;
  message?: string;
  source: "contact" | "join";
}) {
  const subject = `[${lead.source}] New Fixpass lead — ${lead.name}`;
  const rows: Array<[string, string]> = [
    ["Name", lead.name],
    ["Email", lead.email],
    ["Phone", lead.phone ?? "—"],
    ["City", lead.city ?? "—"],
    ["Address", lead.address ?? "—"],
    ["Message", lead.message ?? "—"],
  ];

  const html = `
    <div style="font-family:Inter,system-ui,sans-serif;max-width:600px;color:#0B1B3A">
      <div style="background:linear-gradient(135deg,#1F4FD1 0%,#1F3FB6 100%);color:#fff;padding:32px;border-radius:12px">
        <p style="text-transform:uppercase;letter-spacing:.16em;font-size:11px;opacity:.7;margin:0">
          Fixpass · New ${lead.source} lead
        </p>
        <h1 style="font-family:Georgia,serif;font-size:28px;margin:12px 0 0">${escapeHtml(lead.name)}</h1>
      </div>
      <table style="width:100%;margin-top:24px;border-collapse:collapse">
        ${rows
          .map(
            ([k, v]) => `
          <tr>
            <td style="padding:10px 12px;border-bottom:1px solid #DEE4EF;color:#475776;font-weight:600;width:120px">${k}</td>
            <td style="padding:10px 12px;border-bottom:1px solid #DEE4EF">${escapeHtml(v)}</td>
          </tr>`,
          )
          .join("")}
      </table>
      <p style="margin-top:24px;color:#475776;font-size:13px">
        Reply to this email to respond directly to ${escapeHtml(lead.name)}.
      </p>
    </div>
  `;

  const text = rows.map(([k, v]) => `${k}: ${v}`).join("\n");

  return sendEmail({
    to: OPS_INBOX,
    subject,
    html,
    text,
    replyTo: lead.email,
  });
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
