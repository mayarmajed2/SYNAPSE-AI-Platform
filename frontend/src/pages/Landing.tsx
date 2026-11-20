import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Cpu,
  ArrowRight,
  ShieldCheck,
  GitBranch,
  Terminal,
  CheckCircle2,
  Sparkles,
  Layers,
  Lock,
  Play,
  FileCode2,
  FlaskConical,
  Users,
  Zap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

const PIPELINE_STAGES = [
  { num: "01", name: "Supervisor", role: "Task Graph & Planning", detail: "Decomposes product ideas into an executable dependency graph." },
  { num: "02", name: "Product Manager", role: "PRD & User Stories", detail: "Authors structured requirements, acceptance criteria, and MVP scope." },
  { num: "03", name: "System Architect", role: "API & DB Schema", detail: "Designs relational models, REST contracts, and architecture ADRs." },
  { num: "04", name: "Backend Dev", role: "FastAPI & Models", detail: "Generates typed endpoints, Pydantic schemas, and persistence layers." },
  { num: "05", name: "Frontend Dev", role: "React & TypeScript", detail: "Crafts modular UI components, state hooks, and API integrations." },
  { num: "06", name: "Code Reviewer", role: "Static Peer Review", detail: "Audits architecture boundaries, maintainability, and type safety." },
  { num: "07", name: "QA Engineer", role: "Sandbox Pytest", detail: "Synthesizes test suites and executes automated syntax & assertion checks." },
  { num: "08", name: "Security Agent", role: "SAST & OWASP", detail: "Scans artifacts for CWE vulnerabilities, secrets, and injection risks." },
  { num: "09", name: "Docs Specialist", role: "README & Runbooks", detail: "Produces developer onboarding guides, API specs, and delivery dossiers." },
  { num: "10", name: "Deployment", role: "Docker & Release", detail: "Packages production Dockerfiles, compose manifests, and release tags." },
];

