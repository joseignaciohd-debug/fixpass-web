import Link from "next/link";
import {
  ArrowRight,
  Bell,
  CreditCard,
  Home as HomeIcon,
  LogOut,
  Mail,
  Phone,
  Shield,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { requireSession } from "@/lib/auth/session";
import { getCustomerSnapshot } from "@/lib/repositories/customer";

export const dynamic = "force-dynamic";

// /app/settings — single hub that consolidates the member-facing
// account surfaces (profile, property, membership, notifications) so
// "Settings" is one obvious destination instead of three scattered
// links. Each row deep-links into the existing edit pages where the
// real form work happens.

export default async function MemberSettingsPage() {
  const session = await requireSession("/app/settings");
  const snap = await getCustomerSnapshot(session.userId, {
    name: session.name,
    email: session.email,
  });

  const subscriptionLabel = snap.subscription
    ? `${snap.subscription.status} · ${snap.subscription.billingCycle}`
    : "No active membership";

  const subscriptionTone: "emerald" | "honey" | "default" =
    snap.subscription?.status === "active"
      ? "emerald"
      : snap.subscription?.status
        ? "honey"
        : "default";

  return (
    <div className="space-y-6">
      <Card animate={false}>
        <p className="eyebrow">Settings</p>
        <h1 className="display-section mt-2 text-3xl text-ink">Your account, one place.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-ink-muted">
          Update your contact info, manage your property, and review your membership. Anything that
          touches billing routes through Stripe — your card details never live on Fixpass.
        </p>
      </Card>

      <Card>
        <SectionHeader icon={User} title="Profile" subtitle="Name, email, and phone." />
        <SettingRow
          icon={User}
          label={snap.user.name || session.name}
          detail="Display name"
        />
        <SettingRow
          icon={Mail}
          label={snap.user.email || session.email}
          detail="Sign-in email"
        />
        <SettingRow
          icon={Phone}
          label={snap.user.phone || "—"}
          detail="Phone (used to reach you about scheduling)"
        />
        <SettingLink href="/app/profile" label="Edit profile" />
      </Card>

      <Card>
        <SectionHeader
          icon={HomeIcon}
          title="Property"
          subtitle="Address + access notes the technician sees."
        />
        {snap.property ? (
          <>
            <SettingRow icon={HomeIcon} label={snap.property.nickname} detail="Property nickname" />
            <SettingRow icon={HomeIcon} label={snap.property.address || "No address on file"} detail="Address" />
            {snap.property.accessNotes ? (
              <p className="mt-3 rounded-xl border border-border bg-canvas-elevated px-4 py-3 text-sm text-ink-muted">
                <span className="font-semibold text-ink">Access notes: </span>
                {snap.property.accessNotes}
              </p>
            ) : null}
          </>
        ) : (
          <p className="text-sm text-ink-muted">
            You haven&apos;t added a property yet. Add one before requesting a visit.
          </p>
        )}
        <SettingLink
          href="/app/property"
          label={snap.property ? "Edit property" : "Add property"}
        />
      </Card>

      <Card>
        <SectionHeader
          icon={CreditCard}
          title="Membership"
          subtitle="Plan, billing cycle, and Stripe portal."
        />
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-sm text-ink-muted">
            <span className="font-semibold text-ink">Status: </span>
            {subscriptionLabel}
          </div>
          <Badge tone={subscriptionTone}>{snap.subscription?.status ?? "none"}</Badge>
        </div>
        <SettingLink
          href="/app/membership"
          label={snap.subscription ? "Manage membership" : "Start a membership"}
        />
      </Card>

      <Card>
        <SectionHeader
          icon={Bell}
          title="Notifications"
          subtitle="How we reach you about your requests."
        />
        <p className="text-sm text-ink-muted">
          Account-related emails (request received, scheduling confirmed, post-visit) are on by
          default. Per-message preferences land alongside the next inbox upgrade.
        </p>
      </Card>

      <Card>
        <SectionHeader
          icon={Shield}
          title="Account"
          subtitle="Sign out of this device."
        />
        <form action="/api/auth/sign-out" method="post" className="flex justify-end">
          <button
            type="submit"
            className="focus-ring inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-ink transition hover:border-border-strong hover:bg-canvas-elevated"
          >
            <LogOut className="h-4 w-4" />
            Sign out
          </button>
        </form>
      </Card>
    </div>
  );
}

// ---- helpers ------------------------------------------------------

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
      <div className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-royal-soft text-royal-ink">
        <Icon className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink">
          {title}
        </h2>
        <p className="mt-0.5 text-xs text-ink-muted">{subtitle}</p>
      </div>
    </div>
  );
}

function SettingRow({
  icon: Icon,
  label,
  detail,
}: {
  icon: LucideIcon;
  label: string;
  detail: string;
}) {
  return (
    <div className="mt-4 flex items-center gap-3 text-sm">
      <Icon className="h-4 w-4 shrink-0 text-ink-subtle" aria-hidden />
      <div className="min-w-0">
        <p className="truncate font-semibold text-ink">{label}</p>
        <p className="text-xs text-ink-muted">{detail}</p>
      </div>
    </div>
  );
}

function SettingLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="focus-ring mt-5 inline-flex items-center gap-1 text-sm font-semibold text-royal hover:underline"
    >
      {label}
      <ArrowRight className="h-3.5 w-3.5" />
    </Link>
  );
}
