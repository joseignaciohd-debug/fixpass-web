import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { Timeline, TimelineStep } from "@/components/ui/timeline";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function RequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let data: {
    id: string;
    title: string;
    description: string;
    status: string;
    area: string | null;
    preferredWindow: string | null;
    scheduledFor: string | null;
    createdAt: string;
    notes: string | null;
  } | null = null;

  try {
    const supabase = await getSupabaseServerClient();
    const { data: row } = await supabase
      .from("service_requests")
      .select("id, title, description, status, area, preferred_window, scheduled_for, created_at, notes")
      .eq("id", id)
      .maybeSingle();
    if (row) {
      data = {
        id: row.id as string,
        title: row.title as string,
        description: (row.description as string) ?? "",
        status: (row.status as string) ?? "pending",
        area: (row.area as string) ?? null,
        preferredWindow: (row.preferred_window as string) ?? null,
        scheduledFor: (row.scheduled_for as string) ?? null,
        createdAt: row.created_at as string,
        notes: (row.notes as string) ?? null,
      };
    }
  } catch {
    /* DB not available — fall through to notFound */
  }

  if (!data) notFound();

  const createdLabel = new Date(data.createdAt).toLocaleString();

  return (
    <div className="space-y-6">
      <Link
        href="/app/requests"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> Back to all requests
      </Link>

      <Card animate={false}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="eyebrow">Request</p>
            <h1 className="display-section mt-2 text-3xl text-ink">{data.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-muted">
              {data.area ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {data.area}
                </span>
              ) : null}
              {data.preferredWindow ? (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> {data.preferredWindow}
                </span>
              ) : null}
            </div>
          </div>
          <StatusPill status={data.status} />
        </div>

        <p className="mt-5 text-sm leading-7 text-ink-muted">{data.description}</p>

        {data.notes ? (
          <div className="mt-5 rounded-2xl border border-border bg-canvas-elevated px-4 py-3 text-sm text-ink-muted">
            <span className="font-semibold text-ink">Access notes: </span>
            {data.notes}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2 text-xs text-ink-subtle">
          <Badge tone="default">Created {createdLabel}</Badge>
          {data.scheduledFor ? (
            <Badge tone="sky">Scheduled {new Date(data.scheduledFor).toLocaleString()}</Badge>
          ) : null}
        </div>
      </Card>

      <Card>
        <p className="eyebrow">Status history</p>
        <h2 className="display-section mt-2 text-2xl text-ink">Where your request stands</h2>
        <Timeline className="mt-6">
          <TimelineStep
            index="1"
            title="Request submitted"
            description={`You submitted this request on ${createdLabel}.`}
            tone="royal"
          />
          <TimelineStep
            index="2"
            title="Operator review"
            description="An operator reviews scope + confirms coverage. Typical: under 24 hours."
            tone={data.status === "pending" ? "muted" : "sky"}
          />
          <TimelineStep
            index="3"
            title="Scheduled"
            description={
              data.scheduledFor
                ? `Scheduled for ${new Date(data.scheduledFor).toLocaleString()}.`
                : "We'll confirm a window with you."
            }
            tone={data.scheduledFor ? "sky" : "muted"}
          />
          <TimelineStep
            index="4"
            title="Visit complete"
            description="Technician wraps up, ops sends a brief write-up."
            tone={data.status.toLowerCase() === "completed" ? "emerald" : "muted"}
            last
          />
        </Timeline>
      </Card>
    </div>
  );
}
