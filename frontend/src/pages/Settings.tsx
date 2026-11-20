import React, { useEffect, useState } from "react";
import { Save, Database, Cpu, ShieldCheck, CheckCircle2, AlertTriangle, RefreshCw } from "lucide-react";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { ErrorBanner, LoadingSkeleton } from "../components/ui/PageState";

export const Settings: React.FC = () => {
  const { success, error } = useToast();
  const { refreshUser } = useAuth();

  const [health, setHealth] = useState<any>(null);
  const [healthError, setHealthError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [form, setForm] = useState({
    workspace_name: "SYNAPSE HQ",
    primary_model: "llama-3.3-70b-versatile",
    fast_model: "llama-3.1-8b-instant",
    max_retries: 3,
    sandbox_timeout_seconds: 30,
    require_approval_gates: true,
    auto_run_security_scan: true,
    plan: "pro",
    groq_configured: false,
  });

  const loadAll = async () => {
    setLoading(true);
    setErrorMsg("");
    setHealthError(false);
    try {
      const [st, hl] = await Promise.all([
        api.getSettings(),
        api.getHealth().catch(() => {
          setHealthError(true);
          return null;
        }),
      ]);
      if (st) {
        setForm((prev) => ({ ...prev, ...st }));
      }
      setHealth(hl);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load workspace settings from backend.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setErrorMsg("");
    try {
      const updated = await api.updateSettings({
        workspace_name: form.workspace_name,
        primary_model: form.primary_model,
        fast_model: form.fast_model,
        max_retries: Number(form.max_retries),
        sandbox_timeout_seconds: Number(form.sandbox_timeout_seconds),
        require_approval_gates: form.require_approval_gates,
        auto_run_security_scan: form.auto_run_security_scan,
      });
      setForm((prev) => ({ ...prev, ...updated }));
      await refreshUser();
      success("Settings saved", "Workspace configuration persisted to the database.");
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to save settings.");
      error("Save failed", err?.message || "Could not persist settings.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={2} />;

  const dbConnected = !healthError && health?.database?.status === "connected";

  return (
    <div className="fade-in" style={{ maxWidth: 920, display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Workspace Settings</h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
            Configure persistent LLM routing, execution guardrails, and inspect live infrastructure health.
          </p>
        </div>
        <button type="button" className="btn-secondary btn-sm" onClick={loadAll}>
          <RefreshCw size={14} /> Refresh Status
        </button>
      </div>

      {errorMsg && <ErrorBanner message={errorMsg} onRetry={loadAll} />}

      {/* Live Infrastructure Health */}
      <div className="grid-3col">
        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>
            <Database size={15} color={dbConnected ? "var(--success)" : "var(--error)"} /> DATABASE ENGINE
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {dbConnected ? health?.database?.type || "Connected" : "Backend Unreachable"}
          </div>
          <div style={{ marginTop: 6 }}>
            <span className={`badge ${dbConnected ? "badge-success" : "badge-error"}`}>
              {dbConnected ? "Connected" : "Offline"}
            </span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>
            <Cpu size={15} color="var(--primary-accent)" /> AGENT WORKFORCE
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {health ? `${health?.agents?.registered ?? 0} Agents Registered` : "Unavailable"}
          </div>
          <div style={{ marginTop: 6 }}>
            <span className={`badge ${health?.agents?.status === "ready" ? "badge-success" : "badge-warning"}`}>
              {health?.agents?.status || "unknown"}
            </span>
          </div>
        </div>

        <div className="card">
          <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 12, fontWeight: 700, color: "var(--text-muted)", marginBottom: 8 }}>
            <ShieldCheck size={15} color="var(--indigo-accent)" /> GROQ LLM PROVIDER
          </div>
          <div style={{ fontSize: 16, fontWeight: 700 }}>
            {form.groq_configured ? "API Key Active" : "Offline Template Mode"}
          </div>
          <div style={{ marginTop: 6 }}>
            <span className={`badge ${form.groq_configured ? "badge-success" : "badge-neutral"}`}>
              {form.groq_configured ? "Live Inference" : "Set GROQ_API_KEY in .env"}
            </span>
          </div>
        </div>
      </div>

      {/* Persistent Configuration Form */}
      <form onSubmit={handleSave} className="card" style={{ padding: 24, display: "flex", flexDirection: "column", gap: 18 }}>
        <h2 style={{ fontSize: 16, fontWeight: 700 }}>Workspace & AI Execution Controls</h2>

        <div className="grid-2col">
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>Workspace Name</label>
            <input
              type="text"
              className="input-field"
              value={form.workspace_name}
              onChange={(e) => setForm({ ...form, workspace_name: e.target.value })}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>Active Plan</label>
            <input type="text" className="input-field" value={form.plan.toUpperCase()} disabled />
          </div>
        </div>

        <div className="grid-2col">
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>Primary Reasoning Model</label>
            <select
              className="input-field"
              value={form.primary_model}
              onChange={(e) => setForm({ ...form, primary_model: e.target.value })}
            >
              <option value="llama-3.3-70b-versatile">Groq · Llama 3.3 70B Versatile</option>
              <option value="llama-3.1-70b-versatile">Groq · Llama 3.1 70B Versatile</option>
              <option value="mixtral-8x7b-32768">Groq · Mixtral 8x7B 32K</option>
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>Fast Utility Model</label>
            <select
              className="input-field"
              value={form.fast_model}
              onChange={(e) => setForm({ ...form, fast_model: e.target.value })}
            >
              <option value="llama-3.1-8b-instant">Groq · Llama 3.1 8B Instant</option>
              <option value="gemma2-9b-it">Groq · Gemma 2 9B IT</option>
            </select>
          </div>
        </div>

        <div className="grid-2col">
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>Max Stage Retries (0–10)</label>
            <input
              type="number"
              min={0}
              max={10}
              className="input-field"
              value={form.max_retries}
              onChange={(e) => setForm({ ...form, max_retries: Number(e.target.value) })}
            />
          </div>
          <div>
            <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>Sandbox Timeout (seconds)</label>
            <input
              type="number"
              min={5}
              max={120}
              className="input-field"
              value={form.sandbox_timeout_seconds}
              onChange={(e) => setForm({ ...form, sandbox_timeout_seconds: Number(e.target.value) })}
            />
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.require_approval_gates}
              onChange={(e) => setForm({ ...form, require_approval_gates: e.target.checked })}
            />
            <span>Enforce Human Approval Gate before backend/frontend code generation by default</span>
          </label>
          <label style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 13, cursor: "pointer" }}>
            <input
              type="checkbox"
              checked={form.auto_run_security_scan}
              onChange={(e) => setForm({ ...form, auto_run_security_scan: e.target.checked })}
            />
            <span>Automatically execute SAST vulnerability audit after code generation</span>
          </label>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: 12, borderTop: "1px solid var(--border-color)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--text-muted)" }}>
            {dbConnected ? <CheckCircle2 size={14} color="var(--success)" /> : <AlertTriangle size={14} color="var(--error)" />}
            <span>Changes persist directly to your workspace database record.</span>
          </div>
          <button type="submit" className="btn-primary" disabled={saving}>
            <Save size={14} /> {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};
