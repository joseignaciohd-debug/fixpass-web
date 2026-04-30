"use client";

// Operator action panel — collapses the seven status transitions
// into a tabbed accordion so the screen stays calm. Each tab carries
// its own form + server-action call; success refreshes the page so
// the events timeline + status pill update with the new state.
//
// Designed for one-handed ops work: tab → fill → submit → done.
// No client-side optimistic state; the server is the source of truth
// and revalidatePath() in each action invalidates the cache.

import { CheckCircle2, ClipboardList, MessageSquarePlus, Truck, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  addOperatorNote,
  cancelRequest,
  confirmScheduling,
  markCompleted,
  markEnRoute,
  markReviewed,
  proposeAlternateWindow,
} from "@/app/(admin)/admin/requests/actions";
import { TECHNICIANS } from "@/lib/config/technicians";

type TabId =
  | "review"
  | "confirm"
  | "propose"
  | "en_route"
  | "complete"
  | "note"
  | "cancel";

const TABS: Array<{ id: TabId; label: string; icon: typeof ClipboardList; tone: string }> = [
  { id: "review",   label: "Mark reviewed",  icon: ClipboardList,    tone: "sky" },
  { id: "confirm",  label: "Confirm window", icon: CheckCircle2,     tone: "emerald" },
  { id: "propose",  label: "Propose window", icon: MessageSquarePlus,tone: "honey" },
  { id: "en_route", label: "En route",       icon: Truck,            tone: "sky" },
  { id: "complete", label: "Mark complete",  icon: CheckCircle2,     tone: "emerald" },
  { id: "note",     label: "Add note",       icon: MessageSquarePlus,tone: "default" },
  { id: "cancel",   label: "Cancel",         icon: X,                tone: "brick" },
];

