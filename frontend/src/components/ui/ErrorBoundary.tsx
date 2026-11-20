import React from "react";
import { AlertTriangle, RotateCcw } from "lucide-react";

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, errorMessage: "" };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, errorMessage: error?.message || "An unexpected UI error occurred." };
  }

  componentDidCatch(error: Error) {
    console.error("SYNAPSE ErrorBoundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 24,
            background: "var(--bg-main)",
          }}
        >
          <div className="card" style={{ maxWidth: 460, width: "100%", textAlign: "center", padding: 32 }}>
            <div
              style={{
                width: 48,
                height: 48,
                borderRadius: 12,
                background: "var(--error-light)",
                color: "var(--error)",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <AlertTriangle size={24} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>Something went wrong</h2>
            <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 20 }}>
              {this.state.errorMessage}
            </p>
            <button
              type="button"
              className="btn-primary"
              onClick={() => {
                this.setState({ hasError: false, errorMessage: "" });
                window.location.reload();
              }}
            >
              <RotateCcw size={14} /> Reload Workspace
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
