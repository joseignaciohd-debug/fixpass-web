import {
  AlertTriangle,
  CheckCircle2,
  Mail,
  Phone,
  Settings as SettingsIcon,
  Shield,
  User,
  Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { defaultRules } from "@/lib/config/site-data";
import { TECHNICIANS } from "@/lib/config/technicians";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  const session = await requireSession("/admin/settings");
  const integrations = readIntegrations();

  return (
    <div className="space-y-6">
      <Card animate={false}>
        <div className="flex items-start gap-3">
          <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-royal-soft text-royal-ink">
            <SettingsIcon className="h-4 w-4" />
          </div>
          <div className="flex-1">
            <p className="eyebrow">Settings</p>
            <h1 className="display-section mt-1 text-2xl text-ink">
              Operational defaults &amp; identity
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
              Read-only for v1. Technicians + operating rules live in code
              (<code className="rounded bg-canvas-elevated px-1.5 py-0.5 font-mono text-xs">lib/config/</code>);
              edit + redeploy until the ops-config schema lands.
            </p>
          </div>
        </div>
      </Card>

      <Card>
        <SectionHeader
          icon={User}
          title="Your admin profile"
          subtitle="Used for Stripe receipts, member-facing scheduling notes, and Sentry actor tagging."
        />
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          <Field icon={User} label="Display name" value={session.name || "—"} />
          <Field icon={Mail} label="Sign-in email" value={session.email} />
          <Field icon={Shield} label="Role" value={session.role} />
        </div>
      </Card>

      <Card>
        <SectionHeader
          icon={Wrench}
          title="Technician roster"
          subtitle={`Source: lib/config/technicians.ts · ${TECHNICIANS.length} on bench`}
        />
        <div className="mt-5 grid gap-3">
          {TECHNICIANS.map((t) => (
            <div
              key={t.id}
              className="rounded-2xl border border-border bg-canvas-elevated px-4 py-3"
            >
              <div className="flex flex-wrap items-center gap-3 text-sm">
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-ink text-white">
                  <Wrench className="h-4 w-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-ink">{t.name}</p>
                  <p className="text-xs text-ink-muted">
                    id: <span className="font-mono">{t.id}</span>
                    {t.phone ? (
                      <span className="ml-3 inline-flex items-center gap-1">
                        <Phone className="h-3 w-3" /> {t.phone}
                      </span>
                    ) : null}
                  </p>
                </div>
              </div>
              {t.internalNote ? (
                <p className="mt-2 text-xs leading-5 text-ink-muted">{t.internalNote}</p>
              ) : null}
            </div>
          ))}
          <p className="text-xs text-ink-subtle">
            Add a technician: edit{" "}
            <code className="rounded bg-canvas-elevated px-1 py-0.5 font-mono">lib/config/technicians.ts</code>{" "}
            and redeploy. When the bench grows past 3 we&apos;ll graduate to a{" "}
            <code className="rounded bg-canvas-elevated px-1 py-0.5 font-mono">technicians</code> table with availability records.
          </p>
        </div>
      </Card>

      <Card>
        <SectionHeader
          icon={Shield}
          title="Operating rules"
          subtitle="Baked-in guardrails surfaced on the marketing site + member portal."
        />
        <div className="mt-5 grid gap-2">
          {defaultRules.map((rule) => (
            <div
              key={rule}
              className="rounded-2xl border border-border bg-canvas-elevated px-4 py-3 text-sm text-ink"
            >
              {rule}
            </div>
          ))}
        </div>
        <p className="mt-3 text-xs text-ink-subtle">
          Source: <code className="rounded bg-canvas-elevated px-1 py-0.5 font-mono">lib/config/site-data.ts</code>
        </p>
      </Card>

      <Card>
        <SectionHeader
          icon={CheckCircle2}
          title="Integrations"
          subtitle="What's wired into this deployment. Set env vars on Vercel to flip a missing one on."
        />
        <div className="mt-5 grid gap-2 sm:grid-cols-2">
          {integrations.map((i) => (
            <IntegrationRow key={i.name} {...i} />
          ))}
        </div>
      </Card>
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
  subtitle,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <div className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-royal-soft text-royal-ink">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink">
          {title}
        </h2>
        <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-canvas-elevated px-4 py-3 text-sm">
      <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-ink-muted">
        <Icon className="h-3.5 w-3.5" /> {label}
      </div>
      <p className="mt-1 truncate font-semibold text-ink">{value}</p>
    </div>
  );
}

type Integration = { name: string; ok: boolean; detail: string };

function IntegrationRow({ name, ok, detail }: Integration) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-canvas-elevated px-4 py-3">
      <span
        className={
          ok
            ? "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-soft text-emerald-ink"
            : "mt-0.5 inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-honey-soft text-cream-ink"
        }
      >
        {ok ? <CheckCircle2 className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-ink">{name}</p>
        <p className="text-xs leading-5 text-ink-muted">{detail}</p>
      </div>
      <Badge tone={ok ? "emerald" : "honey"}>{ok ? "wired" : "missing"}</Badge>
    </div>
  );
}

function readIntegrations(): Integration[] {
  return [
    {
      name: "Supabase",
      ok: Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY),
      detail: "Auth + database. NEXT_PUBLIC_SUPABASE_URL + NEXT_PUBLIC_SUPABASE_ANON_KEY.",
    },
    {
      name: "Stripe (server)",
      ok: Boolean(process.env.STRIPE_SECRET_KEY),
      detail: "Server-side payments. STRIPE_SECRET_KEY.",
    },
    {
      name: "Stripe webhook",
      ok: Boolean(process.env.STRIPE_WEBHOOK_SECRET),
      detail: "Verified subscription events. STRIPE_WEBHOOK_SECRET.",
    },
    {
      name: "Resend (email)",
      ok: Boolean(process.env.RESEND_API_KEY),
      detail: "Transactional emails. RESEND_API_KEY.",
    },
    {
      name: "Sentry",
      ok: Boolean(process.env.SENTRY_DSN || process.env.NEXT_PUBLIC_SENTRY_DSN),
      detail: "Error tracking. SENTRY_DSN / NEXT_PUBLIC_SENTRY_DSN.",
    },
    {
      name: "PostHog",
      ok: Boolean(process.env.NEXT_PUBLIC_POSTHOG_KEY),
      detail: "Product analytics. NEXT_PUBLIC_POSTHOG_KEY (+ optional NEXT_PUBLIC_POSTHOG_HOST).",
    },
  ];
}
