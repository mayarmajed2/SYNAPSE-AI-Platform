import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, Rocket, ShieldCheck, ArrowLeft, AlertCircle } from "lucide-react";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";

const STACK_BY_TYPE: Record<string, { frontend: string; backend: string; database: string }> = {
  "Full-Stack Web App": { frontend: "React 19 + TypeScript + Vite", backend: "FastAPI + Pydantic v2", database: "PostgreSQL 16" },
  "REST / GraphQL API Service": { frontend: "OpenAPI / Swagger UI", backend: "FastAPI + SQLAlchemy 2.0", database: "PostgreSQL 16" },
  "AI / Agentic Microservice": { frontend: "React 19 Control Panel", backend: "FastAPI + Async LLM Orchestrator", database: "PostgreSQL + pgvector" },
  "Internal Ops Dashboard": { frontend: "React 19 + TypeScript", backend: "FastAPI + RBAC Middleware", database: "PostgreSQL 16" },
};

const SAMPLE_IDEAS = [
  {
    name: "PulseMetrics SaaS",
    type: "Full-Stack Web App",
    idea: "Build a B2B SaaS customer health & churn analytics dashboard with multi-tenant workspaces, REST APIs for ingesting usage events, automated alert thresholds, and a React executive overview.",
  },
  {
    name: "VaultGate API",
    type: "REST / GraphQL API Service",
    idea: "Build a secure API key management and usage metering service with scoped tokens, sliding-window rate limiting, audit trail logging, and OpenAPI documentation.",
  },
  {
    name: "SupportPilot AI",
    type: "AI / Agentic Microservice",
    idea: "Build an AI customer support triage service that classifies incoming tickets, drafts grounded responses, escalates high-severity incidents to humans, and logs SLA metrics.",
  },
];

export const NewProject: React.FC = () => {
  const navigate = useNavigate();
  const { success } = useToast();

  const [name, setName] = useState("");
  const [projectType, setProjectType] = useState("Full-Stack Web App");
  const [complexity, setComplexity] = useState("Medium");
  const [idea, setIdea] = useState("");
  const [requireApproval, setRequireApproval] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const selectedStack = STACK_BY_TYPE[projectType] || STACK_BY_TYPE["Full-Stack Web App"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || idea.trim().length < 15) {
      setErrorMsg("Please provide a project name and a brief description (at least 15 characters).");
      return;
    }

    setSubmitting(true);
    setErrorMsg("");

    try {
      const project = await api.createProject({
        name: name.trim(),
        idea: idea.trim(),
        description: idea.trim().slice(0, 200),
        project_type: projectType,
        complexity,
        tech_stack: selectedStack,
        require_approval_before_dev: requireApproval,
      });

      const wf = await api.getProjectWorkflow(project.id);
      if (wf?.id) {
        await api.startWorkflow(wf.id);
      }

      success("Autonomous build launched!", `All 10 agents are now executing "${project.name}".`);
      navigate(`/app/workflows?project=${project.id}`);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to create project. Ensure the backend server is running.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fade-in" style={{ maxWidth: 820, margin: "0 auto", display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Launch Autonomous Project</h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
            Describe your software product and dispatch all 10 specialized AI agents.
          </p>
        </div>
        <button type="button" className="btn-secondary btn-sm" onClick={() => navigate("/app/projects")}>
          <ArrowLeft size={14} /> Back to Projects
        </button>
      </div>

      {/* Quick-Fill Templates */}
      <div className="card" style={{ padding: 16 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <Sparkles size={13} color="var(--primary-accent)" /> QUICK-START TEMPLATES
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SAMPLE_IDEAS.map((sample) => (
            <button
              key={sample.name}
              type="button"
              className="btn-secondary btn-sm"
              onClick={() => {
                setName(sample.name);
                setProjectType(sample.type);
                setIdea(sample.idea);
              }}
            >
              {sample.name}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && (
        <div
          style={{
            background: "var(--error-light)",
            border: "1px solid #FECACA",
            color: "var(--error)",
            borderRadius: 10,
            padding: "12px 14px",
            fontSize: 13,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <AlertCircle size={16} />
          <span>{errorMsg}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Project Name</label>
          <input
            type="text"
            required
            className="input-field"
            placeholder="e.g., TaskFlow AI, BillingPulse, VaultGate"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div className="grid-2col">
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Project Type</label>
            <select className="input-field" value={projectType} onChange={(e) => setProjectType(e.target.value)}>
              {Object.keys(STACK_BY_TYPE).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Architecture Complexity</label>
            <select className="input-field" value={complexity} onChange={(e) => setComplexity(e.target.value)}>
              <option value="Low">Low (Rapid Prototype)</option>
              <option value="Medium">Medium (Production MVP)</option>
              <option value="High">High (Enterprise Multi-Service)</option>
            </select>
          </div>
        </div>

        {/* Dynamic Stack Preview */}
        <div style={{ padding: "12px 14px", borderRadius: 10, background: "var(--bg-main)", border: "1px solid var(--border-color)", fontSize: 12.5 }}>
          <div style={{ fontWeight: 600, marginBottom: 4, color: "var(--text-primary)" }}>Selected Target Stack</div>
          <div style={{ color: "var(--text-secondary)", fontFamily: "var(--font-mono)", fontSize: 12 }}>
            Frontend: {selectedStack.frontend} · Backend: {selectedStack.backend} · DB: {selectedStack.database}
          </div>
        </div>

        <div>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 6 }}>Product Specification & Goals</label>
          <textarea
            required
            rows={5}
            className="input-field"
            placeholder="Describe the target users, core workflows, APIs, and security or compliance requirements..."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            style={{ resize: "vertical" }}
          />
        </div>

        <label
          style={{
            display: "flex",
            alignItems: "flex-start",
            gap: 10,
            padding: "12px 14px",
            borderRadius: 10,
            background: "var(--primary-light)",
            border: "1px solid #BFDBFE",
            cursor: "pointer",
          }}
        >
          <input
            type="checkbox"
            checked={requireApproval}
            onChange={(e) => setRequireApproval(e.target.checked)}
            style={{ marginTop: 3 }}
          />
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", display: "flex", alignItems: "center", gap: 6 }}>
              <ShieldCheck size={15} color="var(--primary-accent)" />
              Require Human Approval Gate before Code Generation
            </div>
            <div style={{ fontSize: 12, color: "var(--text-secondary)", marginTop: 2 }}>
              Pauses the pipeline after Product Manager PRD & System Architect design so you can review and approve specifications.
            </div>
          </div>
        </label>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, paddingTop: 8 }}>
          <button type="button" className="btn-secondary" onClick={() => navigate("/app/projects")} disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn-primary" disabled={submitting}>
            <Rocket size={15} />
            {submitting ? "Dispatching 10 Agents..." : "Launch Autonomous Build"}
          </button>
        </div>
      </form>
    </div>
  );
};
