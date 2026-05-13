# Fixpass web

Next.js 16 app for [getfixpass.com](https://www.getfixpass.com) — marketing site,
member portal (`/app`), and operator console (`/admin`). Pairs with the mobile
app at `~/Documents/fixpass/Fixpass App/my-new-app/` (shares the same Supabase
project; the migrations live in that repo).

---

## Quick start

```bash
npm install
cp .env.example .env.local   # fill in the values — see below
npm run dev                  # http://localhost:3000
```

You need (at minimum) the Supabase URL + anon key to boot. Everything else
degrades gracefully: missing Stripe → checkout shows "not configured", missing
Resend → emails are silently skipped, missing Sentry → no telemetry. The
production health endpoint at `/api/health` (with the `x-health-secret` header
set to `HEALTH_ADMIN_SECRET`) reports which features are wired.

---

## Required environment variables

| Var | Required? | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ always | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ always | Anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ prod | Used for webhook + `getCurrentSession` self-heal |
| `STRIPE_SECRET_KEY` | ✅ prod | Live keys start with `sk_live_`. Must match the mode of your price IDs — test prices and live keys do NOT see each other |
| `STRIPE_WEBHOOK_SECRET` | ✅ prod | Set this AFTER configuring the webhook endpoint in Stripe Dashboard |
| `STRIPE_PRICE_SILVER_3MO` | ✅ prod | One env var per (tier × cycle). 9 total. See `lib/config/site-data.ts` for the canonical amounts each should map to |
| `STRIPE_PRICE_SILVER_6MO` | ✅ prod | |
| `STRIPE_PRICE_SILVER_1YR` | ✅ prod | |
| `STRIPE_PRICE_GOLD_3MO` | ✅ prod | |
| `STRIPE_PRICE_GOLD_6MO` | ✅ prod | |
| `STRIPE_PRICE_GOLD_1YR` | ✅ prod | |
| `STRIPE_PRICE_PLATINUM_3MO` | ✅ prod | |
| `STRIPE_PRICE_PLATINUM_6MO` | ✅ prod | |
| `STRIPE_PRICE_PLATINUM_1YR` | ✅ prod | |
| `RESEND_API_KEY` | optional | Without it, all emails silently no-op |
| `RESEND_FROM` | optional | `"Fixpass <hello@getfixpass.com>"` is the default — make sure that domain is verified in Resend (SPF/DKIM/DMARC, see below) |
| `OPS_INBOX_EMAIL` | optional | Where lead + new-request notifications land |
| `NEXT_PUBLIC_SENTRY_DSN` | optional | Client + server error reporting |
| `SENTRY_DSN` | optional | Same key, server only — set both for full coverage |
| `NEXT_PUBLIC_POSTHOG_KEY` | optional | Analytics |
| `NEXT_PUBLIC_POSTHOG_HOST` | optional | Default: `https://us.i.posthog.com` |
| `HEALTH_ADMIN_SECRET` | optional | Shared secret for `/api/health` detailed view |

`NODE_ENV`, `VERCEL_*` etc. are injected automatically by Vercel.

Names are **case-sensitive**. `stripe_secret_key` and `STRIPE_SECRET_KEY` are
different variables to Node.js — the former WILL silently break checkout.

---

## First-time Supabase setup

The migrations + the auth-trigger that creates `public.users` rows live in the
**mobile** repo at `~/Documents/fixpass/Fixpass App/my-new-app/supabase/`.
Apply those to your Supabase project once. The web app self-heals if the
`public.users` row is missing on a request, so a missing trigger isn't
catastrophic — but install the trigger anyway so customers + properties /
subscriptions stay consistent.

Email confirmation template (Supabase Dashboard → Authentication → Email
Templates → "Confirm signup") must be:

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

If you leave it on the default (`{{ .ConfirmationURL }}`), the link points
to Supabase's own URL and our `/auth/confirm` handler never runs.

Also set the Site URL in **Authentication → URL Configuration** to
`https://www.getfixpass.com` and add the same as an allowed redirect URL.
Add `http://localhost:3000` for local dev.

---

## Stripe setup

1. Create the products + prices in Stripe Dashboard (Live or Test — they're
   isolated).
2. Copy each price ID into the corresponding `STRIPE_PRICE_*` env var on
   Vercel. They start with `price_`.
3. Set up the webhook endpoint at `https://www.getfixpass.com/api/stripe/webhook`
   (Dashboard → Developers → Webhooks → Add endpoint). Subscribe to:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copy the **signing secret** into `STRIPE_WEBHOOK_SECRET` on Vercel.
5. The signing secret is mode-specific (Live key vs Test sandbox). Make sure
   it matches the mode of `STRIPE_SECRET_KEY`.

---

## DNS / email deliverability

Resend sends from `RESEND_FROM` (defaults to `hello@getfixpass.com`). The
sending domain MUST have:

- **SPF**: `TXT @  "v=spf1 include:_spf.resend.com -all"`
- **DKIM**: CNAME records Resend gives you in the dashboard
- **DMARC**: `TXT _dmarc  "v=DMARC1; p=quarantine; rua=mailto:dmarc@getfixpass.com"`

Without these, every email goes to spam — silently, with no error in the app.
Verify at [mxtoolbox.com](https://mxtoolbox.com/spf.aspx).

---

## Architecture in one paragraph

Marketing pages render statically (`/`, `/plans`, `/how-it-works`, etc.).
`/app/*` is gated by `src/proxy.ts` (Next 16 middleware) + the `(app)` layout
calling `requireRole("customer")`. `/admin/*` is gated similarly to admin
role. Auth lives entirely in Supabase; `getCurrentSession()` resolves the
auth user, looks up the `public.users` row (auto-creating if missing), and
sets a Sentry `setUser`. Payments use Stripe Checkout (sync via webhook
`/api/stripe/webhook` → writes `payment_events` keyed on `auth.users.id` +
upserts `subscriptions` keyed on `customers.id`). The welcome screen subscribes
to `payment_events` via Supabase Realtime AND polls every 5s as a fallback.
Service requests live in `service_requests` + `service_request_events` +
`service_request_photos` (storage bucket pinned per `auth.uid()`).
Notifications fan out to a `notifications` table that `/app/inbox` reads.

---

## Scripts

```bash
npm run dev        # local dev
npm run build      # production build (typechecks + bundles)
npm run lint       # ESLint
npm run typecheck  # tsc --noEmit (catches type errors Next ignores)
npm run test       # vitest unit tests
npm run test:ci    # vitest one-shot for CI
```

---

## Tests + CI

Critical paths have unit tests under `src/**/__tests__/`. CI
(`.github/workflows/ci.yml`) runs lint + typecheck + tests on every push.
Block merges on red.

To add a new test:

```
src/app/api/stripe/webhook/__tests__/route.test.ts
```

Pattern: mock the Supabase client + Stripe SDK, assert the right rows get
written (or not) for each event.

---

## Troubleshooting common issues

| Symptom | Likely cause |
| --- | --- |
| "Stripe rejected checkout — resource_missing" | Price ID in env var doesn't exist in the Stripe account / wrong mode (test key + live price or vice versa) |
| "Stripe is not configured yet" | `STRIPE_SECRET_KEY` env var is missing OR mis-cased (must be UPPER) |
| Webhook arriving but member never activated | `STRIPE_WEBHOOK_SECRET` wrong, OR public.users / customers row missing — check Sentry under `area:stripe_webhook` |
| Confirmation email says "link expired" | Mail scanner pre-fetched the link; the user usually has a session anyway and our /auth/confirm tolerates this. If not, just sign in normally |
| Member sees "Something broke here" | Unhandled error in a server component — check Sentry. Most common in the past: stale Supabase session cookie or missing `public.users` row, both now self-heal |

---

## Production checklist

Before opening up new signups:

- [ ] All 9 `STRIPE_PRICE_*` env vars set in Vercel **Production** scope
- [ ] `STRIPE_SECRET_KEY` matches the mode of the price IDs (live↔live, test↔test)
- [ ] `STRIPE_WEBHOOK_SECRET` set, webhook endpoint configured in Stripe
- [ ] Supabase email template uses `{{ .SiteURL }}/auth/confirm?…`
- [ ] Resend domain verified (SPF + DKIM + DMARC)
- [ ] Sentry DSN set, alerts configured for `area:stripe_webhook` issues
- [ ] Supabase project on Pro tier (PITR backups)
- [ ] Branch protection on `main` (no force-push)
