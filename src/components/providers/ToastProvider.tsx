"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";

type ToastTone = "success" | "error" | "info";

interface Toast {
  id: number;
  message: string;
  tone: ToastTone;
}

interface ToastApi {
  notify: (message: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastApi>({ notify: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

const TONE_STYLES: Record<ToastTone, string> = {
  success: "border-leaf/30 bg-white text-ink",
  error: "border-femi-300 bg-white text-ink",
  info: "border-femi-200 bg-white text-ink",
};

const TONE_ICON: Record<ToastTone, string> = {
  success: "✓",
  error: "!",
  info: "i",
};

const TONE_BADGE: Record<ToastTone, string> = {
  success: "bg-leaf text-white",
  error: "bg-femi-600 text-white",
  info: "bg-femi-100 text-femi-700",
};

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const notify = useCallback((message: string, tone: ToastTone = "success") => {
    const id = Date.now() + Math.random();
    setToasts((current) => [...current.slice(-2), { id, message, tone }]);
    setTimeout(() => setToasts((current) => current.filter((t) => t.id !== id)), 4000);
  }, []);

  const value = useMemo(() => ({ notify }), [notify]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        aria-atomic="false"
        className="pointer-events-none fixed inset-x-0 bottom-20 z-[80] flex flex-col items-center gap-2 px-4 sm:bottom-6"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-rise pointer-events-auto flex w-full max-w-sm items-center gap-3 rounded-2xl border px-4 py-3 shadow-soft ${TONE_STYLES[toast.tone]}`}
          >
            <span
              aria-hidden
              className={`grid size-6 shrink-0 place-items-center rounded-full text-xs font-bold ${TONE_BADGE[toast.tone]}`}
            >
              {TONE_ICON[toast.tone]}
            </span>
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
