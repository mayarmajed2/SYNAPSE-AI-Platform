import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Play,
  ArrowRight,
  FolderKanban,
  Users,
  Clock,
  DollarSign,
  CheckCircle2,
  Circle,
  Sparkles,
  FileCode2,
  ShieldCheck,
  FlaskConical,
  Layers,
  BookOpen,
  Rocket,
  Cpu,
  X,
} from "lucide-react";
import { api } from "../services/api";
import { ErrorBanner, EmptyState, LoadingSkeleton } from "../components/ui/PageState";

const STAGES = [
  { name: "Idea Vision", agent: "Supervisor", icon: Sparkles, color: "#4F46E5" },
  { name: "PRD & Stories", agent: "Product Mgr", icon: BookOpen, color: "#2563EB" },
  { name: "Architecture", agent: "Architect", icon: Layers, color: "#7C3AED" },
  { name: "Backend API", agent: "Backend Dev", icon: Cpu, color: "#0284C7" },
  { name: "Frontend UI", agent: "Frontend Dev", icon: FileCode2, color: "#DB2777" },
  { name: "Code Review", agent: "Reviewer", icon: CheckCircle2, color: "#D97706" },
  { name: "QA Suite", agent: "QA Engineer", icon: FlaskConical, color: "#059669" },
  { name: "Security SAST", agent: "Security", icon: ShieldCheck, color: "#DC2626" },
  { name: "Delivery Docs", agent: "Docs Agent", icon: BookOpen, color: "#0D9488" },
  { name: "Deployment", agent: "DevOps Agent", icon: Rocket, color: "#EA580C" },
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

  if (loading) {
    return <LoadingSkeleton rows={2} />;
  }

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
      label: "Connect Groq LLM API key (or run in offline template mode)",
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
      label: "Monitor all 10 agents in Workflow Studio & download codebase",
      actionLabel: "Open Studio",
      to: "/app/workflows",
    },
  ];

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {errorMsg && <ErrorBanner message={errorMsg} onRetry={loadData} />}

      {/* Executive Command Center Hero Banner */}
      <div
        className="card hero-command-card"
        style={{
          padding: "26px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 16,
        }}
      >
        <div>
          <div style={{ display: "inline-flex", alignItems: "center", gap: 8, fontSize: 11.5, fontWeight: 700, color: "#34D399", letterSpacing: "0.06em", marginBottom: 8 }}>
            <span className="pulse-indicator" />
            MULTI-AGENT COMMAND CENTER · OPERATIONAL
          </div>
          <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.03em", color: "#F8FAFC" }}>
            SYNAPSE Autonomous Engineering HQ
          </h1>
          <p style={{ fontSize: 13.5, color: "#CBD5E1", marginTop: 6, maxWidth: 620 }}>
            Orchestrate {agents.length || 10} specialized AI agents collaborating across architecture, code generation,
            automated QA, SAST security, and release delivery.
          </p>
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <Link to="/app/projects/new" className="btn-primary">
            <PlusCircle size={15} /> New Software Project
          </Link>
          <Link to="/app/workflows" className="btn-secondary">
            <Play size={14} /> Open Workflow Studio
          </Link>
        </div>
      </div>

      {/* First-Time Onboarding Checklist */}
      {showOnboarding && (
        <div className="card" style={{ padding: "18px 22px", borderLeft: "3px solid var(--primary-accent)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700 }}>Quick-Start Onboarding</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>
                Complete these steps to ship your first governed autonomous build.
              </div>
            </div>
            <button type="button" className="btn-ghost btn-sm" onClick={dismissOnboarding} aria-label="Dismiss onboarding">
              <X size={15} />
            </button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {onboardingSteps.map((step) => (
              <div
                key={step.label}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: 12,
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "var(--bg-main)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
                  {step.done ? (
                    <CheckCircle2 size={16} color="var(--success)" />
                  ) : (
                    <Circle size={16} color="var(--text-muted)" />
                  )}
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

      {/* KPI Strip */}
      <div className="grid-kpi">
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em" }}>TOTAL PROJECTS</span>
            <FolderKanban size={17} color="var(--primary-accent)" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>{totalProjects}</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
            <strong style={{ color: "var(--primary-accent)" }}>{activeProjects} active</strong> in pipeline
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em" }}>AGENT TASKS</span>
            <Users size={17} color="var(--indigo-accent)" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>{totalTasks}</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
            Completed with <strong style={{ color: "var(--success)" }}>{successRate}% success</strong>
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em" }}>AVG STAGE LATENCY</span>
            <Clock size={17} color="#0284C7" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>{avgExec.toFixed(2)}s</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
            Measured per autonomous stage
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
            <span style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.04em" }}>AI TOKENS & COST</span>
            <DollarSign size={17} color="var(--success)" />
          </div>
          <div style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.02em" }}>${Number(totalCost).toFixed(4)}</div>
          <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 4 }}>
            {Number(totalTokens).toLocaleString()} total tokens consumed
          </div>
        </div>
      </div>

      {/* 10-Stage Autonomous Lifecycle */}
      <div className="card">
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: 15.5, fontWeight: 700 }}>The Autonomous 10-Stage Software Lifecycle</h2>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
              Every submitted idea flows through these 10 specialized engineering agents with full traceability.
            </p>
          </div>
          <Link to="/app/agents" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--primary-accent)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 4 }}>
            Inspect Agent Workforce <ArrowRight size={13} />
          </Link>
        </div>

        <div className="grid-pipeline">
          {STAGES.map((stage, idx) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.name}
                style={{
                  padding: "12px",
                  borderRadius: 10,
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-main)",
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                }}
              >
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: `${stage.color}14`,
                    color: stage.color,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <Icon size={16} />
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 600, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {idx + 1}. {stage.name}
                  </div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{stage.agent}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Bottom Split: Recent Projects + Workforce Fleet */}
      <div className="grid-main-aside">
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div>
              <h2 style={{ fontSize: 15.5, fontWeight: 700 }}>Recent Projects</h2>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>Autonomous software pipelines in flight</p>
            </div>
            <Link to="/app/projects" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--primary-accent)", textDecoration: "none" }}>
              View all →
            </Link>
          </div>

          {projects.length === 0 ? (
            <EmptyState
              icon={<FolderKanban size={22} />}
              title="No software projects yet"
              description="Submit a product idea to trigger the 10-agent engineering pipeline and generate your first codebase."
              action={
                <Link to="/app/projects/new" className="btn-primary">
                  <PlusCircle size={14} /> Create First Project
                </Link>
              }
            />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {projects.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  style={{
                    padding: "14px 16px",
                    borderRadius: 10,
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 12,
                  }}
                >
                  <div style={{ flex: 1, minWidth: 200 }}>
                    <Link
                      to={`/app/projects/${p.id}`}
                      style={{ fontSize: 14, fontWeight: 700, textDecoration: "none", color: "var(--text-primary)" }}
                    >
                      {p.name}
                    </Link>
                    <p style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: 460 }}>
                      {p.description || p.idea}
                    </p>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 90 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textAlign: "right", marginBottom: 4 }}>
                        {p.execution_progress}%
                      </div>
                      <div style={{ height: 5, borderRadius: 99, background: "var(--bg-subtle)", overflow: "hidden" }}>
                        <div style={{ height: "100%", width: `${p.execution_progress}%`, background: "var(--success)" }} />
                      </div>
                    </div>
                    <span className={`badge ${p.status === "completed" ? "badge-success" : p.status === "failed" ? "badge-error" : "badge-primary"}`}>
                      {p.status}
                    </span>
                    <Link to={`/app/workflows?project=${p.id}`} className="btn-secondary btn-sm">
                      Studio →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div>
              <h2 style={{ fontSize: 15.5, fontWeight: 700 }}>Workforce Fleet</h2>
              <p style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                {agents.length || 10} Coordinated AI Specialists
              </p>
            </div>
            <Link to="/app/agents" style={{ fontSize: 12.5, fontWeight: 600, color: "var(--primary-accent)", textDecoration: "none" }}>
              Manage →
            </Link>
          </div>

          {agents.length === 0 ? (
            <div style={{ fontSize: 13, color: "var(--text-muted)", textAlign: "center", padding: 24 }}>
              No agents registered yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {agents.slice(0, 6).map((a) => (
                <div
                  key={a.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 11px",
                    borderRadius: 9,
                    background: "var(--bg-main)",
                    border: "1px solid var(--border-color)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 8,
                        background: "var(--primary-light)",
                        color: "var(--primary-accent)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        fontWeight: 700,
                        fontSize: 12,
                      }}
                    >
                      {a.name?.[0] || "A"}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{a.name}</div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>{a.display_name}</div>
                    </div>
                  </div>
                  <span className={`badge ${a.status === "working" ? "badge-primary" : "badge-neutral"}`}>
                    {a.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
