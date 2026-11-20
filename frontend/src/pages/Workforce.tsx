import React, { useEffect, useState, useCallback } from "react";
import { Terminal, Users, RefreshCw } from "lucide-react";
import { api } from "../services/api";
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
      // Functional update avoids stale closure resetting user's selection every 10s!
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
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Autonomous Agent Workforce</h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
            Fleet of {agents.length || 10} specialized AI engineers executing across the complete software development lifecycle.
          </p>
        </div>
        <button type="button" className="btn-secondary btn-sm" onClick={() => loadAgents(true)}>
          <RefreshCw size={14} /> Refresh Fleet
        </button>
      </div>

      {errorMsg && <ErrorBanner message={errorMsg} onRetry={() => loadAgents(true)} />}

      {agents.length === 0 ? (
        <EmptyState
          icon={<Users size={24} />}
          title="No AI agents registered"
          description="Verify the backend database is connected and seeded with the 10-specialist workforce."
        />
      ) : (
        <div className="grid-main-aside">
          <div className="grid-2col">
            {agents.map((agent) => {
              const isSelected = selectedAgent?.id === agent.id;
              const isWorking = agent.status === "working" || agent.status === "running" || agent.status === "thinking";
              const accent = agent.avatar_color || "#3B82F6";
              return (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => setSelectedAgentId(agent.id)}
                  className={`card card-interactive ${isWorking ? "agent-active-glow" : ""}`}
                  style={{
                    textAlign: "left",
                    cursor: "pointer",
                    border: isSelected ? `1.5px solid ${accent}` : "1px solid var(--border-color)",
                    background: isSelected ? "rgba(30, 41, 59, 0.92)" : "var(--bg-card)",
                    boxShadow: isSelected ? `0 0 24px ${accent}33` : undefined,
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <div
                        style={{
                          width: 38,
                          height: 38,
                          borderRadius: 10,
                          background: `linear-gradient(135deg, ${accent}33 0%, ${accent}18 100%)`,
                          border: `1px solid ${accent}55`,
                          color: "#F8FAFC",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontWeight: 800,
                          fontSize: 15,
                        }}
                      >
                        {agent.name?.[0] || "A"}
                      </div>
                      <div>
                        <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--text-primary)" }}>{agent.name}</div>
                        <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{agent.display_name}</div>
                      </div>
                    </div>
                    <span className={`badge ${isWorking ? "badge-cyan" : agent.status === "failed" ? "badge-error" : "badge-neutral"}`}>
                      {isWorking && <span className="pulse-indicator" style={{ width: 6, height: 6, background: "#22D3EE" }} />}
                      {agent.status}
                    </span>
                  </div>

                  <p style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 14 }}>
                    {(agent.description || "").slice(0, 115)}
                    {(agent.description || "").length > 115 ? "..." : ""}
                  </p>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 600, marginBottom: 4 }}>
                    <span style={{ color: "var(--text-muted)" }}>Reliability</span>
                    <span style={{ color: "var(--success)" }}>{agent.success_rate}%</span>
                  </div>
                  <div style={{ height: 5, borderRadius: 99, background: "var(--bg-subtle)", overflow: "hidden", marginBottom: 10 }}>
                    <div style={{ height: "100%", width: `${Math.min(100, agent.success_rate || 0)}%`, background: "var(--success)" }} />
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, color: "var(--text-muted)" }}>
                    <span>Completed: <strong style={{ color: "var(--text-primary)" }}>{agent.completed_tasks}</strong></span>
                    <span>Avg: <strong style={{ color: "var(--text-primary)" }}>{((agent.avg_execution_time_ms || 0) / 1000).toFixed(1)}s</strong></span>
                  </div>
                </button>
              );
            })}
          </div>

          {selectedAgent && (
            <div className="card" style={{ position: "sticky", top: 76 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <div
                  style={{
                    width: 44,
                    height: 44,
                    borderRadius: 11,
                    background: "var(--primary-light)",
                    color: "var(--primary-accent)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 17,
                    fontWeight: 800,
                  }}
                >
                  {selectedAgent.name?.[0] || "A"}
                </div>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 700 }}>{selectedAgent.name}</h2>
                  <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>{selectedAgent.display_name} Specialist</div>
                </div>
              </div>

              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: 6 }}>
                MISSION SCOPE
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6, marginBottom: 16 }}>
                {selectedAgent.description}
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 10,
                  padding: 12,
                  borderRadius: 10,
                  background: "var(--bg-main)",
                  border: "1px solid var(--border-color)",
                  marginBottom: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Completed Tasks</div>
                  <div style={{ fontSize: 18, fontWeight: 800 }}>{selectedAgent.completed_tasks}</div>
                </div>
                <div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Reliability Score</div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "var(--success)" }}>{selectedAgent.success_rate}%</div>
                </div>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.05em", marginBottom: 8 }}>
                <Terminal size={13} /> SYSTEM PROMPT & GUARDRAILS
              </div>
              <div
                style={{
                  background: "#0F172A",
                  color: "#E2E8F0",
                  padding: 14,
                  borderRadius: 10,
                  fontFamily: "var(--font-mono)",
                  fontSize: 12,
                  lineHeight: 1.6,
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
