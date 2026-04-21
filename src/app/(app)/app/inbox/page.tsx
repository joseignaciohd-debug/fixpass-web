import { Inbox as InboxIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Timeline, TimelineStep } from "@/components/ui/timeline";
import { MarkAllReadButton } from "@/components/inbox/mark-all-read-button";
import { getCurrentSession } from "@/lib/auth/session";
import { getCustomerSnapshot } from "@/lib/repositories/customer";

export const dynamic = "force-dynamic";

function bucketOf(iso: string): "Today" | "Yesterday" | "This week" | "Earlier" {
  const now = new Date();
  const d = new Date(iso);
  const day = 24 * 60 * 60 * 1000;
  if (d.toDateString() === now.toDateString()) return "Today";
  const yesterday = new Date(now.getTime() - day);
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  if (now.getTime() - d.getTime() < 7 * day) return "This week";
  return "Earlier";
}

export default async function InboxPage() {
  const session = (await getCurrentSession())!;
  const snapshot = await getCustomerSnapshot(session.userId, { name: session.name, email: session.email });

  const groups: Record<string, typeof snapshot.notifications> = {
    Today: [],
    Yesterday: [],
    "This week": [],
    Earlier: [],
  };
  for (const n of snapshot.notifications) groups[bucketOf(n.createdAt)].push(n);

  const orderedBuckets = (["Today", "Yesterday", "This week", "Earlier"] as const).filter(
    (k) => groups[k].length > 0,
  );
  const unread = snapshot.notifications.filter((n) => !n.isRead).length;
  const unreadIds = snapshot.notifications.filter((n) => !n.isRead).map((n) => n.id);

  return (
    <div className="space-y-6">
      <Card animate={false}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow">Inbox</p>
            <h1 className="display-section mt-2 text-3xl text-ink">Service updates, without noise.</h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-ink-muted">
              Fixpass keeps communication simple — what changed, what&apos;s scheduled, what needs your
              attention.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {unread > 0 ? <Badge tone="royal">{unread} unread</Badge> : null}
            <Badge tone="default">{snapshot.notifications.length} total</Badge>
            <MarkAllReadButton unreadIds={unreadIds} />
          </div>
        </div>
      </Card>

      {orderedBuckets.length === 0 ? (
        <EmptyState
          icon={InboxIcon}
          tone="sky"
          title="Inbox zero."
          description="Scheduling confirmations and service notes will appear here as soon as your requests move forward."
        />
      ) : (
        orderedBuckets.map((bucket) => (
          <Card key={bucket}>
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
              {bucket}
            </p>
            <Timeline>
              {groups[bucket].map((item, i, arr) => (
                <TimelineStep
                  key={item.id}
                  title={item.title}
                  description={item.body}
                  tone={item.isRead ? "muted" : "royal"}
                  last={i === arr.length - 1}
                  meta={new Date(item.createdAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  })}
                  delay={0.04 * i}
                />
              ))}
            </Timeline>
          </Card>
        ))
      )}
    </div>
  );
}
