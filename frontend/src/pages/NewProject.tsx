import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Sparkles, ArrowRight } from "lucide-react";
import { api } from "../services/api";

export const NewProjectPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [idea, setIdea] = useState("");
  const [projectType, setProjectType] = useState("Full-Stack Web App");
  const [complexity, setComplexity] = useState("Medium");
  const [requireApproval, setRequireApproval] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !idea.trim()) {
      setError("Please provide a project name and describe your project vision.");
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        name,
        idea,
        project_type: projectType,
        complexity,
        tech_stack: {
          frontend: "React + TypeScript",
          backend: "FastAPI",
          database: "PostgreSQL 16",
        },
        require_approval_before_dev: requireApproval,
      };

      const project = await api.createProject(payload);
      
      // Auto-start workflow upon creation
      const workflow = await api.getProjectWorkflow(project.id).catch(() => null);
      if (workflow) {
        await api.startWorkflow(workflow.id).catch(() => null);
      }

      // Navigate directly to Workflow Studio to observe live agents
      navigate(`/workflow-studio?projectId=${project.id}`);
    } catch (err: any) {
      setError(err.message || "Failed to create project. Please verify backend connection.");
      setSubmitting(false);
    }
  };

  const sampleIdeas = [
    { title: "E-Commerce for Fashion", idea: "Build an e-commerce platform for an upscale fashion brand with product catalog, cart, and order checkout." },
    { title: "Team Knowledge Base", idea: "Build a collaborative Markdown documentation and team knowledge base with search and tag organization." },
    { title: "Subscription Billing API", idea: "Build an API service for managing customer billing tiers, invoices, and webhook event notifications." },
  ];

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", paddingBottom: "40px" }}>
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
          Launch Autonomous Project
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "4px" }}>
          Describe what you want to build. SYNAPSE activates the Supervisor, Architect, and specialized developer agents.
        </p>
      </div>

      {error && (
        <div
          style={{
            padding: "12px 16px",
            backgroundColor: "var(--error-light)",
            border: "1px solid #FCA5A5",
            borderRadius: "8px",
            color: "var(--error)",
            fontSize: "13px",
            marginBottom: "20px",
          }}
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="card" style={{ padding: "32px", display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Project Name */}
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
            Project Name
          </label>
          <input
            type="text"
            className="input-field"
            placeholder="e.g. Nexus E-Commerce Engine"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        {/* Natural Language Vision / Prompt */}
        <div>
          <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
            Product Vision & Requirements
          </label>
          <textarea
            className="input-field"
            rows={5}
            placeholder="Describe the application, target audience, core features, and business requirements in natural language..."
            value={idea}
            onChange={(e) => setIdea(e.target.value)}
            required
          />

          {/* Quick Ideas Picker */}
          <div style={{ marginTop: "10px", display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontWeight: 500 }}>Example prompts:</span>
            {sampleIdeas.map((s, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setName(s.title);
                  setIdea(s.idea);
                }}
                style={{
                  fontSize: "11px",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  backgroundColor: "#F3F4F6",
                  border: "1px solid var(--border-color)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                }}
              >
                {s.title}
              </button>
            ))}
          </div>
        </div>

        {/* Project Type & Complexity Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
              Project Archetype
            </label>
            <select
              className="input-field"
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
            >
              <option value="Full-Stack Web App">Full-Stack Web App (React + FastAPI)</option>
              <option value="REST API & Microservice">REST API & Microservice (FastAPI + SQL)</option>
              <option value="Enterprise SaaS Platform">Enterprise SaaS Platform</option>
              <option value="Internal Developer Tool">Internal Developer Tool</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
              System Complexity
            </label>
            <select
              className="input-field"
              value={complexity}
              onChange={(e) => setComplexity(e.target.value)}
            >
              <option value="Low">Low (Simple MVP / Prototype)</option>
              <option value="Medium">Medium (Production Baseline)</option>
              <option value="High">High (Multi-Entity Relational)</option>
              <option value="Enterprise">Enterprise (Full Governance)</option>
            </select>
          </div>
        </div>

        {/* Human-in-the-loop Governance Gate */}
        <div
          style={{
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            backgroundColor: "#FAFAFA",
            display: "flex",
            alignItems: "flex-start",
            gap: "12px",
          }}
        >
          <input
            type="checkbox"
            id="requireApproval"
            checked={requireApproval}
            onChange={(e) => setRequireApproval(e.target.checked)}
            style={{ marginTop: "3px", width: "16px", height: "16px", cursor: "pointer" }}
          />
          <div>
            <label htmlFor="requireApproval" style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", cursor: "pointer" }}>
              Require Human Approval Gate
            </label>
            <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
              The Supervisor will pause execution after the Product Manager and Architect finish, requesting your explicit sign-off on the PRD before developers write code.
            </p>
          </div>
        </div>

        {/* Submit Action */}
        <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "12px" }}>
          <button
            type="button"
            onClick={() => navigate("/projects")}
            className="btn-secondary"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="btn-primary"
            style={{ padding: "10px 24px", fontSize: "14px" }}
          >
            {submitting ? (
              <span>Deploying Multi-Agent Workforce...</span>
            ) : (
              <>
                <Sparkles size={16} />
                <span>Initialize Autonomous Project</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};
