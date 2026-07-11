"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";
import { CheckCircle2, Info, XCircle } from "lucide-react";

type ToastVariant = "success" | "error" | "info";

interface ToastItem {
  id: number;
  message: string;
  variant: ToastVariant;
}

interface ToastContextValue {
  showToast: (message: string, variant?: ToastVariant) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    // Fail soft: components used outside the provider just no-op instead
    // of crashing the app.
    return { showToast: () => {} };
  }
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const idRef = useRef(0);

  const showToast = useCallback((message: string, variant: ToastVariant = "success") => {
    const id = ++idRef.current;
    setToasts((t) => [...t, { id, message, variant }]);
    setTimeout(() => {
      setToasts((t) => t.filter((toast) => toast.id !== id));
    }, 2500);
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[999] flex flex-col gap-2 items-center px-4 w-full pointer-events-none"
        style={{ maxWidth: 420 }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`pointer-events-auto flex items-center gap-2 text-white text-[13px] font-medium px-4 py-2.5 rounded-lg shadow-lg animate-[fadeIn_0.15s_ease-out] ${
              t.variant === "success"
                ? "bg-[#1F2937]"
                : t.variant === "error"
                ? "bg-zoom-red"
                : "bg-zoom-blue"
            }`}
          >
            {t.variant === "success" && <CheckCircle2 size={16} className="shrink-0 text-zoom-green" />}
            {t.variant === "error" && <XCircle size={16} className="shrink-0" />}
            {t.variant === "info" && <Info size={16} className="shrink-0" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
