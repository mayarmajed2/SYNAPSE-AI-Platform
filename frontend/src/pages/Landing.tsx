import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, Play, Sparkles, RotateCcw, CheckCircle2 } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { AgentGlyph } from "../components/ui/AgentGlyph";
import { SynapseLogo } from "../components/ui/SynapseLogo";

const PIPELINE_STAGES = [
  { num: "01", role: "supervisor", name: "Supervisor", scope: "Task Graph", color: "#FF4D8D", detail: "Decomposes your product prompt into a 10-stage autonomous execution plan." },
  { num: "02", role: "product_manager", name: "Product Manager", scope: "PRD & Stories", color: "#FB923C", detail: "Writes structured functional requirements, user stories, and MVP scope." },
  { num: "03", role: "system_architect", name: "System Architect", scope: "APIs & Schema", color: "#A78BFA", detail: "Designs relational tables, REST contracts, and documented ADRs." },
  { num: "04", role: "backend_developer", name: "Backend Dev", scope: "FastAPI", color: "#38BDF8", detail: "Generates typed FastAPI endpoints, Pydantic schemas, and DB queries." },
  { num: "05", role: "frontend_developer", name: "Frontend Dev", scope: "React 19", color: "#F472B6", detail: "Builds modular React TypeScript components and live API bindings." },
  { num: "06", role: "code_reviewer", name: "Code Reviewer", scope: "Peer Audit", color: "#FBBF24", detail: "Checks architecture boundaries, type safety, and code maintainability." },
  { num: "07", role: "qa_engineer", name: "QA Engineer", scope: "Pytest Sandbox", color: "#60A5FA", detail: "Verifies Python AST syntax and executes automated pytest assertions." },
  { num: "08", role: "security_agent", name: "Security Agent", scope: "SAST & OWASP", color: "#FB7185", detail: "Scans every generated file for secrets, eval/exec, SQLi, and CWE risks." },
  { num: "09", role: "documentation_agent", name: "Docs Agent", scope: "Dossiers", color: "#C084FC", detail: "Produces README guides, OpenAPI docs, and executive delivery reports." },
  { num: "10", role: "deployment_agent", name: "DevOps Agent", scope: "Docker Release", color: "#22D3EE", detail: "Packages non-root Dockerfiles, compose manifests, and healthchecks." },
];

const QUICK_PROMPTS = [
  "AI Travel Concierge with interactive itineraries & Stripe checkout",
  "Realtime B2B SaaS Analytics Hub with team RBAC & audit logs",
  "Smart Healthcare Booking Portal with automated reminders",
];