export function ActionPanel({
  requestId,
  status,
  preferredWindow,
}: {
  requestId: string;
  status: string;
  preferredWindow: string | null;
}) {
  const [tab, setTab] = useState<TabId>(suggestedTab(status));
  const [pending, start] = useTransition();
  const [banner, setBanner] = useState<{ kind: "ok" | "err"; msg: string } | null>(null);
  const router = useRouter();

  function run(fn: () => Promise<{ ok?: true; error?: string } | { error: string }>) {
    setBanner(null);
    start(async () => {
      const res = await fn();
      if ("error" in res && res.error) {
        setBanner({ kind: "err", msg: res.error });
        return;
      }
      setBanner({ kind: "ok", msg: "Done." });
      router.refresh();
    });
  }

  return (
    <div className="grid gap-4">
      <div className="flex flex-wrap gap-1.5 rounded-2xl border border-border bg-canvas-elevated p-1.5">
        {TABS.map((t) => {
          const Icon = t.icon;
          const active = tab === t.id;
          return (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`focus-ring inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                active ? "bg-ink text-white" : "text-ink-muted hover:text-ink"
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="rounded-2xl border border-border bg-surface p-5">
        {tab === "review" && (
          <SimpleNoteForm
            label="Optional note (member sees this)"
            placeholder="Reviewed scope; routing to scheduling shortly."
            cta="Mark reviewed"
            disabled={pending}
            onSubmit={(body) =>
              run(() => markReviewed({ requestId, note: body || undefined }))
            }
          />
        )}

        {tab === "confirm" && (
          <ConfirmForm
            requestId={requestId}
            preferredWindow={preferredWindow}
            disabled={pending}
            onSubmit={(payload) => run(() => confirmScheduling(payload))}
          />
        )}

        {tab === "propose" && (
          <SimpleNoteForm
            label="Proposed window"
            placeholder="Friday 1–3 PM works on our side. Could also do Saturday morning."
            cta="Send proposal"
            disabled={pending}
            onSubmit={(proposal) =>
              run(() => proposeAlternateWindow({ requestId, proposal }))
            }
          />
        )}

        {tab === "en_route" && (
          <EnRouteForm
            requestId={requestId}
            disabled={pending}
            onSubmit={(payload) => run(() => markEnRoute(payload))}
          />
        )}

        {tab === "complete" && (
          <SimpleNoteForm
            label="Visit summary (member sees this)"
            placeholder="Three drywall holes patched, paint touched up; texture matches surrounding wall."
            cta="Mark complete"
            disabled={pending}
            onSubmit={(summary) => run(() => markCompleted({ requestId, summary }))}
          />
        )}

        {tab === "note" && (
          <SimpleNoteForm
            label="Operator note"
            placeholder="Leaving a note visible on the member's timeline."
            cta="Add note"
            disabled={pending}
            onSubmit={(body) => run(() => addOperatorNote({ requestId, body }))}
          />
        )}

        {tab === "cancel" && (
          <SimpleNoteForm
            label="Reason for cancellation (member sees this)"
            placeholder="Out of scope; quoted separately under member discount."
            cta="Cancel request"
            ctaTone="brick"
            disabled={pending}
            onSubmit={(reason) => run(() => cancelRequest({ requestId, reason }))}
          />
        )}
      </div>

      {banner ? <ActionBanner kind={banner.kind} msg={banner.msg} /> : null}
    </div>
  );
}

function suggestedTab(status: string): TabId {
  switch (status.toLowerCase()) {
    case "pending":
      return "review";
    case "under review":
      return "confirm";
    case "scheduled":
      return "en_route";
    case "completed":
    case "cancelled":
      return "note";
    default:
      return "review";
  }
}

function SimpleNoteForm({
  label,
  placeholder,
  cta,
  ctaTone,
  disabled,
  onSubmit,
}: {
  label: string;
  placeholder: string;
  cta: string;
  ctaTone?: "brick";
  disabled?: boolean;
  onSubmit: (value: string) => void;
}) {
  const [value, setValue] = useState("");
  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(value.trim());
      }}
    >
      <label className="grid gap-1.5 text-sm font-medium text-ink">
        {label}
        <textarea
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
          className="fp-input resize-y"
          placeholder={placeholder}
        />
      </label>
      <div className="flex justify-end">
        <Button
          type="submit"
          variant={ctaTone === "brick" ? "destructive" : "primary"}
          loading={disabled}
        >
          {cta}
        </Button>
      </div>
    </form>
  );
}

function ConfirmForm({
  requestId,
  preferredWindow,
  disabled,
  onSubmit,
}: {
  requestId: string;
  preferredWindow: string | null;
  disabled?: boolean;
  onSubmit: (payload: {
    requestId: string;
    scheduledFor: string;
    technicianId: string;
    note?: string;
  }) => void;
}) {
  const [scheduledFor, setScheduledFor] = useState<string>(defaultDateTime());
  const [technicianId, setTechnicianId] = useState<string>(TECHNICIANS[0].id);
  const [note, setNote] = useState<string>("");

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({
          requestId,
          scheduledFor,
          technicianId,
          note: note.trim() || undefined,
        });
      }}
    >
      {preferredWindow ? (
        <p className="rounded-xl border border-border bg-canvas-elevated px-3 py-2 text-xs text-ink-muted">
          <span className="font-semibold text-ink">Member suggested:</span> {preferredWindow}
        </p>
      ) : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Scheduled date + start
          <input
            type="datetime-local"
            value={scheduledFor}
            onChange={(e) => setScheduledFor(e.target.value)}
            className="fp-input"
            required
          />
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Technician
          <select
            className="fp-input"
            value={technicianId}
            onChange={(e) => setTechnicianId(e.target.value)}
          >
            {TECHNICIANS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
      </div>
      <label className="grid gap-1.5 text-sm font-medium text-ink">
        Optional note (member sees this)
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          className="fp-input resize-y"
          placeholder="Confirmed for the window you proposed. Nicolas will text from the truck on the way."
        />
      </label>
      <div className="flex justify-end">
        <Button type="submit" variant="primary" loading={disabled}>
          Confirm + schedule
        </Button>
      </div>
    </form>
  );
}

function EnRouteForm({
  requestId,
  disabled,
  onSubmit,
}: {
  requestId: string;
  disabled?: boolean;
  onSubmit: (payload: {
    requestId: string;
    technicianId: string;
    eta?: string;
  }) => void;
}) {
  const [technicianId, setTechnicianId] = useState<string>(TECHNICIANS[0].id);
  const [eta, setEta] = useState<string>("");

  return (
    <form
      className="grid gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit({ requestId, technicianId, eta: eta.trim() || undefined });
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          Technician
          <select
            className="fp-input"
            value={technicianId}
            onChange={(e) => setTechnicianId(e.target.value)}
          >
            {TECHNICIANS.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium text-ink">
          ETA (optional)
          <input
            type="text"
            value={eta}
            onChange={(e) => setEta(e.target.value)}
            className="fp-input"
            placeholder="20 minutes"
          />
        </label>
      </div>
      <div className="flex justify-end">
        <Button type="submit" variant="primary" loading={disabled}>
          Mark en route
        </Button>
      </div>
    </form>
  );
}

function ActionBanner({ kind, msg }: { kind: "ok" | "err"; msg: string }): ReactNode {
  return (
    <div
      role={kind === "err" ? "alert" : "status"}
      className={`rounded-2xl border px-4 py-3 text-sm ${
        kind === "err"
          ? "border-brick/25 bg-brick-soft text-brick-ink"
          : "border-emerald/25 bg-emerald-soft text-emerald-ink"
      }`}
    >
      {msg}
    </div>
  );
}

// ISO-formatted datetime for an `<input type="datetime-local">`
// initial value (next 10am, local time) — gives the operator a sane
// default that's far enough out to be realistic.
function defaultDateTime(): string {
  const d = new Date();
  d.setDate(d.getDate() + 1);
  d.setHours(10, 0, 0, 0);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}
