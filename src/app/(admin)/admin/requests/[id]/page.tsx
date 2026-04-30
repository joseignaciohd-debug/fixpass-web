import { notFound } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  CalendarDays,
  Camera,
  CheckCircle2,
  ClipboardList,
  Image as ImageIcon,
  Mail,
  MapPin,
  Phone,
  Truck,
  User,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { StatusPill } from "@/components/ui/status-pill";
import { Timeline, TimelineStep } from "@/components/ui/timeline";
import { requireRole } from "@/lib/auth/session";
import { getSupabaseServerClient } from "@/lib/supabase/server";
import { ActionPanel } from "./action-panel";

export const dynamic = "force-dynamic";

// Mirrors the member-side page so the timeline reads consistently.
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

export default async function AdminRequestDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("admin", "/admin/requests");
  const { id } = await params;

  let req: {
    id: string;
    title: string;
    description: string;
    status: string;
    area: string | null;
    preferredWindow: string | null;
    scheduledFor: string | null;
    createdAt: string;
    notes: string | null;
    customerId: string | null;
  } | null = null;
  let customer: { name: string; email: string; phone: string } | null = null;
  let property: { address: string; nickname: string; accessNotes: string } | null = null;
  let events: Array<{
    id: string;
    kind: string;
    body: string | null;
    actorRole: string | null;
    actorName: string | null;
    createdAt: string;
  }> = [];
  let signedPhotoUrls: string[] = [];

  let supabase: Awaited<ReturnType<typeof getSupabaseServerClient>> | null = null;
  try {
    supabase = await getSupabaseServerClient();
  } catch {
    /* env missing */
  }

  if (supabase) {
    try {
      const { data: row } = await supabase
        .from("service_requests")
        .select(
          "id, title, description, status, area, preferred_window, scheduled_for, created_at, notes, customer_id",
        )
        .eq("id", id)
        .maybeSingle();
      if (row) {
        req = {
          id: row.id as string,
          title: (row.title as string) ?? "Request",
          description: (row.description as string) ?? "",
          status: (row.status as string) ?? "pending",
          area: (row.area as string) ?? null,
          preferredWindow: (row.preferred_window as string) ?? null,
          scheduledFor: (row.scheduled_for as string) ?? null,
          createdAt: row.created_at as string,
          notes: (row.notes as string) ?? null,
          customerId: (row.customer_id as string) ?? null,
        };
      }
    } catch {
      /* request fetch failed */
    }

    if (req?.customerId) {
      try {
        const { data: cu } = await supabase
          .from("customers")
          .select("user_id")
          .eq("id", req.customerId)
          .maybeSingle();

        if (cu?.user_id) {
          const [{ data: user }, { data: prop }] = await Promise.all([
            supabase
              .from("users")
              .select("full_name, email, phone")
              .eq("id", cu.user_id)
              .maybeSingle(),
            supabase
              .from("properties")
              .select("nickname, address_line1, city, state, postal_code, access_notes")
              .eq("user_id", cu.user_id)
              .maybeSingle(),
          ]);
          if (user) {
            customer = {
              name: (user.full_name as string) ?? "Member",
              email: (user.email as string) ?? "",
              phone: (user.phone as string) ?? "",
            };
          }
          if (prop) {
            property = {
              nickname: (prop.nickname as string) ?? "Home",
              address: [prop.address_line1, prop.city, prop.state, prop.postal_code]
                .filter(Boolean)
                .join(", "),
              accessNotes: (prop.access_notes as string) ?? "",
            };
          }
        }
      } catch {
        /* customer/property lookup failed — render what we have */
      }
    }

    try {
      const { data: rows } = await supabase
        .from("service_request_events")
        .select("id, kind, body, actor_role, actor_name, created_at")
        .eq("service_request_id", id)
        .order("created_at", { ascending: true });
      events = (rows ?? []).map((e) => ({
        id: e.id as string,
        kind: e.kind as string,
        body: (e.body as string) ?? null,
        actorRole: (e.actor_role as string) ?? null,
        actorName: (e.actor_name as string) ?? null,
        createdAt: e.created_at as string,
      }));
    } catch {
      /* events fetch failed */
    }

    try {
      const { data: rows } = await supabase
        .from("service_request_photos")
        .select("id, storage_path, created_at")
        .eq("service_request_id", id)
        .order("created_at", { ascending: true });
      const photos = rows ?? [];
      if (photos.length > 0) {
        const signed = await Promise.all(
          photos.map(async (p) => {
            const { data: u } = await supabase!.storage
              .from("service-request-photos")
              .createSignedUrl(p.storage_path as string, 60 * 5);
            return u?.signedUrl ?? null;
          }),
        );
        signedPhotoUrls = signed.filter((u): u is string => Boolean(u));
      }
    } catch {
      /* photos fetch failed */
    }
  }

  if (!req) notFound();

  const createdLabel = new Date(req.createdAt).toLocaleString();

  return (
    <div className="space-y-6">
      <Link
        href="/admin/requests"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-muted transition hover:text-ink"
      >
        <ArrowLeft className="h-4 w-4" /> All requests
      </Link>

      <Card animate={false}>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <p className="eyebrow">Request</p>
            <h1 className="display-section mt-2 text-3xl text-ink">{req.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink-muted">
              {req.area ? (
                <span className="inline-flex items-center gap-1">
                  <MapPin className="h-3.5 w-3.5" /> {req.area}
                </span>
              ) : null}
              {req.preferredWindow ? (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> Suggested: {req.preferredWindow}
                </span>
              ) : null}
              {req.scheduledFor ? (
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" /> Scheduled:{" "}
                  {new Date(req.scheduledFor).toLocaleString()}
                </span>
              ) : null}
            </div>
          </div>
          <StatusPill status={req.status} />
        </div>

        <p className="mt-5 text-sm leading-7 text-ink-muted">{req.description}</p>

        {req.notes ? (
          <div className="mt-5 rounded-2xl border border-border bg-canvas-elevated px-4 py-3 text-sm text-ink-muted">
            <span className="font-semibold text-ink">Member access notes: </span>
            {req.notes}
          </div>
        ) : null}

        <div className="mt-6 flex flex-wrap gap-2 text-xs text-ink-subtle">
          <Badge tone="default">Created {createdLabel}</Badge>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        {/* LEFT: Member + property + photos */}
        <div className="space-y-6">
          <Card>
            <p className="eyebrow">Member</p>
            <h2 className="display-section mt-2 text-xl text-ink">Who you&apos;re serving</h2>
            <div className="mt-5 grid gap-3 text-sm">
              <Row icon={User} label={customer?.name ?? "—"} />
              <Row
                icon={Mail}
                label={customer?.email || "—"}
                link={customer?.email ? `mailto:${customer.email}` : undefined}
              />
              <Row
                icon={Phone}
                label={customer?.phone || "—"}
                link={customer?.phone ? `tel:${customer.phone}` : undefined}
              />
              <Row
                icon={MapPin}
                label={property?.address || "—"}
              />
              {property?.accessNotes ? (
                <p className="mt-1 rounded-xl border border-border bg-canvas-elevated px-3 py-2 text-xs leading-5 text-ink-muted">
                  <span className="font-semibold text-ink">Property access notes: </span>
                  {property.accessNotes}
                </p>
              ) : null}
            </div>
          </Card>

          {signedPhotoUrls.length > 0 ? (
            <Card>
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="eyebrow">Reference photos</p>
                  <h2 className="display-section mt-2 text-xl text-ink">
                    {signedPhotoUrls.length === 1
                      ? "1 photo from the member"
                      : `${signedPhotoUrls.length} photos from the member`}
                  </h2>
                </div>
                <ImageIcon className="h-5 w-5 text-ink-subtle" aria-hidden />
              </div>
              <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
                {signedPhotoUrls.map((url, i) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noreferrer"
                    className="group relative aspect-square overflow-hidden rounded-2xl border border-border bg-canvas-elevated"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt={`Reference photo ${i + 1}`}
                      className="h-full w-full object-cover transition group-hover:scale-[1.03]"
                      loading="lazy"
                    />
                  </a>
                ))}
              </div>
            </Card>
          ) : null}

          <Card>
            <p className="eyebrow">Activity</p>
            <h2 className="display-section mt-2 text-xl text-ink">Full event history</h2>
            {events.length === 0 ? (
              <p className="mt-5 text-sm leading-7 text-ink-muted">
                No events recorded yet for this request.
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

        {/* RIGHT: Action panel */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          <Card>
            <p className="eyebrow">Operator actions</p>
            <h2 className="display-section mt-2 text-xl text-ink">Move this request forward</h2>
            <p className="mt-2 text-xs leading-5 text-ink-muted">
              Each action writes a timeline event the member can see, and updates the request status.
            </p>
            <div className="mt-5">
              <ActionPanel
                requestId={req.id}
                status={req.status}
                preferredWindow={req.preferredWindow}
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}

function Row({
  icon: Icon,
  label,
  link,
}: {
  icon: LucideIcon;
  label: string;
  link?: string;
}) {
  const inner = (
    <span className="inline-flex items-center gap-2.5 text-ink">
      <Icon className="h-4 w-4 text-ink-subtle" aria-hidden />
      <span className="truncate">{label}</span>
    </span>
  );
  if (link) {
    return (
      <a href={link} className="focus-ring -mx-1 block rounded-md px-1 hover:bg-canvas-elevated">
        {inner}
      </a>
    );
  }
  return <div>{inner}</div>;
}
