import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderGit2,
  Users2,
  Clock,
  Coins,
  ArrowRight,
  PlusCircle,
  Play,
  FileText,
  Boxes,
  Database,
  Code2,
  CheckCircle,
  Shield,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { api } from "../services/api";

export const OverviewPage: React.FC = () => {
  const [analytics, setAnalytics] = useState<any>({
    total_projects: 0,
    active_projects: 0,
    completed_projects: 0,
    total_agent_executions: 0,
    success_rate: 100,
    average_execution_time_seconds: 1.8,
    total_tokens_consumed: 0,
    estimated_ai_cost_usd: 0,
  });
  const [projects, setProjects] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.getAnalyticsOverview().catch(() => null),
      api.getProjects().catch(() => []),
      api.getAgents().catch(() => []),
    ]).then(([analyticsData, projectsData, agentsData]) => {
      if (analyticsData) setAnalytics(analyticsData);
      if (projectsData) setProjects(projectsData);
      if (agentsData) setAgents(agentsData);
      setLoading(false);
    });
  }, []);

  const pipelineStages = [
    { num: 1, name: "Idea Vision", agent: "Supervisor", icon: Sparkles, color: "#315EFB" },
    { num: 2, name: "PRD & Stories", agent: "Product Manager", icon: FileText, color: "#3B82F6" },
    { num: 3, name: "Architecture", agent: "System Architect", icon: Boxes, color: "#6366F1" },
    { num: 4, name: "Backend API", agent: "Backend Dev", icon: Database, color: "#8B5CF6" },
    { num: 5, name: "Frontend UI", agent: "Frontend Dev", icon: Code2, color: "#EC4899" },
    { num: 6, name: "Code Review", agent: "Code Reviewer", icon: CheckCircle, color: "#F59E0B" },
    { num: 7, name: "QA Suite", agent: "QA Engineer", icon: CheckCircle, color: "#10B981" },
    { num: 8, name: "Security SAST", agent: "Security Agent", icon: Shield, color: "#EF4444" },
    { num: 9, name: "Delivery Docs", agent: "Docs Specialist", icon: BookOpen, color: "#14B8A6" },
  ];

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Welcome Banner */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
          border: "1px solid var(--border-color)",
          borderRadius: "12px",
          padding: "24px 28px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <span className="pulse-indicator" />
            <span style={{ fontSize: "12px", fontWeight: 600, color: "var(--success)", textTransform: "uppercase" }}>
              Virtual Software Company Operational
            </span>
          </div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>
            Autonomous Engineering HQ
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Supervise 9 specialized AI agents building, reviewing, and delivering software autonomously.
          </p>
        </div>
        <div style={{ display: "flex", gap: "12px" }}>
          <Link to="/projects/new" className="btn-primary">
            <PlusCircle size={16} />
            <span>New Software Project</span>
          </Link>
          <Link to="/workflow-studio" className="btn-secondary">
            <Play size={15} />
            <span>Open Workflow Studio</span>
          </Link>
        </div>
      </div>

      {/* Visual 9-Stage Pipeline Explainer Banner (Makes the entire platform intuitive to anyone) */}
      <div
        className="card"
        style={{
          padding: "20px 24px",
          background: "linear-gradient(180deg, #FFFFFF 0%, #FAFBFC 100%)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
          <div>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>
              The Autonomous 9-Stage Software Lifecycle
            </h2>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              Every submitted idea is autonomously routed through these specialized agents in sequence
            </p>
          </div>
          <Link to="/workforce" style={{ fontSize: "12px", color: "var(--primary-accent)", textDecoration: "none", fontWeight: 600 }}>
            Inspect Agent Workforce →
          </Link>
        </div>

        {/* Horizontal Pipeline Steps */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(9, 1fr)", gap: "8px", overflowX: "auto", paddingBottom: "4px" }}>
          {pipelineStages.map((stage) => {
            const Icon = stage.icon;
            return (
              <div
                key={stage.num}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  textAlign: "center",
                  padding: "10px 6px",
                  borderRadius: "8px",
                  backgroundColor: "#FFFFFF",
                  border: "1px solid var(--border-color)",
                  position: "relative",
                }}
              >
                <div
                  style={{
                    width: "28px",
                    height: "28px",
                    borderRadius: "6px",
                    backgroundColor: `${stage.color}15`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: stage.color,
                    marginBottom: "6px",
                  }}
                >
                  <Icon size={14} />
                </div>
                <div style={{ fontSize: "11px", fontWeight: 700, color: "var(--text-primary)", whiteSpace: "nowrap" }}>
                  {stage.name}
                </div>
                <div style={{ fontSize: "10px", color: "var(--text-secondary)", marginTop: "2px", whiteSpace: "nowrap" }}>
                  {stage.agent}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "16px",
        }}
      >
        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>Total Projects</span>
            <FolderGit2 size={18} color="var(--primary-accent)" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "12px", color: "var(--text-primary)" }}>
            {analytics.total_projects}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            <span style={{ color: "var(--primary-accent)", fontWeight: 600 }}>{analytics.active_projects} active</span>{" "}
            in pipeline
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>Agent Tasks</span>
            <Users2 size={18} color="var(--primary-accent)" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "12px", color: "var(--text-primary)" }}>
            {analytics.total_agent_executions}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Completed with{" "}
            <span style={{ color: "var(--success)", fontWeight: 600 }}>{analytics.success_rate}% success</span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>Avg Execution Time</span>
            <Clock size={18} color="var(--primary-accent)" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "12px", color: "var(--text-primary)" }}>
            {analytics.average_execution_time_seconds}s
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Per agent stage completion
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)" }}>
            <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>AI Tokens & Cost</span>
            <Coins size={18} color="var(--primary-accent)" />
          </div>
          <div style={{ fontSize: "28px", fontWeight: 700, marginTop: "12px", color: "var(--text-primary)" }}>
            ${analytics.estimated_ai_cost_usd}
          </div>
          <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
            {analytics.total_tokens_consumed.toLocaleString()} total tokens
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
        {/* Recent Projects Table */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Recent Projects</h2>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Autonomous software pipelines in flight</p>
            </div>
            <Link to="/projects" style={{ fontSize: "13px", color: "var(--primary-accent)", textDecoration: "none", fontWeight: 600 }}>
              View all →
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>Loading projects...</div>
          ) : projects.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "48px 20px",
                border: "1px dashed var(--border-color)",
                borderRadius: "8px",
              }}
            >
              <FolderGit2 size={36} color="var(--text-secondary)" style={{ margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>No software projects yet</h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", maxWidth: "380px", margin: "4px auto 16px" }}>
                Submit an idea and watch SYNAPSE's AI workforce architect, develop, test, and document it.
              </p>
              <Link to="/projects/new" className="btn-primary">
                <PlusCircle size={15} />
                <span>Create First Project</span>
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {projects.slice(0, 5).map((p) => (
                <div
                  key={p.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "14px 16px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "#FAFAFA",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                    <Link
                      to={`/projects/${p.id}`}
                      style={{ fontWeight: 600, fontSize: "14px", color: "var(--text-primary)", textDecoration: "none" }}
                    >
                      {p.name}
                    </Link>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", maxWidth: "450px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {p.idea}
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                    <div style={{ width: "100px", textAlign: "right" }}>
                      <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>
                        {p.execution_progress}% Done
                      </div>
                      <div
                        style={{
                          height: "4px",
                          width: "100%",
                          backgroundColor: "#E5E7EB",
                          borderRadius: "2px",
                          marginTop: "4px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            height: "100%",
                            width: `${p.execution_progress}%`,
                            backgroundColor: p.execution_progress === 100 ? "var(--success)" : "var(--primary-accent)",
                          }}
                        />
                      </div>
                    </div>
                    <span className={`badge badge-${p.status === "completed" ? "success" : "primary"}`}>{p.status}</span>
                    <Link
                      to={`/workflow-studio?projectId=${p.id}`}
                      className="btn-secondary"
                      style={{ padding: "6px 10px", fontSize: "12px" }}
                    >
                      <span>Studio</span>
                      <ArrowRight size={13} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Specialized Workforce Status */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <div>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Workforce Fleet</h2>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>9 Coordinated AI Specialists</p>
            </div>
            <Link to="/workforce" style={{ fontSize: "13px", color: "var(--primary-accent)", textDecoration: "none", fontWeight: 600 }}>
              Manage →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {agents.slice(0, 7).map((agent) => (
              <div
                key={agent.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "10px 12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div
                    style={{
                      width: "30px",
                      height: "30px",
                      borderRadius: "6px",
                      backgroundColor: "var(--primary-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--primary-accent)",
                      fontWeight: 700,
                      fontSize: "12px",
                    }}
                  >
                    {agent.name.charAt(0)}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>{agent.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "capitalize" }}>
                      {agent.role.replace("_", " ")}
                    </div>
                  </div>
                </div>
                <span className="badge badge-neutral">{agent.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
