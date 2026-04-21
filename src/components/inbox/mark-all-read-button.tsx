"use client";

// Tiny client component for the "Mark all as read" affordance in /app/inbox.
// Takes the list of unread ids as a prop, submits them as a single
// server-action call, then refreshes. Hooked up to the Toast system
// for success / failure feedback.

import { CheckCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/toast";
import { markAllNotificationsRead } from "@/app/(app)/app/inbox/actions";

export function MarkAllReadButton({ unreadIds }: { unreadIds: string[] }) {
  const router = useRouter();
  const toast = useToast();
  const [pending, start] = useTransition();
  const [done, setDone] = useState(false);

  if (unreadIds.length === 0 || done) return null;

  return (
    <Button
      variant="ghost"
      size="sm"
      iconLeft={<CheckCheck className="h-4 w-4" />}
      loading={pending}
      onClick={() =>
        start(async () => {
          const res = await markAllNotificationsRead({ ids: unreadIds });
          if (res?.error) {
            toast.show(res.error, "error");
            return;
          }
          toast.show("Inbox marked as read.", "success");
          setDone(true);
          router.refresh();
        })
      }
    >
      Mark all read
    </Button>
  );
}
