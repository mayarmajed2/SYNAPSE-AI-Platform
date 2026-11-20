import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

type ToastType = "success" | "error" | "info";

interface Toast {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextValue {
  toast: (title: string, options?: { type?: ToastType; message?: string; duration?: number }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const toast = useCallback(
    (title: string, options?: { type?: ToastType; message?: string; duration?: number }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const type = options?.type || "info";
      const duration = options?.duration ?? 4000;
      setToasts((prev) => [...prev.slice(-4), { id, type, title, message: options?.message }]);
      if (duration > 0) {
        setTimeout(() => dismiss(id), duration);
      }
    },
    [dismiss]
  );

  const success = useCallback((title: string, message?: string) => toast(title, { type: "success", message }), [toast]);
  const error = useCallback((title: string, message?: string) => toast(title, { type: "error", message, duration: 5500 }), [toast]);
  const info = useCallback((title: string, message?: string) => toast(title, { type: "info", message }), [toast]);

  return (
    <ToastContext.Provider value={{ toast, success, error, info }}>
      {children}
      <div
        style={{
          position: "fixed",
          bottom: 20,
          right: 20,
          zIndex: 9999,
          display: "flex",
          flexDirection: "column",
          gap: 10,
          maxWidth: 380,
          width: "calc(100vw - 32px)",
          pointerEvents: "none",
        }}
      >
        {toasts.map((t) => {
          const border =
            t.type === "success"
              ? "rgba(56, 189, 248, 0.42)"
              : t.type === "error"
              ? "rgba(251, 113, 133, 0.38)"
              : "rgba(255, 255, 255, 0.16)";
          const iconColor =
            t.type === "success" ? "var(--success)" : t.type === "error" ? "var(--error)" : "var(--primary-accent)";
          return (
            <div
              key={t.id}
              className="fade-in"
              style={{
                pointerEvents: "auto",
                background: "#151820",
                border: `1px solid ${border}`,
                borderRadius: 12,
                padding: "12px 14px",
                boxShadow: "var(--shadow-lg)",
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
              }}
            >
              <div style={{ color: iconColor, marginTop: 1, flexShrink: 0 }}>
                {t.type === "success" ? (
                  <CheckCircle2 size={17} />
                ) : t.type === "error" ? (
                  <AlertCircle size={17} />
                ) : (
                  <Info size={17} />
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{t.title}</div>
                {t.message && (
                  <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>{t.message}</div>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismiss(t.id)}
                aria-label="Dismiss notification"
                style={{
                  background: "none",
                  border: "none",
                  color: "var(--text-muted)",
                  cursor: "pointer",
                  padding: 2,
                }}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
