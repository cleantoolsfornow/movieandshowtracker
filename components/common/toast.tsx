"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";

type ToastTone = "success" | "error" | "info";

type ToastState = {
  id: number;
  message: string;
  tone: ToastTone;
};

type ShowToastOptions = {
  tone?: ToastTone;
  durationMs?: number;
};

type ToastContextValue = {
  showToast: (message: string, options?: ShowToastOptions) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

function toneClasses(tone: ToastTone) {
  if (tone === "error") {
    return "border-red-200/85 bg-red-50/95 text-red-700";
  }
  if (tone === "info") {
    return "border-border-subtle/85 bg-surface-strong/95 text-foreground";
  }
  return "border-emerald-200/85 bg-emerald-50/95 text-emerald-700";
}

export function ToastProvider({ children }: PropsWithChildren) {
  const [toast, setToast] = useState<ToastState | null>(null);
  const timeoutRef = useRef<number | null>(null);

  const clearToastTimeout = useCallback(() => {
    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const showToast = useCallback(
    (message: string, options?: ShowToastOptions) => {
      const nextToastId = Date.now();
      const durationMs = options?.durationMs ?? 3000;
      const tone = options?.tone ?? "success";

      clearToastTimeout();
      setToast({
        id: nextToastId,
        message,
        tone,
      });

      timeoutRef.current = window.setTimeout(() => {
        setToast((current) =>
          current && current.id === nextToastId ? null : current,
        );
        timeoutRef.current = null;
      }, durationMs);
    },
    [clearToastTimeout],
  );

  useEffect(() => clearToastTimeout, [clearToastTimeout]);

  const dismissToast = useCallback(() => {
    clearToastTimeout();
    setToast(null);
  }, [clearToastTimeout]);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="pointer-events-none fixed inset-x-0 bottom-4 z-50 flex justify-center px-4 sm:bottom-5">
        {toast ? (
          <button
            type="button"
            onClick={dismissToast}
            role="status"
            aria-live="polite"
            className={`pointer-events-auto w-full max-w-xl cursor-pointer rounded-2xl border px-4 py-3 text-left text-sm shadow-elevated ${toneClasses(toast.tone)}`}
          >
            {toast.message}
          </button>
        ) : null}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within ToastProvider");
  }
  return context;
}
