import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { InboxTabs } from "@/components/inbox/inbox-tabs";
import { MarkAllReadButton } from "@/components/inbox/mark-all-read-button";
import { requireSession } from "@/lib/auth/session";
import { getCustomerSnapshot } from "@/lib/repositories/customer";

export const dynamic = "force-dynamic";

export default async function InboxPage() {
  const session = await requireSession("/app/inbox");
  const snapshot = await getCustomerSnapshot(session.userId, { name: session.name, email: session.email });

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

      <InboxTabs notifications={snapshot.notifications} />
    </div>
  );
}
