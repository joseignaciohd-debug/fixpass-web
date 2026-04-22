"use client";

// InboxTabs — client-side All / Unread / Read filter over the same
// notification list. Keeps the server-rendered groupings intact but
// lets the user narrow focus without a round-trip.

import { Inbox as InboxIcon } from "lucide-react";
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
    </>
  );
}
