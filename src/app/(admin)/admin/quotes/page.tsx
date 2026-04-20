import { FileText } from "lucide-react";
import { Card } from "@/components/ui/card";

export const dynamic = "force-dynamic";

export default function AdminQuotesPage() {
  return (
    <Card>
      <div className="flex flex-col items-center justify-center gap-3 p-10 text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-soft text-sky-ink">
          <FileText className="h-5 w-5" />
        </div>
        <p className="font-[family-name:var(--font-display)] text-lg font-semibold text-ink">
          No quotes pending.
        </p>
        <p className="max-w-sm text-sm text-ink-muted">
          When operators flag out-of-scope work, quote opportunities will appear here ready to draft
          and send.
        </p>
      </div>
    </Card>
  );
}
