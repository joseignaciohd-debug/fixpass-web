import { Card } from "@/components/ui/card";
import { NewRequestForm } from "@/components/forms/new-request-form";
import { getCurrentSession } from "@/lib/auth/session";

export const dynamic = "force-dynamic";

export default async function NewRequestPage() {
  // Layout already gates on session; re-reading here gives us the auth
  // user id needed to namespace photo uploads in Storage.
  const session = (await getCurrentSession())!;

  return (
    <div className="space-y-6">
      <Card animate={false}>
        <p className="eyebrow">New request</p>
        <h1 className="display-section mt-2 text-3xl text-ink">Tell us what needs fixing.</h1>
        <p className="mt-3 max-w-2xl text-sm leading-7 text-ink-muted">
          Covered visits work best for up to 3 related small tasks in one area, or one moderately sized
          covered job. An operator reviews before anything gets scheduled.
        </p>
      </Card>

      <Card>
        <NewRequestForm userId={session.userId} />
      </Card>
    </div>
  );
}
