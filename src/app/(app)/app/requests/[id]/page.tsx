import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardList,
  Image as ImageIcon,
  MapPin,
  Truck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { Timeline, TimelineStep } from "@/components/ui/timeline";
import { getSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

// Event kinds match the migration's check constraint exactly. Each
// gets a label, an icon, and a tone so the timeline reads like a
// real activity feed instead of a generic 4-step bar.
const EVENT_META: Record<
  string,
  { label: string; icon: LucideIcon; tone: "royal" | "sky" | "emerald" | "muted" | "honey" }
> = {
  submitted:         { label: "Request submitted",     icon: ClipboardList, tone: "royal" },
  reviewed:          { label: "Operator reviewed",     icon: CheckCircle2,  tone: "sky" },
  scheduled:         { label: "Scheduled",             icon: CalendarDays,  tone: "sky" },
  rescheduled:       { label: "Rescheduled",           icon: CalendarDays,  tone: "honey" },
  en_route:          { label: "Technician en route",   icon: Truck,         tone: "sky" },
  arrived:           { label: "Technician on site",    icon: MapPin,        tone: "sky" },
  photo_added:       { label: "Photo added",           icon: Camera,        tone: "muted" },
  note_added:        { label: "Note added",            icon: ClipboardList, tone: "muted" },
  completed:         { label: "Visit complete",        icon: CheckCircle2,  tone: "emerald" },
  cancelled:         { label: "Cancelled",             icon: ClipboardList, tone: "muted" },
  quoted_separately: { label: "Quoted separately",     icon: ClipboardList, tone: "honey" },
};

type EventRow = {
  id: string;
  kind: string;
  body: string | null;
  actorRole: string | null;
  actorName: string | null;
  metadata: Record<string, unknown> | null;
  createdAt: string;
};

type PhotoRow = { id: string; storagePath: string; createdAt: string };

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
  let events: EventRow[] = [];
  let photos: PhotoRow[] = [];
  let signedPhotoUrls: string[] = [];

  // Each query is wrapped in its own try so a missing table (e.g.
  // before migration 007 has been applied) only degrades the page
  // gracefully instead of taking it down to notFound.
  let supabase: Awaited<ReturnType<typeof getSupabaseServerClient>> | null = null;
  try {
    supabase = await getSupabaseServerClient();
  } catch {
    /* env not configured — handled below by data being null */
  }

  if (supabase) {
    try {
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
      /* request row failed — fall through to notFound */
    }

    try {
      const { data: rows } = await supabase
        .from("service_request_events")
        .select("id, kind, body, actor_role, actor_name, metadata, created_at")
        .eq("service_request_id", id)
        .order("created_at", { ascending: true });
      events = (rows ?? []).map((e) => ({
        id: e.id as string,
        kind: e.kind as string,
        body: (e.body as string) ?? null,
        actorRole: (e.actor_role as string) ?? null,
        actorName: (e.actor_name as string) ?? null,
        metadata: (e.metadata as Record<string, unknown>) ?? null,
        createdAt: e.created_at as string,
      }));
    } catch {
      /* events table missing (pre-migration) — page still renders */
    }

    try {
      const { data: rows } = await supabase
        .from("service_request_photos")
        .select("id, storage_path, created_at")
        .eq("service_request_id", id)
        .order("created_at", { ascending: true });
      photos = (rows ?? []).map((p) => ({
        id: p.id as string,
        storagePath: p.storage_path as string,
        createdAt: p.created_at as string,
      }));

      // Sign photo URLs server-side so the client never needs the
      // service-role key. 5-minute expiry is plenty for a page render.
      if (photos.length > 0) {
        const signed = await Promise.all(
          photos.map(async (p) => {
            const { data: u } = await supabase!.storage
              .from("service-request-photos")
              .createSignedUrl(p.storagePath, 60 * 5);
            return u?.signedUrl ?? null;
          }),
        );
        signedPhotoUrls = signed.filter((u): u is string => Boolean(u));
      }
    } catch {
      /* photos table / bucket missing — page still renders */
    }
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

      {/* Photo strip — only renders when the customer attached
          photos. Signed URLs are minted server-side so RLS still
          guards the bucket. */}
      {signedPhotoUrls.length > 0 ? (
        <Card>
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="eyebrow">Attached photos</p>
              <h2 className="display-section mt-2 text-xl text-ink">
                {signedPhotoUrls.length === 1
                  ? "1 reference photo"
                  : `${signedPhotoUrls.length} reference photos`}
              </h2>
            </div>
            <ImageIcon className="h-5 w-5 text-ink-subtle" aria-hidden />
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {signedPhotoUrls.map((url, i) => (
              <div
                key={url}
                className="relative aspect-square overflow-hidden rounded-2xl border border-border bg-canvas-elevated"
              >
                {/* Plain <img> here — Next/Image needs config to allow
                    Supabase signed URLs as a remote pattern, and the
                    images are short-lived anyway. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={url}
                  alt={`Reference photo ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {/* Activity feed — driven by service_request_events. Replaces
          the old hardcoded 4-step timeline. */}
      <Card>
        <p className="eyebrow">Activity</p>
        <h2 className="display-section mt-2 text-2xl text-ink">Where your request stands</h2>
        {events.length === 0 ? (
          <p className="mt-5 text-sm leading-7 text-ink-muted">
            Activity will appear here as the operator reviews and dispatches your request.
          </p>
        ) : (
          <Timeline className="mt-6">
            {events.map((e, i) => {
              const meta = EVENT_META[e.kind] ?? {
                label: e.kind,
                icon: ClipboardList,
                tone: "muted" as const,
              };
              const when = new Date(e.createdAt).toLocaleString([], {
                month: "short",
                day: "numeric",
                hour: "numeric",
                minute: "2-digit",
              });
              const description = [e.body, e.actorName ? `— ${e.actorName}` : null]
                .filter(Boolean)
                .join(" ");
              return (
                <TimelineStep
                  key={e.id}
                  index={i + 1}
                  title={meta.label}
                  description={description || undefined}
                  meta={when}
                  tone={meta.tone}
                  last={i === events.length - 1}
                />
              );
            })}
          </Timeline>
        )}
      </Card>
    </div>
  );
}

