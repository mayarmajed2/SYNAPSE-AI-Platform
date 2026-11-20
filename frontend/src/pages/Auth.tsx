import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Cpu, ArrowRight, Play, ShieldCheck, CheckCircle2, AlertCircle } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";

export const Auth: React.FC<{ mode: "login" | "register" }> = ({ mode }) => {
  const { login, register, demoLogin } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as any)?.from || "/app";

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [errMsg, setErrMsg] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrMsg("");
    setSubmitting(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
        success("Welcome back!", "Signed in to your SYNAPSE workspace.");
      } else {
        if (password.length < 8) {
          throw new Error("Password must be at least 8 characters long.");
        }
        await register({
          email: email.trim(),
          full_name: fullName.trim(),
          password,
          workspace_name: workspaceName.trim() || undefined,
        });
        success("Workspace created!", "Your 10 AI engineering agents are ready.");
      }
      navigate(from, { replace: true });
    } catch (err: any) {
      setErrMsg(err?.message || "Authentication failed. Please check your credentials.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemo = async () => {
    setErrMsg("");
    setDemoLoading(true);
    try {
      await demoLogin();
      success("Signed in to Demo Workspace", "Exploring SYNAPSE HQ as Principal Engineer.");
      navigate("/app", { replace: true });
    } catch (err: any) {
      setErrMsg(err?.message || "Could not connect to backend API.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
        background: "var(--bg-main)",
      }}
    >
      {/* Left Brand Panel */}
      <div
        className="hide-mobile"
        style={{
          background: "linear-gradient(155deg, #0F172A 0%, #1E293B 60%, #1E3A8A 100%)",
          color: "#F8FAFC",
          padding: "48px 44px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none", color: "#FFFFFF" }}>
          <div
            style={{
              width: 36,
              height: 36,
              borderRadius: 10,
              background: "var(--primary-accent)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Cpu size={19} />
          </div>
          <div>
            <div style={{ fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em" }}>SYNAPSE</div>
            <div style={{ fontSize: 10, color: "#93C5FD", fontWeight: 600, letterSpacing: "0.08em" }}>
              AUTONOMOUS AI ENG
            </div>
          </div>
        </Link>

        <div style={{ maxWidth: 420 }}>
          <h2 style={{ fontSize: 30, fontWeight: 800, lineHeight: 1.18, letterSpacing: "-0.025em", marginBottom: 16 }}>
            Your 10-specialist AI engineering team, ready on demand.
          </h2>
          <p style={{ fontSize: 14.5, color: "#CBD5E1", lineHeight: 1.65, marginBottom: 28 }}>
            Submit a product brief, approve the architecture spec, and inspect verified backend, frontend,
            test suites, and security scans in real time.
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {[
              "10 specialized SDLC agents with live WebSocket telemetry",
              "Real AST syntax verification & SAST vulnerability audits",
              "100% downloadable codebase & Markdown delivery reports",
            ].map((item) => (
              <div key={item} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13.5, color: "#E2E8F0" }}>
                <CheckCircle2 size={16} color="#34D399" style={{ flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#94A3B8" }}>
          <ShieldCheck size={15} color="#60A5FA" />
          JWT-authenticated sessions · PBKDF2-SHA256 credential protection
        </div>
      </div>

      {/* Right Form Panel */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "36px 24px",
        }}
      >
        <div className="card fade-in" style={{ maxWidth: 430, width: "100%", padding: 32, boxShadow: "var(--shadow-md)" }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em", marginBottom: 6 }}>
              {mode === "login" ? "Sign in to SYNAPSE" : "Create your workspace"}
            </h1>
            <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
              {mode === "login"
                ? "Enter your credentials or launch the seeded demo workspace."
                : "Start building with 10 autonomous AI software engineers."}
            </p>
          </div>

          {errMsg && (
            <div
              style={{
                background: "var(--error-light)",
                border: "1px solid #FECACA",
                color: "var(--error)",
                borderRadius: 10,
                padding: "10px 12px",
                fontSize: 12.5,
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{errMsg}</span>
            </div>
          )}

          <button
            type="button"
            className="btn-secondary"
            style={{ width: "100%", padding: "10px 14px", marginBottom: 18, fontWeight: 600 }}
            onClick={handleDemo}
            disabled={demoLoading}
          >
            <Play size={14} color="var(--primary-accent)" />
            {demoLoading ? "Launching Demo Workspace..." : "Continue with 1-Click Demo Workspace"}
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
            <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 600 }}>OR WITH EMAIL</span>
            <div style={{ flex: 1, height: 1, background: "var(--border-color)" }} />
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {mode === "register" && (
              <>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>Full Name</label>
                  <input
                    type="text"
                    required
                    className="input-field"
                    placeholder="Alex Vance"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>
                    Workspace Name <span style={{ color: "var(--text-muted)", fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    type="text"
                    className="input-field"
                    placeholder="Acme Engineering HQ"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                  />
                </div>
              </>
            )}

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>Work Email</label>
              <input
                type="email"
                required
                className="input-field"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>Password</label>
              <input
                type="password"
                required
                minLength={mode === "register" ? 8 : 1}
                className="input-field"
                placeholder={mode === "register" ? "Minimum 8 characters" : "Enter your password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              style={{ width: "100%", padding: "11px 16px", marginTop: 4 }}
              disabled={submitting}
            >
              {submitting
                ? mode === "login"
                  ? "Signing in..."
                  : "Creating workspace..."
                : mode === "login"
                ? "Sign In"
                : "Create Workspace"}
              <ArrowRight size={14} />
            </button>
          </form>

          <div style={{ marginTop: 20, textAlign: "center", fontSize: 13, color: "var(--text-secondary)" }}>
            {mode === "login" ? (
              <>
                New to SYNAPSE?{" "}
                <Link to="/register" style={{ color: "var(--primary-accent)", fontWeight: 600, textDecoration: "none" }}>
                  Create an account
                </Link>
              </>
            ) : (
              <>
                Already have an account?{" "}
                <Link to="/login" style={{ color: "var(--primary-accent)", fontWeight: 600, textDecoration: "none" }}>
                  Sign in
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
