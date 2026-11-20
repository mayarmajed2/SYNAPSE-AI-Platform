import React from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export const ErrorBanner: React.FC<{
  message: string;
  onRetry?: () => void;
}> = ({ message, onRetry }) => (
  <div
    className="fade-in"
    style={{
      background: "var(--error-light)",
      border: "1px solid #FECACA",
      borderRadius: 12,
      padding: "12px 16px",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: 12,
      flexWrap: "wrap",
    }}
  >
    <div style={{ display: "flex", alignItems: "center", gap: 10, color: "var(--error)", fontSize: 13, fontWeight: 500 }}>
      <AlertCircle size={16} style={{ flexShrink: 0 }} />
      <span>{message}</span>
    </div>
    {onRetry && (
      <button type="button" className="btn-secondary btn-sm" onClick={onRetry}>
        <RefreshCw size={13} /> Retry
      </button>
    )}
  </div>
);

export const EmptyState: React.FC<{
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div
    className="card fade-in"
    style={{
      textAlign: "center",
      padding: "48px 24px",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      gap: 10,
    }}
  >
    <div
      style={{
        width: 48,
        height: 48,
        borderRadius: 12,
        background: "var(--bg-subtle)",
        color: "var(--text-muted)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        marginBottom: 4,
      }}
    >
      {icon}
    </div>
    <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--text-primary)" }}>{title}</h3>
    <p style={{ fontSize: 13, color: "var(--text-secondary)", maxWidth: 420 }}>{description}</p>
    {action && <div style={{ marginTop: 8 }}>{action}</div>}
  </div>
);

export const LoadingSkeleton: React.FC<{ rows?: number }> = ({ rows = 3 }) => (
  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
    <div className="grid-kpi">
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="card" style={{ padding: 20 }}>
          <div className="skeleton" style={{ height: 12, width: "45%", marginBottom: 14 }} />
          <div className="skeleton" style={{ height: 28, width: "60%", marginBottom: 10 }} />
          <div className="skeleton" style={{ height: 10, width: "75%" }} />
        </div>
      ))}
    </div>
    {Array.from({ length: rows }).map((_, i) => (
      <div key={i} className="card" style={{ padding: 20 }}>
        <div className="skeleton" style={{ height: 16, width: "35%", marginBottom: 12 }} />
        <div className="skeleton" style={{ height: 12, width: "90%", marginBottom: 8 }} />
        <div className="skeleton" style={{ height: 12, width: "70%" }} />
      </div>
    ))}
  </div>
);
