"use client";

// InboxTabs — client-side All / Unread / Read filter over the same
// notification list. Keeps the server-rendered groupings intact but
// lets the user narrow focus without a round-trip. Notifications that
// carry a `requestId` render as deep-links to the matching request
// detail page (e.g. "Tech is en route" → tap → request).

import { ArrowUpRight, Inbox as InboxIcon } from "lucide-react";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { Timeline, TimelineStep } from "@/components/ui/timeline";

type Notification = {
  id: string;
  title: string;
  body: string;
  createdAt: string;
  isRead: boolean;
  requestId: string | null;
};

type TabId = "all" | "unread" | "read";

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

export function InboxTabs({ notifications }: { notifications: Notification[] }) {
  const [tab, setTab] = useState<TabId>("all");

  const { filtered, counts } = useMemo(() => {
    const unread = notifications.filter((n) => !n.isRead);
    const read = notifications.filter((n) => n.isRead);
    const filtered =
      tab === "unread" ? unread : tab === "read" ? read : notifications;
    return {
      filtered,
      counts: { all: notifications.length, unread: unread.length, read: read.length },
    };
  }, [notifications, tab]);

  const groups: Record<string, Notification[]> = {
    Today: [],
    Yesterday: [],
    "This week": [],
    Earlier: [],
  };
  for (const n of filtered) groups[bucketOf(n.createdAt)].push(n);

  const orderedBuckets = (["Today", "Yesterday", "This week", "Earlier"] as const).filter(
    (k) => groups[k].length > 0,
  );

  const tabs: Array<{ id: TabId; label: string; count: number }> = [
    { id: "all", label: "All", count: counts.all },
    { id: "unread", label: "Unread", count: counts.unread },
    { id: "read", label: "Read", count: counts.read },
  ];

  return (
    <>
      {/* Tab row */}
      <div
        role="tablist"
        aria-label="Inbox filter"
        className="inline-flex items-center gap-1 rounded-full border border-border bg-surface p-1 text-sm"
      >
        {tabs.map((t) => {
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              role="tab"
              aria-selected={active}
              type="button"
              onClick={() => setTab(t.id)}
              className={`focus-ring rounded-full px-3 py-1.5 font-medium transition ${
                active
                  ? "bg-ink text-white"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              {t.label}
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                  active
                    ? "bg-white/20 text-white"
                    : "bg-canvas-elevated text-ink-subtle"
                }`}
              >
                {t.count}
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-5 space-y-6">
        {orderedBuckets.length === 0 ? (
          <EmptyState
            icon={InboxIcon}
            tone="sky"
            title={
              tab === "unread"
                ? "Nothing unread."
                : tab === "read"
                ? "No read notifications yet."
                : "Inbox zero."
            }
            description={
              tab === "unread"
                ? "You're all caught up. New activity will appear here as soon as requests move forward."
                : tab === "read"
                ? "Read notifications will show here as you work through your inbox."
                : "Scheduling confirmations and service notes will appear here as soon as your requests move forward."
            }
          />
        ) : (
          orderedBuckets.map((bucket) => (
            <Card key={bucket}>
              <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-muted">
                {bucket}
              </p>
              <Timeline>
                {groups[bucket].map((item, i, arr) => {
                  const meta = new Date(item.createdAt).toLocaleTimeString([], {
                    hour: "numeric",
                    minute: "2-digit",
                  });
                  // Deep-link the step into the related request when
                  // we have one. Wrapping the step in a Link with
                  // negative-margin click area keeps the visual
                  // unchanged while making the whole row tappable —
                  // and a small ↗ icon appears in the meta slot to
                  // signal the affordance without adding a button.
                  if (item.requestId) {
                    return (
                      <Link
                        key={item.id}
                        href={`/app/requests/${item.requestId}`}
                        className="focus-ring -mx-2 block rounded-2xl px-2 transition-colors hover:bg-canvas-elevated"
                      >
                        <TimelineStep
                          title={item.title}
                          description={item.body}
                          tone={item.isRead ? "muted" : "royal"}
                          last={i === arr.length - 1}
                          meta={
                            <span className="inline-flex items-center gap-1">
                              {meta}
                              <ArrowUpRight className="h-3 w-3" aria-hidden />
                            </span>
                          }
                          delay={0.04 * i}
                        />
                      </Link>
                    );
                  }
                  return (
                    <TimelineStep
                      key={item.id}
                      title={item.title}
                      description={item.body}
                      tone={item.isRead ? "muted" : "royal"}
                      last={i === arr.length - 1}
                      meta={meta}
                      delay={0.04 * i}
                    />
                  );
                })}
              </Timeline>
            </Card>
          ))
        )}
      </div>
    </>
  );
}
