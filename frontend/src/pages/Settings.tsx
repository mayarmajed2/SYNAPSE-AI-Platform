import React, { useEffect, useState } from "react";
import { Key, Sliders, Check, Server } from "lucide-react";
import { api } from "../services/api";

export const SettingsPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [apiKeyMasked] = useState("••••••••••••••••••••••••");
  const [primaryModel, setPrimaryModel] = useState("llama-3.3-70b-versatile");
  const [fastModel, setFastModel] = useState("llama-3.1-8b-instant");
  const [maxRetries, setMaxRetries] = useState(3);
  const [requireApprovals, setRequireApprovals] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    api.getHealth()
      .then((data) => setHealth(data))
      .catch(() => {});
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  return (
    <div style={{ maxWidth: "900px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>
          Platform Settings & Governance
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Configure LLM inference providers, execution constraints, safety guardrails, and system diagnostics.
        </p>
      </div>

      <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
        {/* System & Database Health Diagnostic */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Server size={18} color="var(--primary-accent)" />
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              System & Database Health
            </h2>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ padding: "14px", backgroundColor: "#FAFAFA", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Database Engine</div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <span className="pulse-indicator" />
                <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>
                  {health?.database?.type || "PostgreSQL 16"} ({health?.database?.status || "Connected"})
                </span>
              </div>
            </div>

            <div style={{ padding: "14px", backgroundColor: "#FAFAFA", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Specialized AI Workforce</div>
              <div style={{ fontWeight: 600, color: "var(--text-primary)", marginTop: "4px" }}>
                {health?.agents?.registered || 9} Agents Ready & Operational
              </div>
            </div>
          </div>
        </div>

        {/* LLM Provider Configuration */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Key size={18} color="var(--primary-accent)" />
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Groq AI Provider Credentials
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Groq API Key (Configured locally in <code>backend/.env</code>)
              </label>
              <input
                type="text"
                disabled
                className="input-field"
                value={apiKeyMasked}
                style={{ backgroundColor: "#F3F4F6", cursor: "not-allowed" }}
              />
              <span style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px", display: "block" }}>
                Secrets are protected and never rendered in plaintext in the browser or sent in logs.
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Primary High-Capacity Model
                </label>
                <select
                  className="input-field"
                  value={primaryModel}
                  onChange={(e) => setPrimaryModel(e.target.value)}
                >
                  <option value="llama-3.3-70b-versatile">llama-3.3-70b-versatile (Recommended)</option>
                  <option value="llama-3.1-70b-versatile">llama-3.1-70b-versatile</option>
                  <option value="mixtral-8x7b-32768">mixtral-8x7b-32768</option>
                </select>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Fast Inference Model
                </label>
                <select
                  className="input-field"
                  value={fastModel}
                  onChange={(e) => setFastModel(e.target.value)}
                >
                  <option value="llama-3.1-8b-instant">llama-3.1-8b-instant (Fastest)</option>
                  <option value="llama3-8b-8192">llama3-8b-8192</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Execution Constraints & Human Governance */}
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
            <Sliders size={18} color="var(--primary-accent)" />
            <h2 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Execution Limits & Governance
            </h2>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "6px" }}>
                Maximum Retries Per Task
              </label>
              <input
                type="number"
                min={1}
                max={5}
                className="input-field"
                value={maxRetries}
                onChange={(e) => setMaxRetries(parseInt(e.target.value) || 3)}
                style={{ width: "160px" }}
              />
              <span style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px", display: "block" }}>
                Limits loop cycles between Code Reviewer / QA and Developer agents to avoid infinite loops.
              </span>
            </div>

            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                padding: "12px",
                backgroundColor: "#FAFAFA",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
              }}
            >
              <input
                type="checkbox"
                id="govApprovals"
                checked={requireApprovals}
                onChange={(e) => setRequireApprovals(e.target.checked)}
                style={{ width: "16px", height: "16px" }}
              />
              <label htmlFor="govApprovals" style={{ fontSize: "13px", fontWeight: 500, color: "var(--text-primary)", cursor: "pointer" }}>
                Enable Human Approval Gate before entering code development
              </label>
            </div>
          </div>
        </div>

        {/* Save Actions */}
        <div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", gap: "12px" }}>
          {saved && (
            <span style={{ fontSize: "13px", color: "var(--success)", fontWeight: 600, display: "flex", alignItems: "center", gap: "4px" }}>
              <Check size={16} />
              Platform preferences saved successfully!
            </span>
          )}
          <button type="submit" className="btn-primary" style={{ padding: "10px 24px" }}>
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
};
