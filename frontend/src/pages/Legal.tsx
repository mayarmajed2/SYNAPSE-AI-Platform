import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Mail, Shield, FileText } from "lucide-react";
import { SynapseLogo } from "../components/ui/SynapseLogo";

export const LegalPage: React.FC<{ section: "terms" | "privacy" | "support" }> = ({ section }) => {
  return (
    <div style={{ minHeight: "100vh", color: "var(--text-primary)" }}>
      <header
        style={{
          background: "rgba(9, 9, 16, 0.8)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border-color)",
          padding: "0 28px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link to="/" style={{ textDecoration: "none" }}>
          <SynapseLogo size={34} showWordmark />
        </Link>
        <Link to="/" className="btn-secondary btn-sm">
          <ArrowLeft size={13} /> Back to Home
        </Link>
      </header>

      <main style={{ maxWidth: 820, margin: "0 auto", padding: "48px 24px 80px" }}>
        <div className="card fade-in" style={{ padding: 32, display: "flex", flexDirection: "column", gap: 18 }}>
          {section === "terms" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <FileText size={20} color="#A78BFA" />
                <h1 style={{ fontSize: 26, fontWeight: 800 }}>Terms of Service</h1>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Effective Date: November 2026</p>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
                By accessing or using SYNAPSE, you retain 100% ownership of all source code, architectural
                specifications, documentation, and artifacts generated within your workspace. You are responsible
                for reviewing generated code, security audit findings, and QA assertions prior to production deployment.
              </p>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Subscriptions &amp; Quotas</h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
                Starter workspaces include up to 3 active projects at no cost. Pro and Enterprise plans provide
                unlimited autonomous builds, human approval governance, and priority support. Subscriptions may be
                cancelled at any time from Workspace Settings.
              </p>
            </>
          )}

          {section === "privacy" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Shield size={20} color="#38BDF8" />
                <h1 style={{ fontSize: 26, fontWeight: 800 }}>Privacy Policy</h1>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-muted)" }}>Effective Date: November 2026</p>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
                SYNAPSE isolates project data, artifacts, and audit trails per workspace. Account passwords are
                protected using PBKDF2-HMAC-SHA256 hashing with per-user salts, and sessions are authenticated via
                signed HS256 JWT tokens. Self-hosted deployments transmit zero telemetry to external servers.
              </p>
              <h2 style={{ fontSize: 16, fontWeight: 700 }}>Data Retention &amp; Deletion</h2>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
                Deleting a project permanently removes its associated workflows, tasks, artifacts, test runs, and
                security scans from your workspace database.
              </p>
            </>
          )}

          {section === "support" && (
            <>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <Mail size={20} color="#FF4D8D" />
                <h1 style={{ fontSize: 26, fontWeight: 800 }}>Support &amp; Enterprise Contact</h1>
              </div>
              <p style={{ color: "var(--text-secondary)", lineHeight: 1.7 }}>
                Need help configuring Groq LLM providers, Docker sandbox isolation, Stripe billing, or VPC deployment?
              </p>
              <div className="grid-2col">
                <div style={{ padding: 18, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Technical Support</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>support@synapse.ai</div>
                </div>
                <div style={{ padding: 18, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontWeight: 700, marginBottom: 6 }}>Enterprise &amp; Security</div>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>enterprise@synapse.ai</div>
                </div>
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
};
