import React, { useEffect, useState, useCallback } from "react";
import { RefreshCw, Users } from "lucide-react";
import { api } from "../services/api";
import { AgentGlyph } from "../components/ui/AgentGlyph";
import { ErrorBanner, EmptyState, LoadingSkeleton } from "../components/ui/PageState";

export const Workforce: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgentId, setSelectedAgentId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const loadAgents = useCallback(async (showSpinner = false) => {
    if (showSpinner) setLoading(true);
    setErrorMsg("");
    try {
      const data = await api.getAgents();
      const list = Array.isArray(data) ? data : [];
      setAgents(list);
      setSelectedAgentId((prev) => (prev && list.some((a) => a.id === prev) ? prev : list[0]?.id || null));
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load agent workforce.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAgents(true);
    const interval = setInterval(() => loadAgents(false), 10000);
    return () => clearInterval(interval);
  }, [loadAgents]);

  const selectedAgent = agents.find((a) => a.id === selectedAgentId) || agents[0] || null;

  if (loading) return <LoadingSkeleton rows={3} />;

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 24 }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: 14 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.03em" }}>Agent Workforce</h1>
          <p style={{ fontSize: 14, color: "var(--text-secondary)", marginTop: 4 }}>
            {agents.length || 10} specialized AI engineers with distinct identities, live telemetry, and guardrails.
          </p>
        </div>
        <button type="button" className="btn-secondary btn-sm" onClick={() => loadAgents(true)}>
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      {errorMsg && <ErrorBanner message={errorMsg} onRetry={() => loadAgents(true)} />}

      {agents.length === 0 ? (
        <EmptyState
          icon={<Users size={22} />}
          title="No AI agents registered"
          description="Verify the backend database is connected and seeded."
        />
      ) : (
        <div className="grid-main-aside">
          <div className="grid-2col" style={{ gap: 14 }}>
            {agents.map((agent) => {
              const isSelected = selectedAgent?.id === agent.id;
              const isWorking = agent.status === "working" || agent.status === "running" || agent.status === "thinking";
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setSelectedAgentId(agent.id)}
                  className="card card-interactive"
                  style={{
                    textAlign: "left",
                    cursor: "pointer",
                    padding: 18,
                    border: isSelected ? "1.5px solid var(--primary-accent)" : "1px solid var(--border-color)",
                    background: isSelected ? "#161B24" : "var(--bg-card)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10, marginBottom: 12 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div
                        style={{
                          width: 42,
                          height: 42,
                          borderRadius: 12,
                          border: "1px solid var(--border-color)",
                          background: isWorking || isSelected ? "var(--primary-light)" : "#161922",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#FFFFFF",
                          flexShrink: 0,
                        }}
                      >
                        <AgentGlyph role={agent.role} size={22} active={isWorking || isSelected} />
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#FFFFFF" }}>{agent.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)", textTransform: "capitalize" }}>
                          {(agent.display_name || agent.role || "").replace(/_/g, " ")}
                        </div>
                      </div>
                    </div>
                    <span className={`badge ${isWorking ? "badge-primary" : agent.status === "failed" ? "badge-error" : "badge-neutral"}`}>
                      {agent.status}
                    </span>
                  </div>

                  <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 14 }}>
                    {(agent.description || "").slice(0, 108)}
                    {(agent.description || "").length > 108 ? "…" : ""}
                  </p>

                  <div style={{ height: 4, borderRadius: 99, background: "rgba(255,255,255,0.07)", marginBottom: 10, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${Math.min(100, agent.success_rate || 0)}%`, background: "var(--primary-accent)", borderRadius: 99 }} />
                  </div>

                  <div className="tabular-nums" style={{ display: "flex", justifyContent: "space-between", fontSize: 12, color: "var(--text-muted)" }}>
                    <span>Completed <strong style={{ color: "#FFFFFF" }}>{agent.completed_tasks}</strong></span>
                    <span>Reliability <strong style={{ color: "var(--primary-accent)" }}>{agent.success_rate}%</strong></span>
                    <span>Avg <strong style={{ color: "#FFFFFF" }}>{((agent.avg_execution_time_ms || 0) / 1000).toFixed(1)}s</strong></span>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedAgent && (
            <div className="ink-panel" style={{ position: "sticky", top: 80 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 14, marginBottom: 18 }}>
                <div
                  style={{
                    width: 50,
                    height: 50,
                    borderRadius: 14,
                    background: "var(--primary-light)",
                    border: "1px solid rgba(16, 229, 147, 0.3)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#FFFFFF",
                  }}
                >
                  <AgentGlyph role={selectedAgent.role} size={28} active />
                </div>
                <div>
                  <h2 style={{ fontSize: 19, fontWeight: 700 }}>{selectedAgent.name}</h2>
                  <div style={{ fontSize: 13, color: "var(--text-secondary)", textTransform: "capitalize" }}>
                    {(selectedAgent.display_name || selectedAgent.role || "").replace(/_/g, " ")}
                  </div>
                </div>
              </div>

              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 6 }}>Mission Scope</div>
              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 18 }}>
                {selectedAgent.description}
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, padding: 14, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid var(--border-color)", marginBottom: 18 }}>
                <div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Completed Tasks</div>
                  <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>{selectedAgent.completed_tasks}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Reliability</div>
                  <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 800, color: "var(--primary-accent)", marginTop: 2 }}>{selectedAgent.success_rate}%</div>
                </div>
              </div>

              <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)", marginBottom: 8 }}>System Prompt &amp; Guardrails</div>
              <div
                style={{
                  background: "#08090C",
                  border: "1px solid var(--border-color)",
                  borderRadius: 10,
                  padding: 14,
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  lineHeight: 1.65,
                  color: "#D1D5DB",
                  maxHeight: 240,
                  overflowY: "auto",
                }}
              >
                {selectedAgent.system_prompt || "Standard autonomous engineering guardrails active."}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