export const Landing: React.FC = () => {
  const { isAuthenticated, demoLogin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();
  const [activeStage, setActiveStage] = useState(0);
  const [demoLoading, setDemoLoading] = useState(false);

  const handleDemoLaunch = async () => {
    setDemoLoading(true);
    try {
      await demoLogin();
      success("Signed in to SYNAPSE HQ", "Exploring the live multi-agent workspace.");
      navigate("/app");
    } catch (err: any) {
      error("Demo login unavailable", err?.message || "Ensure the backend server is running.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg-main)", color: "var(--text-primary)" }}>
      {/* Top Marketing Navigation */}
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(6, 11, 24, 0.84)",
          backdropFilter: "blur(16px)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            padding: "0 24px",
            height: 66,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
          }}
        >
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: 9,
                background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#FFFFFF",
                boxShadow: "0 2px 8px rgba(37, 99, 235, 0.3)",
              }}
            >
              <Cpu size={18} />
            </div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, letterSpacing: "-0.02em", lineHeight: 1.1 }}>SYNAPSE</div>
              <div style={{ fontSize: 10, fontWeight: 600, color: "var(--text-muted)", letterSpacing: "0.06em" }}>
                AUTONOMOUS AI ENG
              </div>
            </div>
          </Link>

          <nav className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 13.5, fontWeight: 500, color: "var(--text-secondary)" }}>
            <a href="#pipeline" style={{ textDecoration: "none" }}>10-Agent Pipeline</a>
            <a href="#capabilities" style={{ textDecoration: "none" }}>Capabilities</a>
            <a href="#governance" style={{ textDecoration: "none" }}>Governance</a>
            <Link to="/pricing" style={{ textDecoration: "none" }}>Pricing</Link>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isAuthenticated ? (
              <Link to="/app" className="btn-primary">
                Open Workspace <ArrowRight size={14} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost">
                  Sign in
                </Link>
                <Link to="/register" className="btn-primary">
                  Get Started <ArrowRight size={14} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section
        style={{
          background:
            "radial-gradient(ellipse 75% 55% at 50% -10%, rgba(59, 130, 246, 0.22), transparent 70%), radial-gradient(ellipse 50% 40% at 85% 15%, rgba(139, 92, 246, 0.16), transparent 65%)",
          padding: "76px 24px 64px",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div style={{ maxWidth: 1120, margin: "0 auto", textAlign: "center" }}>
          <div
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "5px 14px",
              borderRadius: 999,
              background: "var(--primary-light)",
              border: "1px solid #BFDBFE",
              color: "var(--primary-accent)",
              fontSize: 12,
              fontWeight: 600,
              marginBottom: 22,
            }}
          >
            <Sparkles size={13} />
            10 Specialized AI Agents · Human Approval Gates · Full Code Ownership
          </div>

          <h1
            style={{
              fontSize: "clamp(34px, 5vw, 56px)",
              fontWeight: 800,
              letterSpacing: "-0.035em",
              lineHeight: 1.08,
              color: "var(--text-primary)",
              maxWidth: 860,
              margin: "0 auto 20px",
            }}
          >
            Ship Production Software with an{" "}
            <span
              style={{
                background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Autonomous AI Engineering Team
            </span>
          </h1>

          <p
            style={{
              fontSize: "clamp(15px, 1.8vw, 18px)",
              color: "var(--text-secondary)",
              maxWidth: 680,
              margin: "0 auto 32px",
              lineHeight: 1.65,
            }}
          >
            SYNAPSE turns product requirements into architected, tested, security-audited codebases.
            Supervise 10 specialized agents across PRD, architecture, full-stack code, QA, SAST security,
            and deployment—with full auditability and zero vendor lock-in.
          </p>

          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
            <button
              type="button"
              className="btn-primary btn-lg"
              onClick={handleDemoLaunch}
              disabled={demoLoading}
            >
              <Play size={15} />
              {demoLoading ? "Launching Workspace..." : "Launch Live Demo Workspace"}
            </button>
            <Link to="/register" className="btn-secondary btn-lg">
              Create Free Account <ArrowRight size={15} />
            </Link>
            <Link to="/pricing" className="btn-ghost btn-lg">
              View Pricing
            </Link>
          </div>

          {/* Interactive 10-Stage Pipeline Preview */}
          <div
            id="pipeline"
            style={{
              marginTop: 56,
              background: "#0F172A",
              borderRadius: 18,
              padding: "24px",
              border: "1px solid #1E293B",
              boxShadow: "0 24px 48px -12px rgba(15, 23, 42, 0.28)",
              textAlign: "left",
              color: "#F8FAFC",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
                paddingBottom: 18,
                marginBottom: 18,
                borderBottom: "1px solid rgba(148, 163, 184, 0.16)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="pulse-indicator" />
                <span style={{ fontSize: 13, fontWeight: 600, fontFamily: "var(--font-mono)", color: "#E2E8F0" }}>
                  SYNAPSE ORCHESTRATOR · 10-STAGE SDLC PIPELINE
                </span>
              </div>
              <span style={{ fontSize: 12, color: "#94A3B8" }}>
                Click any agent stage to inspect its responsibility
              </span>
            </div>

            <div className="grid-pipeline">
              {PIPELINE_STAGES.map((stage, idx) => {
                const isSelected = activeStage === idx;
                return (
                  <button
                    key={stage.num}
                    type="button"
                    onClick={() => setActiveStage(idx)}
                    style={{
                      textAlign: "left",
                      padding: "12px 13px",
                      borderRadius: 10,
                      border: isSelected ? "1px solid #3B82F6" : "1px solid rgba(148, 163, 184, 0.16)",
                      background: isSelected ? "rgba(37, 99, 235, 0.18)" : "rgba(30, 41, 59, 0.55)",
                      color: "#F8FAFC",
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 4 }}>
                      <span style={{ fontSize: 10, fontFamily: "var(--font-mono)", color: isSelected ? "#93C5FD" : "#64748B", fontWeight: 600 }}>
                        STAGE {stage.num}
                      </span>
                      <CheckCircle2 size={12} color={isSelected ? "#60A5FA" : "#10B981"} />
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{stage.name}</div>
                    <div style={{ fontSize: 11, color: "#94A3B8", marginTop: 2 }}>{stage.role}</div>
                  </button>
                );
              })}
            </div>

            <div
              style={{
                marginTop: 18,
                padding: "14px 16px",
                borderRadius: 10,
                background: "rgba(30, 41, 59, 0.75)",
                border: "1px solid rgba(59, 130, 246, 0.25)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: 12,
              }}
            >
              <div>
                <div style={{ fontSize: 12, color: "#93C5FD", fontWeight: 600, fontFamily: "var(--font-mono)" }}>
                  ACTIVE STAGE {PIPELINE_STAGES[activeStage].num} · {PIPELINE_STAGES[activeStage].name.toUpperCase()}
                </div>
                <div style={{ fontSize: 14, color: "#F1F5F9", marginTop: 4 }}>
                  {PIPELINE_STAGES[activeStage].detail}
                </div>
              </div>
              <button type="button" className="btn-primary btn-sm" onClick={handleDemoLaunch}>
                Run in Workflow Studio <ArrowRight size={13} />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Core Capabilities */}
      <section id="capabilities" style={{ padding: "72px 24px", background: "var(--bg-main)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div style={{ textAlign: "center", maxWidth: 640, margin: "0 auto 44px" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary-accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>
              WHY TEAMS CHOOSE SYNAPSE
            </div>
            <h2 style={{ fontSize: 30, fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 12 }}>
              Built for Real Engineering Governance—Not Black-Box Prompts
            </h2>
            <p style={{ fontSize: 15, color: "var(--text-secondary)" }}>
              Every artifact, test assertion, security finding, and human sign-off is versioned, inspectable, and downloadable.
            </p>
          </div>

          <div className="grid-3col">
            {[
              {
                icon: <Users size={20} />,
                title: "10 Specialized AI Engineers",
                desc: "Dedicated Supervisor, PM, System Architect, Backend, Frontend, Reviewer, QA, Security, Docs, and Deployment agents collaborate through a real task graph.",
              },
              {
                icon: <Lock size={20} />,
                title: "Human-in-the-Loop Approval Gates",
                desc: "Pause execution after PRD & Architecture generation so your principal engineers review and approve specifications before code generation starts.",
              },
              {
                icon: <FlaskConical size={20} />,
                title: "Automated Sandbox QA",
                desc: "Verify Python AST syntax and execute generated pytest suites in isolated project workspaces with full pass/fail diagnostics.",
              },
              {
                icon: <ShieldCheck size={20} />,
                title: "Built-In SAST Security Audits",
                desc: "Automatically scan generated source artifacts for hardcoded secrets, eval/exec injection, SQL interpolation, and insecure CORS before release.",
              },
              {
                icon: <FileCode2 size={20} />,
                title: "100% Downloadable Codebase",
                desc: "Inspect every generated file in the Code Workspace, browse architecture ADRs, or export the entire project as a clean ZIP archive.",
              },
              {
                icon: <GitBranch size={20} />,
                title: "Full Audit Trail & Delivery Dossiers",
                desc: "Track every agent action, token cost, commit, and approval decision with exportable Markdown & PDF engineering delivery reports.",
              },
            ].map((item) => (
              <div key={item.title} className="card card-interactive" style={{ padding: 24 }}>
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 10,
                    background: "var(--primary-light)",
                    color: "var(--primary-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                  }}
                >
                  {item.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
                <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Governance & Architecture Strip */}
      <section id="governance" style={{ padding: "64px 24px", background: "rgba(15, 23, 42, 0.45)", borderTop: "1px solid var(--border-color)" }}>
        <div style={{ maxWidth: 1120, margin: "0 auto" }}>
          <div className="grid-2col" style={{ alignItems: "center" }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary-accent)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 10 }}>
                ENTERPRISE ARCHITECTURE
              </div>
              <h2 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.025em", marginBottom: 14 }}>
                Self-Hostable, Transparent, and Ready for Your Stack
              </h2>
              <p style={{ fontSize: 14.5, color: "var(--text-secondary)", marginBottom: 20, lineHeight: 1.65 }}>
                Run SYNAPSE locally with SQLite or scale on PostgreSQL 16 + Docker. Configure your preferred LLM models,
                retry limits, and approval policies from a single persistent control plane.
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {[
                  "Real-time WebSocket execution telemetry across all 10 stages",
                  "Append-only audit log with full JSON inspection for compliance reviews",
                  "JWT authentication, sliding-window rate limiting, and hardened Docker deployment",
                ].map((point) => (
                  <div key={point} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, fontWeight: 500 }}>
                    <CheckCircle2 size={16} color="var(--success)" style={{ flexShrink: 0 }} />
                    <span>{point}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="card" style={{ padding: 26, background: "var(--bg-main)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
                <Layers size={18} color="var(--primary-accent)" />
                <span style={{ fontWeight: 700, fontSize: 15 }}>Ready to launch your first autonomous build?</span>
              </div>
              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", marginBottom: 20 }}>
                Start in seconds with our seeded demo workspace or create a dedicated team workspace on the Starter plan—free forever for solo builders.
              </p>
              <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                <button type="button" className="btn-primary" onClick={handleDemoLaunch} disabled={demoLoading}>
                  <Zap size={14} /> Try Live Demo Now
                </button>
                <Link to="/pricing" className="btn-secondary">
                  Compare Plans
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ padding: "36px 24px", borderTop: "1px solid var(--border-color)", background: "var(--bg-main)" }}>
        <div
          style={{
            maxWidth: 1200,
            margin: "0 auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 16,
            fontSize: 13,
            color: "var(--text-muted)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Terminal size={15} color="var(--primary-accent)" />
            <strong style={{ color: "var(--text-primary)" }}>SYNAPSE</strong>
            <span>— Autonomous AI Software Engineering Platform</span>
          </div>
          <div style={{ display: "flex", gap: 20 }}>
            <Link to="/pricing" style={{ textDecoration: "none" }}>Pricing</Link>
            <Link to="/login" style={{ textDecoration: "none" }}>Sign In</Link>
            <Link to="/register" style={{ textDecoration: "none" }}>Create Account</Link>
            <Link to="/app" style={{ textDecoration: "none" }}>Workspace</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
