import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowUpRight, Plus, X, Check } from "lucide-react";
import { api } from "../services/api";
import { AgentGlyph } from "../components/ui/AgentGlyph";
import { ErrorBanner, EmptyState, LoadingSkeleton } from "../components/ui/PageState";

const PIPELINE_SEQUENCE = [
  { num: "01", name: "Idea Vision", role: "supervisor", label: "Supervisor" },
  { num: "02", name: "PRD & Stories", role: "product_manager", label: "Product Mgr" },
  { num: "03", name: "Architecture", role: "system_architect", label: "Architect" },
  { num: "04", name: "Backend API", role: "backend_developer", label: "Backend Dev" },
  { num: "05", name: "Frontend UI", role: "frontend_developer", label: "Frontend Dev" },
  { num: "06", name: "Code Review", role: "code_reviewer", label: "Reviewer" },
  { num: "07", name: "QA Suite", role: "qa_engineer", label: "QA Engineer" },
  { num: "08", name: "Security SAST", role: "security_agent", label: "Security" },
  { num: "09", name: "Delivery Docs", role: "documentation_agent", label: "Docs Agent" },
  { num: "10", name: "Deployment", role: "deployment_agent", label: "DevOps Agent" },
];

export const Overview: React.FC = () => {
  const [overview, setOverview] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [showOnboarding, setShowOnboarding] = useState(() => {
    try {
      return localStorage.getItem("synapse_hide_onboarding") !== "true";
    } catch {
      return true;
    }
  });

  const loadData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [ov, projs, ags, st] = await Promise.all([
        api.getAnalyticsOverview(),
        api.getProjects(),
        api.getAgents(),
        api.getSettings().catch(() => null),
      ]);
      setOverview(ov);
      setProjects(Array.isArray(projs) ? projs : []);
      setAgents(Array.isArray(ags) ? ags : []);
      setSettings(st);
    } catch (err: any) {
      setErrorMsg(err?.message || "Unable to connect to SYNAPSE backend API.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const dismissOnboarding = () => {
    setShowOnboarding(false);
    try {
      localStorage.setItem("synapse_hide_onboarding", "true");
    } catch {}
  };

  if (loading) return <LoadingSkeleton rows={2} />;

  const totalProjects = overview?.total_projects ?? projects.length;
  const activeProjects = overview?.active_projects ?? projects.filter((p) => p.status === "in_progress").length;
  const totalTasks = overview?.total_agent_executions ?? 0;
  const successRate = overview?.success_rate_percent ?? 100;
  const avgExec = overview?.average_execution_time_seconds ?? 0;
  const totalCost = overview?.total_cost_usd ?? 0;
  const totalTokens = overview?.total_tokens_consumed ?? 0;

  const onboardingSteps = [
    {
      done: Boolean(settings?.groq_configured),
      label: "Connect Groq LLM API key (or run in offline mode)",
      actionLabel: "Configure",
      to: "/app/settings",
    },
    {
      done: projects.length > 0,
      label: "Launch your first autonomous software project",
      actionLabel: "New Project",
      to: "/app/projects/new",
    },
    {
      done: projects.some((p) => p.status === "completed"),
      label: "Inspect live flow in Workflow Studio & export ZIP",
      actionLabel: "Open Studio",
      to: "/app/workflows",
    },
  ];

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 26 }}>
      {errorMsg && <ErrorBanner message={errorMsg} onRetry={loadData} />}

      {/* Sleek Modern Hero Header */}
      <section
        style={{
          display: "flex",
          alignItems: "flex-end",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 18,
        }}
      >
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
            <span className="pulse-indicator" />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--primary-accent)" }}>
              {agents.length || 10} autonomous agents online
            </span>
          </div>
          <h1 style={{ fontSize: "clamp(28px, 3.6vw, 38px)", fontWeight: 800, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            Command Center
          </h1>
          <p style={{ fontSize: 14.5, color: "var(--text-secondary)", marginTop: 6, maxWidth: 580 }}>
            Orchestrate architecture, full-stack code generation, sandbox QA, and security audits in real time.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/app/projects/new" className="btn-accent">
            <Plus size={15} /> New Project
          </Link>
          <Link to="/app/workflows" className="btn-secondary">
            Workflow Studio <ArrowUpRight size={14} />
          </Link>
        </div>
      </section>

      {/* Clean Modern Metrics Strip */}
      <section className="ledger-kpi">
        <div className="ledger-kpi-cell">
          <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-secondary)" }}>Total Projects</div>
          <div className="tabular-nums" style={{ fontSize: 34, fontWeight: 800, marginTop: 8, lineHeight: 1 }}>
            {totalProjects}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 8 }}>
            <strong style={{ color: "var(--primary-accent)" }}>{activeProjects} active</strong> in pipeline
          </div>
        </div>

        <div className="ledger-kpi-cell">
          <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-secondary)" }}>Agent Executions</div>
          <div className="tabular-nums" style={{ fontSize: 34, fontWeight: 800, marginTop: 8, lineHeight: 1 }}>
            {totalTasks}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 8 }}>
            <strong style={{ color: "var(--primary-accent)" }}>{successRate}%</strong> success rate
          </div>
        </div>

        <div className="ledger-kpi-cell">
          <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-secondary)" }}>Avg Stage Latency</div>
          <div className="tabular-nums" style={{ fontSize: 34, fontWeight: 800, marginTop: 8, lineHeight: 1 }}>
            {avgExec.toFixed(2)}<span style={{ fontSize: 18, color: "var(--text-muted)", fontWeight: 600 }}>s</span>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 8 }}>
            Per completed agent stage
          </div>
        </div>

        <div className="ledger-kpi-cell">
          <div style={{ fontSize: 12.5, fontWeight: 500, color: "var(--text-secondary)" }}>Inference Spend</div>
          <div className="tabular-nums" style={{ fontSize: 34, fontWeight: 800, marginTop: 8, lineHeight: 1 }}>
            ${Number(totalCost).toFixed(4)}
          </div>
          <div style={{ fontSize: 12.5, color: "var(--text-muted)", marginTop: 8 }}>
            {Number(totalTokens).toLocaleString()} tokens used
          </div>
        </div>
      </section>

      {/* Main Asymmetric Split */}
      <section className="grid-main-aside">
        <div style={{ display: "flex", flexDirection: "column", gap: 22 }}>
          {/* Active Projects */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "18px 22px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>Active Pipelines</h2>
                <p style={{ fontSize: 12.5, color: "var(--text-muted)" }}>Autonomous software projects in flight</p>
              </div>
              <Link to="/app/projects" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--primary-accent)", textDecoration: "none" }}>
                View all →
              </Link>
            </div>

            {projects.length === 0 ? (
              <div style={{ padding: 20 }}>
                <EmptyState
                  icon={<Plus size={20} />}
                  title="No projects yet"
                  description="Start a new build to dispatch all 10 specialist agents."
                  action={<Link to="/app/projects/new" className="btn-accent">New Project</Link>}
                />
              </div>
            ) : (
              <div>
                {projects.slice(0, 5).map((p, idx) => (
                  <div
                    key={p.id}
                    style={{
                      padding: "16px 22px",
                      borderBottom: idx < Math.min(projects.length, 5) - 1 ? "1px solid var(--border-color)" : "none",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: 14,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 200 }}>
                      <Link to={`/app/projects/${p.id}`} style={{ fontSize: 15, fontWeight: 700, textDecoration: "none", color: "#FFFFFF" }}>
                        {p.name}
                      </Link>
                      <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 3, maxWidth: 460, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {p.description || p.idea}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 92 }}>
                        <div className="tabular-nums" style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-secondary)", textAlign: "right", marginBottom: 4 }}>
                          {p.execution_progress}%
                        </div>
                        <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.08)", overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${p.execution_progress}%`, background: "var(--primary-accent)", borderRadius: 99 }} />
                        </div>
                      </div>
                      <span className={`badge ${p.status === "completed" ? "badge-success" : p.status === "failed" ? "badge-error" : "badge-primary"}`}>
                        {p.status}
                      </span>
                      <Link to={`/app/workflows?project=${p.id}`} className="btn-secondary btn-sm">
                        Studio <ArrowUpRight size={13} />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* 10-Stage Autonomous Lifecycle */}
          <div className="card">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700 }}>10-Stage Autonomous Lifecycle</h2>
                <p style={{ fontSize: 12.5, color: "var(--text-muted)" }}>End-to-end orchestration across your AI engineering team</p>
              </div>
              <Link to="/app/agents" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--primary-accent)", textDecoration: "none" }}>
                Inspect agents →
              </Link>
            </div>

            <div className="grid-pipeline">
              {PIPELINE_SEQUENCE.map((stage) => {
                const liveAgent = agents.find((a) => a.role === stage.role);
                const isWorking = liveAgent?.status === "working";
                return (
                  <div
                    key={stage.num}
                    className="stage-tile"
                    style={{
                      padding: 14,
                      borderRadius: 12,
                      border: isWorking ? "1px solid var(--primary-accent)" : "1px solid var(--border-color)",
                      background: isWorking ? "var(--primary-light)" : "#161922",
                      cursor: "default",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                      <span style={{ fontSize: 11, fontWeight: 700, color: isWorking ? "var(--primary-accent)" : "var(--text-muted)" }}>
                        {stage.num}
                      </span>
                      <AgentGlyph role={stage.role} size={20} active={isWorking} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#FFFFFF" }}>{stage.name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{stage.label}</div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Onboarding + Live Agent Roster */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          {showOnboarding && (
            <div className="ink-panel">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#FFFFFF" }}>Quick-Start Checklist</span>
                <button type="button" onClick={dismissOnboarding} aria-label="Dismiss" style={{ background: "none", border: "none", color: "var(--text-muted)", cursor: "pointer" }}>
                  <X size={15} />
                </button>
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {onboardingSteps.map((step) => (
                  <div
                    key={step.label}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      gap: 10,
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: "rgba(255,255,255,0.03)",
                      border: "1px solid var(--border-color)",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 9, fontSize: 12.5 }}>
                      <span
                        style={{
                          width: 18,
                          height: 18,
                          borderRadius: "50%",
                          background: step.done ? "var(--primary-light)" : "rgba(255,255,255,0.06)",
                          color: step.done ? "var(--primary-accent)" : "var(--text-muted)",
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        {step.done ? <Check size={11} /> : "•"}
                      </span>
                      <span style={{ color: step.done ? "var(--text-muted)" : "var(--text-primary)", textDecoration: step.done ? "line-through" : "none" }}>
                        {step.label}
                      </span>
                    </div>
                    <Link to={step.to} className="btn-secondary btn-sm">
                      {step.actionLabel}
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontSize: 15.5, fontWeight: 700 }}>Workforce Fleet</h2>
              <Link to="/app/agents" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--primary-accent)", textDecoration: "none" }}>
                Manage →
              </Link>
            </div>
            <div>
              {agents.slice(0, 6).map((a, idx) => {
                const isWorking = a.status === "working";
                return (
                  <div
                    key={a.id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "12px 20px",
                      borderBottom: idx < 5 ? "1px solid var(--border-color)" : "none",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 34,
                          height: 34,
                          borderRadius: 10,
                          background: isWorking ? "var(--primary-light)" : "#161922",
                          border: "1px solid var(--border-color)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <AgentGlyph role={a.role} size={18} active={isWorking} />
                      </div>
                      <div>
                        <div style={{ fontSize: 13.5, fontWeight: 600 }}>{a.name}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)", textTransform: "capitalize" }}>
                          {(a.display_name || a.role || "").replace(/_/g, " ")}
                        </div>
                      </div>
                    </div>
                    <span className={`badge ${isWorking ? "badge-primary" : "badge-neutral"}`}>{a.status}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
