import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, Cpu, ArrowRight, Sparkles, Building2, Shield } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { api } from "../services/api";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    badge: "Free Forever",
    monthly: 0,
    annual: 0,
    desc: "For solo founders and engineers evaluating autonomous multi-agent delivery.",
    cta: "Start Free",
    highlight: false,
    features: [
      "Up to 3 active projects",
      "All 10 specialized AI engineering agents",
      "Interactive Workflow Studio & Code Workspace",
      "Automated AST syntax & SAST security scans",
      "Full ZIP codebase & Markdown report export",
      "Community support & self-hosted SQLite/Postgres",
    ],
  },
  {
    id: "pro",
    name: "Pro",
    badge: "Most Popular",
    monthly: 49,
    annual: 39,
    desc: "For fast-moving startups shipping production software with governance.",
    cta: "Upgrade to Pro",
    highlight: true,
    features: [
      "Unlimited autonomous projects & workspaces",
      "Human-in-the-loop Architecture Approval Gates",
      "Custom LLM model routing (Llama 3.3 / Fast models)",
      "Persistent audit logs & JSON event inspection",
      "Executive 18-section Engineering Delivery Dossiers",
      "Priority email & architecture support",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    badge: "Custom",
    monthly: null,
    annual: null,
    desc: "For engineering organizations needing VPC isolation, SSO, and SLAs.",
    cta: "Contact Sales",
    highlight: false,
    features: [
      "Dedicated VPC / On-Premise Docker & Kubernetes",
      "SAML SSO, SCIM & granular Role-Based Access Control",
      "Custom agent system prompts & security policy packs",
      "Containerized sandbox runners with custom dependencies",
      "Dedicated solutions architect & 99.9% SLA",
      "Custom billing, invoicing & security review",
    ],
  },
];

