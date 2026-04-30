import { ArrowRight, CreditCard, Home, Inbox, PlusCircle } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { GradientCard } from "@/components/ui/gradient-card";
import { IconTile } from "@/components/ui/icon-tile";
import { StatRing } from "@/components/ui/stat-ring";
import { StatusPill } from "@/components/ui/status-pill";
import { Timeline, TimelineStep } from "@/components/ui/timeline";
import { getCurrentSession } from "@/lib/auth/session";
import { getCustomerSnapshot } from "@/lib/repositories/customer";

// Dashboard — mirrors the mobile home tab. Greeting hero with visits
// ring + quick actions + next-step card + recent updates.

export const dynamic = "force-dynamic";

export default async function CustomerDashboardPage() {
  // Layout guarantees session + customer role.
  const session = (await getCurrentSession())!;
  const snapshot = await getCustomerSnapshot(session.userId, {
    name: session.name,
    email: session.email,
  });

  const hasSubscription = Boolean(snapshot.subscription);
  const nextRequest =
    snapshot.requests.find((r) => r.status.toLowerCase() !== "completed") ?? snapshot.requests[0];
  const activeCount = snapshot.requests.filter((r) => r.status.toLowerCase() !== "completed").length;

  // Visit usage — fake the ring with the subscription data when present.
  const visitsRemaining = snapshot.subscription?.visitsRemaining ?? 0;
  const unlimited = visitsRemaining === "Unlimited";
  const visitsUsed = snapshot.subscription?.visitsUsed ?? 0;
  const total = unlimited ? 1 : visitsUsed + (typeof visitsRemaining === "number" ? visitsRemaining : 0) || 5;
  const used = unlimited ? 1 : visitsUsed;

  return (
    <div className="space-y-8">
      {/* Greeting hero */}
      <GradientCard tone="royal" className="sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <Badge tone="inverse">Membership</Badge>
            <h1 className="display-hero mt-4 text-3xl text-white sm:text-4xl lg:text-5xl">
              {hasSubscription
                ? `Good to see you, ${firstName(snapshot.user.name)}.`
                : `Let's get you set up, ${firstName(snapshot.user.name)}.`}
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-7 text-white/78 lg:text-base">
              {hasSubscription
                ? "Small home repairs, one clean membership. Track what's covered, what's scheduled, and what needs your attention next."
                : "Pick a plan, register your property, and we'll take it from there. Billing runs on Stripe — cancel anytime."}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {hasSubscription ? (
                <>
                  <Button
                    href="/app/requests/new"
                    variant="inverse"
                    iconLeft={<PlusCircle className="h-4 w-4" />}
                  >
                    New request
                  </Button>
                  <Link
                    href="/app/membership"
                    className="focus-ring inline-flex items-center gap-2 rounded-full border border-white/25 px-5 py-2.5 text-sm font-semibold text-white/90 transition hover:border-white/60 hover:bg-white/10"
                  >
                    Manage membership <ArrowRight className="h-4 w-4" />
                  </Link>
                </>
              ) : (
                <Button href="/app/subscribe" variant="inverse" iconRight={<ArrowRight className="h-4 w-4" />}>
                  Start membership
                </Button>
              )}
            </div>
          </div>

          {hasSubscription ? (
            <div className="flex items-center justify-center rounded-3xl border border-white/10 bg-white/[0.08] p-6 backdrop-blur">
              <StatRing
                value={used}
                max={total}
                label={unlimited ? "Fair use" : "used"}
                tone="honey"
                caption={
                  unlimited
                    ? "Unlimited covered visits this cycle"
                    : `${snapshot.subscription!.visitsRemaining} visits remaining · renews ${snapshot.subscription!.renewalDate}`
                }
                size={180}
              />
            </div>
          ) : (
            <div className="rounded-3xl border border-white/10 bg-white/[0.08] p-6 backdrop-blur">
              <p className="eyebrow-light">Why members stay</p>
              <ul className="mt-4 space-y-2 text-sm text-white/85">
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-honey" />
                  Operator-reviewed requests — no chaos
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-honey" />
                  Stripe-secured monthly billing
                </li>
                <li className="flex items-start gap-2">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-honey" />
                  Technicians inside your visit allowance
                </li>
              </ul>
            </div>
          )}
        </div>
      </GradientCard>

      {/* Next step + quick actions */}
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <Card delay={0.06}>
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">Next step</p>
              <h2 className="display-section mt-3 text-2xl text-ink">What needs attention now</h2>
            </div>
            <Badge tone="royal">{activeCount} active</Badge>
          </div>

          {nextRequest ? (
            <Link
              href="/app/requests"
              className="focus-ring mt-6 block rounded-2xl border border-border bg-canvas-elevated p-5 transition hover:border-border-strong"
            >
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div className="min-w-0">
                  <h3 className="font-[family-name:var(--font-display)] text-xl font-semibold text-ink">
                    {nextRequest.title}
                  </h3>
                  <p className="mt-2 text-sm text-ink-muted">
                    {nextRequest.area} · {nextRequest.preferredWindow}
                  </p>
                </div>
                <StatusPill status={nextRequest.status} />
              </div>
              <p className="mt-4 text-sm leading-7 text-ink-muted">{nextRequest.description}</p>
              <p className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-ink">
                Open requests <ArrowRight className="h-4 w-4" />
              </p>
            </Link>
          ) : (
            <div className="mt-6 rounded-2xl border border-border bg-canvas-elevated p-5 text-sm text-ink-muted">
              No requests yet. Submit your first repair from{" "}
              <Link href="/app/requests/new" className="link-underline text-royal">
                New request
              </Link>{" "}
              and it&apos;ll appear here with live status.
            </div>
          )}
        </Card>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
          <QuickAction
            href="/app/requests/new"
            icon={<PlusCircle className="h-4 w-4" />}
            label="Request help"
            description="Submit a covered task or small repair."
            tone="royal"
          />
          <QuickAction
            href="/app/inbox"
            icon={<Inbox className="h-4 w-4" />}
            label="Inbox"
            description={`${snapshot.notifications.length} update${snapshot.notifications.length === 1 ? "" : "s"} waiting.`}
            tone="sky"
          />
          <QuickAction
            href="/app/property"
            icon={<Home className="h-4 w-4" />}
            label="Property"
            description="Update access notes + address."
            tone="emerald"
          />
          <QuickAction
            href="/app/membership"
            icon={<CreditCard className="h-4 w-4" />}
            label="Billing"
            description="Receipts and Stripe portal."
            tone="honey"
          />
        </div>
      </section>

      {/* Recent updates */}
      <Card delay={0.1}>
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="eyebrow">Recent updates</p>
            <h2 className="display-section mt-3 text-2xl text-ink">Communication without clutter</h2>
          </div>
          <Badge tone="default">{snapshot.notifications.length} updates</Badge>
        </div>

        {snapshot.notifications.length ? (
          <Timeline className="mt-6">
            {snapshot.notifications.slice(0, 4).map((item, i, arr) => (
              <TimelineStep
                key={item.id}
                index={i + 1}
                title={item.title}
                description={item.body}
                tone={item.isRead ? "muted" : "royal"}
                last={i === arr.length - 1}
                meta={new Date(item.createdAt).toLocaleDateString()}
                delay={0.04 * i}
              />
            ))}
          </Timeline>
        ) : (
          <div className="mt-6 rounded-2xl border border-border bg-canvas-elevated p-5 text-sm text-ink-muted">
            No notifications yet. Scheduling confirmations and service notes will appear here.
          </div>
        )}
      </Card>
    </div>
  );
}

function firstName(fullName: string) {
  return fullName.split(/\s+/)[0] || fullName;
}

function QuickAction({
  href,
  icon,
  label,
  description,
  tone,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  description: string;
  tone: "royal" | "emerald" | "sky" | "honey";
}) {
  return (
    <Link
      href={href}
      className="focus-ring block rounded-2xl border border-border bg-surface p-5 transition hover:border-border-strong hover:shadow-[0_18px_45px_-24px_rgb(var(--shadow)/0.25)]"
    >
      <IconTile
        icon={icon}
        label={label}
        description={description}
        tone={tone}
        className="border-0 bg-transparent p-0 hover:shadow-none"
      />
    </Link>
  );
}