export const Landing: React.FC = () => {
  const { isAuthenticated, demoLogin } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const [activeStage, setActiveStage] = useState(0);
  const [demoLoading, setDemoLoading] = useState(false);

  // Interactive Live Multi-Agent Simulator
  const [promptInput, setPromptInput] = useState(QUICK_PROMPTS[0]);
  const [simRunning, setSimRunning] = useState(false);
  const [completedUpTo, setCompletedUpTo] = useState<number>(-1);
  const simTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    return () => {
      if (simTimerRef.current) clearInterval(simTimerRef.current);
    };
  }, []);

  const runLivePreview = () => {
    if (simTimerRef.current) clearInterval(simTimerRef.current);
    setSimRunning(true);
    setCompletedUpTo(-1);
    setActiveStage(0);
    let step = 0;
    simTimerRef.current = setInterval(() => {
      setCompletedUpTo(step);
      step += 1;
      if (step >= PIPELINE_STAGES.length) {
        if (simTimerRef.current) clearInterval(simTimerRef.current);
        setSimRunning(false);
        setActiveStage(PIPELINE_STAGES.length - 1);
      } else {
        setActiveStage(step);
      }
    }, 480);
  };

  const handleDemoLaunch = async () => {
    setDemoLoading(true);
    try {
      await demoLogin();
      success("Welcome to Synapse!", "Entered the live Multi-Agent Command Center.");
      navigate("/app");
    } catch (err: any) {
      error("Demo login unavailable", err?.message || "Ensure the backend server is running.");
    } finally {
      setDemoLoading(false);
    }
  };

  const currentStage = PIPELINE_STAGES[activeStage];

  return (
    <div style={{ minHeight: "100vh", color: "var(--text-primary)" }}>
      <header
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "rgba(9, 9, 16, 0.78)",
          backdropFilter: "blur(18px)",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div style={{ maxWidth: 1240, margin: "0 auto", padding: "0 28px", height: 64, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <Link to="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            <SynapseLogo size={34} showWordmark />
          </Link>

          <nav className="hide-mobile" style={{ display: "flex", alignItems: "center", gap: 28, fontSize: 13.5, fontWeight: 500, color: "var(--text-secondary)" }}>
            <a href="#playground" style={{ textDecoration: "none" }}>Live Playground</a>
            <a href="#capabilities" style={{ textDecoration: "none" }}>Capabilities</a>
            <Link to="/pricing" style={{ textDecoration: "none" }}>Pricing</Link>
          </nav>

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            {isAuthenticated ? (
              <Link to="/app" className="btn-accent btn-sm">
                Open Workspace <ArrowUpRight size={14} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn-ghost btn-sm">Sign in</Link>
                <Link to="/register" className="btn-primary btn-sm">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section style={{ maxWidth: 1200, margin: "0 auto", padding: "76px 28px 56px", textAlign: "center" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 15px",
            borderRadius: 999,
            background: "rgba(124, 92, 255, 0.16)",
            border: "1px solid rgba(255, 77, 141, 0.35)",
            color: "#F9A8D4",
            fontSize: 12.5,
            fontWeight: 600,
            marginBottom: 24,
          }}
        >
          <span className="pulse-indicator" />
          Click anywhere on the canvas to pulse the neural mesh · 10 AI Agents Ready
        </div>

        <h1
          style={{
            fontSize: "clamp(38px, 5.8vw, 68px)",
            fontWeight: 800,
            lineHeight: 1.04,
            letterSpacing: "-0.04em",
            maxWidth: 900,
            margin: "0 auto 20px",
          }}
        >
          Where 10 AI engineers{" "}
          <span className="gradient-text-live">think, build &amp; ship together.</span>
        </h1>

        <p style={{ fontSize: "clamp(15px, 1.8vw, 18px)", color: "var(--text-secondary)", maxWidth: 660, margin: "0 auto 32px", lineHeight: 1.65 }}>
          Give Synapse a product idea and watch specialized agents collaborate across architecture,
          full-stack code, sandbox QA, SAST security, and Docker delivery—with human approval gates.
        </p>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <button type="button" className="btn-accent btn-lg" onClick={handleDemoLaunch} disabled={demoLoading}>
            <Play size={14} /> {demoLoading ? "Launching Workspace..." : "Launch Live Demo Workspace"}
          </button>
          <Link to="/register" className="btn-primary btn-lg">
            Create Free Account <ArrowRight size={15} />
          </Link>
        </div>

        {/* Interactive Multi-Agent Live Playground */}
        <div
          id="playground"
          className="card"
          style={{
            marginTop: 54,
            padding: 26,
            textAlign: "left",
            border: `1px solid ${currentStage.color}55`,
            boxShadow: `0 24px 60px -16px rgba(0,0,0,0.75), 0 0 40px ${currentStage.color}1F`,
            transition: "border-color 0.35s ease, box-shadow 0.35s ease",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 9 }}>
              <Sparkles size={16} color={currentStage.color} />
              <span style={{ fontSize: 15, fontWeight: 700 }}>Interactive Agent Pipeline Simulator</span>
            </div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {QUICK_PROMPTS.map((qp, idx) => (
                <button
                  key={idx}
                  type="button"
                  className="btn-secondary btn-sm"
                  onClick={() => setPromptInput(qp)}
                  style={{ fontSize: 11.5 }}
                >
                  Idea #{idx + 1}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Prompt Bar */}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 20 }}>
            <input
              type="text"
              className="input-field"
              style={{ flex: 1, minWidth: 240, height: 42 }}
              value={promptInput}
              onChange={(e) => setPromptInput(e.target.value)}
              placeholder="Describe any app idea to watch all 10 agents coordinate..."
            />
            <button type="button" className="btn-accent" onClick={runLivePreview} disabled={simRunning}>
              {simRunning ? <RotateCcw size={14} /> : <Play size={14} />}
              {simRunning ? "Agents Coordinating..." : "Watch 10 Agents Run"}
            </button>
          </div>

          {/* Color-Coded 10-Stage Interactive Grid */}
          <div className="grid-pipeline">
            {PIPELINE_STAGES.map((stage, idx) => {
              const isSelected = activeStage === idx;
              const isDone = completedUpTo >= idx;
              return (
                <button
                  key={stage.num}
                  type="button"
                  onClick={() => setActiveStage(idx)}
                  className="stage-tile"
                  style={{
                    textAlign: "left",
                    padding: 14,
                    borderRadius: 13,
                    border: isSelected
                      ? `1.5px solid ${stage.color}`
                      : isDone
                      ? `1px solid ${stage.color}55`
                      : "1px solid var(--border-color)",
                    background: isSelected
                      ? `${stage.color}22`
                      : isDone
                      ? `${stage.color}10`
                      : "rgba(18, 18, 32, 0.72)",
                    color: "#FFFFFF",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: isSelected || isDone ? stage.color : "var(--text-muted)" }}>
                      {stage.num}
                    </span>
                    {isDone && !isSelected ? (
                      <CheckCircle2 size={15} color={stage.color} />
                    ) : (
                      <span style={{ color: isSelected ? stage.color : "#E2E8F0" }}>
                        <AgentGlyph role={stage.role} size={19} active={false} />
                      </span>
                    )}
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700 }}>{stage.name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 2 }}>{stage.scope}</div>
                </button>
              );
            })}
          </div>

          {/* Dynamic Active Stage Telemetry Bar */}
          <div
            style={{
              marginTop: 18,
              padding: "16px 18px",
              borderRadius: 13,
              background: "rgba(10, 10, 20, 0.78)",
              border: `1px solid ${currentStage.color}44`,
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: currentStage.color }}>
                Stage {currentStage.num} · {currentStage.name} {simRunning ? "— Executing on your prompt..." : ""}
              </div>
              <div style={{ fontSize: 14.5, color: "#FFFFFF", marginTop: 3 }}>{currentStage.detail}</div>
            </div>
            <button type="button" className="btn-primary btn-sm" onClick={handleDemoLaunch}>
              Build This for Real <ArrowUpRight size={14} />
            </button>
          </div>
        </div>
      </section>

      {/* Capabilities */}
      <section id="capabilities" style={{ maxWidth: 1200, margin: "0 auto", padding: "24px 28px 80px" }}>
        <div className="grid-3col">
          {[
            { accent: "#FF4D8D", title: "10 Distinct AI Specialists", desc: "Supervisor, PM, Architect, Backend, Frontend, Reviewer, QA, Security, Docs, and DevOps agents working in concert." },
            { accent: "#7C5CFF", title: "Human-in-the-Loop Gates", desc: "Review and approve PRD & Architecture specs before autonomous code generation begins." },
            { accent: "#38BDF8", title: "Real Sandbox QA & SAST", desc: "Automated Python AST syntax verification, pytest execution, and OWASP/CWE static analysis." },
            { accent: "#FB923C", title: "100% Downloadable Code", desc: "Inspect every versioned file in Code Workspace and export the full codebase as a clean ZIP." },
            { accent: "#F472B6", title: "Live Telemetry & Audits", desc: "Real-time WebSocket execution streams, token cost tracking, and immutable JSON audit trails." },
            { accent: "#A78BFA", title: "Self-Hostable Control Plane", desc: "Runs locally on SQLite or scales on PostgreSQL 16 + hardened non-root Docker with JWT auth." },
          ].map((item) => (
            <div key={item.title} className="card card-interactive">
              <div style={{ width: 32, height: 4, borderRadius: 99, background: item.accent, marginBottom: 14 }} />
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer style={{ borderTop: "1px solid var(--border-color)", padding: "28px" }}>
        <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, fontSize: 13, color: "var(--text-muted)" }}>
          <strong style={{ color: "#FFFFFF" }}>Synapse — Autonomous AI Engineering Platform</strong>
          <div style={{ display: "flex", gap: 22 }}>
            <Link to="/pricing" style={{ textDecoration: "none" }}>Pricing</Link>
            <Link to="/login" style={{ textDecoration: "none" }}>Sign In</Link>
            <Link to="/register" style={{ textDecoration: "none" }}>Register</Link>
            <Link to="/app" style={{ textDecoration: "none", color: "#F9A8D4" }}>Workspace →</Link>
          </div>
        </div>
      </footer>
    </div>
  );
};