export const Pricing: React.FC = () => {
  const [annual, setAnnual] = useState(true);
  const { isAuthenticated, user, refreshUser } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [updatingPlan, setUpdatingPlan] = useState<string | null>(null);

  const currentPlan = user?.workspace?.plan || "";

  const handleSelectPlan = async (planId: string) => {
    if (planId === "enterprise") {
      success("Enterprise inquiry noted", "Contact enterprise@synapse.ai to schedule a dedicated deployment review.");
      return;
    }
    if (!isAuthenticated) {
      navigate("/register");
      return;
    }
    setUpdatingPlan(planId);
    try {
      await api.updateSettings({ plan: planId });
      await refreshUser();
      success(`Workspace switched to ${planId.toUpperCase()}`, "Your workspace configuration has been updated.");
      navigate("/app/settings");
    } catch (err: any) {
      error("Could not update plan", err?.message || "Please try again.");
    } finally {
      setUpdatingPlan(null);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--text-primary)" }}>
      <header
        style={{
          background: "rgba(8, 13, 28, 0.88)",
          backdropFilter: "blur(14px)",
          borderBottom: "1px solid var(--border-color)",
          padding: "0 24px",
          height: 64,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
            }}
          >
            <Cpu size={16} />
          </div>
          <span style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em" }}>SYNAPSE</span>
        </Link>

        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Link to="/" className="btn-ghost">Home</Link>
          {isAuthenticated ? (
            <Link to="/app" className="btn-primary">Open Workspace <ArrowRight size={14} /></Link>
          ) : (
            <Link to="/login" className="btn-primary">Sign In <ArrowRight size={14} /></Link>
          )}
        </div>
      </header>

      <main style={{ maxWidth: 1120, margin: "0 auto", padding: "56px 24px 80px" }}>
        <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 40px" }}>
          <span className="badge badge-primary" style={{ marginBottom: 14 }}>
            <Sparkles size={12} /> Transparent SaaS & Self-Hosted Pricing
          </span>
          <h1 style={{ fontSize: "clamp(28px, 4vw, 42px)", fontWeight: 800, letterSpacing: "-0.03em", marginBottom: 12 }}>
            Scale Your Engineering Output Without Scaling Burn
          </h1>
          <p style={{ fontSize: 15, color: "var(--text-secondary)", marginBottom: 24 }}>
            Start free with all 10 autonomous agents. Upgrade when your team needs unlimited pipelines and enterprise governance.
          </p>

          {/* Billing Toggle */}
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: 4,
              background: "rgba(15, 23, 42, 0.85)",
              border: "1px solid var(--border-color)",
              borderRadius: 999,
            }}
          >
            <button
              type="button"
              onClick={() => setAnnual(false)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: "none",
                background: !annual ? "var(--primary-accent)" : "transparent",
                color: !annual ? "#FFFFFF" : "var(--text-secondary)",
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Monthly
            </button>
            <button
              type="button"
              onClick={() => setAnnual(true)}
              style={{
                padding: "6px 14px",
                borderRadius: 999,
                border: "none",
                background: annual ? "var(--primary-accent)" : "transparent",
                color: annual ? "#FFFFFF" : "var(--text-secondary)",
                fontSize: 12.5,
                fontWeight: 600,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              Annual <span className="badge badge-success" style={{ padding: "1px 6px", fontSize: 10 }}>Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid-3col" style={{ alignItems: "stretch" }}>
          {PLANS.map((plan) => {
            const price = annual ? plan.annual : plan.monthly;
            const isCurrent = isAuthenticated && currentPlan === plan.id;
            return (
              <div
                key={plan.id}
                className="card"
                style={{
                  padding: 28,
                  display: "flex",
                  flexDirection: "column",
                  border: plan.highlight ? "2px solid var(--primary-accent)" : "1px solid var(--border-color)",
                  boxShadow: plan.highlight ? "var(--shadow-lg)" : "var(--shadow-xs)",
                  position: "relative",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
                  <h2 style={{ fontSize: 18, fontWeight: 700 }}>{plan.name}</h2>
                  <span className={`badge ${plan.highlight ? "badge-primary" : "badge-neutral"}`}>{plan.badge}</span>
                </div>
                <p style={{ fontSize: 13, color: "var(--text-secondary)", minHeight: 40, marginBottom: 20 }}>
                  {plan.desc}
                </p>

                <div style={{ marginBottom: 22 }}>
                  {price === null ? (
                    <div style={{ fontSize: 34, fontWeight: 800, letterSpacing: "-0.03em" }}>Custom</div>
                  ) : (
                    <div style={{ display: "flex", alignItems: "baseline", gap: 4 }}>
                      <span style={{ fontSize: 38, fontWeight: 800, letterSpacing: "-0.03em" }}>${price}</span>
                      <span style={{ fontSize: 13, color: "var(--text-muted)" }}>/ seat / month</span>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  className={plan.highlight ? "btn-primary" : "btn-secondary"}
                  style={{ width: "100%", marginBottom: 24, padding: "10px 16px" }}
                  disabled={isCurrent || updatingPlan === plan.id}
                  onClick={() => handleSelectPlan(plan.id)}
                >
                  {isCurrent ? "Current Plan" : updatingPlan === plan.id ? "Updating..." : plan.cta}
                </button>

                <div style={{ display: "flex", flexDirection: "column", gap: 10, flex: 1 }}>
                  {plan.features.map((f) => (
                    <div key={f} style={{ display: "flex", alignItems: "flex-start", gap: 9, fontSize: 13 }}>
                      <Check size={15} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                      <span style={{ color: "var(--text-secondary)" }}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        <div className="card" style={{ marginTop: 36, padding: 24, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: "var(--primary-light)", color: "var(--primary-accent)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Shield size={20} />
            </div>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700 }}>Need a security questionnaire or on-premise deployment?</div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)" }}>
                SYNAPSE supports self-hosted PostgreSQL 16 + Docker with zero external telemetry.
              </div>
            </div>
          </div>
          <Link to="/app" className="btn-secondary">
            <Building2 size={14} /> Explore Live Workspace
          </Link>
        </div>
      </main>
    </div>
  );
};
