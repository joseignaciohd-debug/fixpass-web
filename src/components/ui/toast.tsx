"use client";

// Toast system — matches the mobile app's ToastProvider API
// (`show(message, tone)`). Auto-dismiss after 4s, aria-live, stacked
// bottom-right on desktop / bottom-center on mobile.

import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Info, TriangleAlert, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastTone = "info" | "success" | "error";

type Toast = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ToastContextValue = {
  show: (message: string, tone?: ToastTone) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const show = useCallback(
    (message: string, tone: ToastTone = "info") => {
      const id = Date.now() + Math.random();
      setToasts((prev) => [...prev, { id, message, tone }]);
      window.setTimeout(() => dismiss(id), 4000);
    },
    [dismiss],
  );

  const value = useMemo(() => ({ show }), [show]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastViewport toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  // No-op fallback for SSR / outside-provider uses.
  if (!ctx) return { show: () => {} };
  return ctx;
}

function ToastViewport({
  toasts,
  onDismiss,
}: {
  toasts: Toast[];
  onDismiss: (id: number) => void;
}) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-6 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-8 sm:right-8 sm:left-auto sm:items-end"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={() => onDismiss(toast.id)} />
        ))}
      </AnimatePresence>
    </div>
  );
}

function ToastCard({ toast, onDismiss }: { toast: Toast; onDismiss: () => void }) {
  const tones: Record<ToastTone, { ring: string; icon: React.ReactNode }> = {
    info: {
      ring: "ring-border",
      icon: <Info className="h-4 w-4 text-sky" aria-hidden />,
    },
    success: {
      ring: "ring-emerald/40",
      icon: <CheckCircle2 className="h-4 w-4 text-emerald" aria-hidden />,
    },
    error: {
      ring: "ring-brick/40",
      icon: <TriangleAlert className="h-4 w-4 text-brick" aria-hidden />,
    },
  };
  const t = tones[toast.tone];

  return (
    <motion.div
      role={toast.tone === "error" ? "alert" : "status"}
      initial={{ opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 8, scale: 0.98 }}
      transition={{ type: "spring", stiffness: 360, damping: 30 }}
      className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-[var(--radius-md)] bg-surface p-4 shadow-[0_24px_64px_-36px_rgb(var(--shadow)/0.25)] ring-1 ${t.ring}`}
    >
      <div className="mt-0.5">{t.icon}</div>
      <div className="flex-1 text-sm leading-snug text-ink">{toast.message}</div>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Dismiss"
        className="focus-ring rounded-full p-1 text-ink-subtle transition hover:text-ink"
      >
        <X className="h-3.5 w-3.5" aria-hidden />
      </button>
    </motion.div>
  );
}
