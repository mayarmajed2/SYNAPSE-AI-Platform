import React, { useEffect, useState } from "react";
import { Terminal } from "lucide-react";
import { api } from "../services/api";

export const WorkforcePage: React.FC = () => {
  const [agents, setAgents] = useState<any[]>([]);
  const [selectedAgent, setSelectedAgent] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAgents = () => {
      api.getAgents()
        .then((data) => {
          setAgents(data || []);
          if (!selectedAgent && data && data.length > 0) setSelectedAgent(data[0]);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    };

    fetchAgents();
    const interval = setInterval(fetchAgents, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>
          Autonomous Agent Workforce
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Fleet of 9 specialized AI engineers executing across the complete software development lifecycle.
        </p>
      </div>

      {/* Main Grid: Agent Cards + Agent Details Inspector */}
      <div style={{ display: "grid", gridTemplateColumns: "1.8fr 1.2fr", gap: "24px" }}>
        {/* Agent Cards Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "16px" }}>
          {loading ? (
            <div style={{ padding: "40px", color: "var(--text-secondary)" }}>Loading agents...</div>
          ) : (
            agents.map((agent) => {
              const isSelected = selectedAgent?.id === agent.id;
              return (
                <div
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className="card"
                  style={{
                    padding: "20px",
                    cursor: "pointer",
                    border: isSelected ? "2px solid var(--primary-accent)" : "1px solid var(--border-color)",
                    backgroundColor: isSelected ? "#FAFBFD" : "#FFFFFF",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "12px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          backgroundColor: "var(--primary-light)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "var(--primary-accent)",
                          fontWeight: 700,
                          fontSize: "14px",
                        }}
                      >
                        {agent.name.charAt(0)}
                      </div>
                      <div>
                        <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{agent.name}</h3>
                        <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "capitalize" }}>
                          {agent.role.replace("_", " ")}
                        </div>
                      </div>
                    </div>
                    <span className="badge badge-neutral">{agent.status}</span>
                  </div>

                  <p
                    style={{
                      fontSize: "12px",
                      color: "var(--text-secondary)",
                      lineHeight: "1.4",
                      height: "34px",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      marginBottom: "16px",
                    }}
                  >
                    {agent.description}
                  </p>

                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-color)" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)", marginBottom: "4px" }}>
                      <span>Success Reliability</span>
                      <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{agent.success_rate}%</span>
                    </div>
                    <div style={{ height: "4px", width: "100%", backgroundColor: "#E5E7EB", borderRadius: "2px", overflow: "hidden" }}>
                      <div
                        style={{
                          height: "100%",
                          width: `${agent.success_rate}%`,
                          backgroundColor: "var(--success)",
                        }}
                      />
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--text-secondary)", marginTop: "8px" }}>
                      <span>Completed: <strong>{agent.completed_tasks}</strong></span>
                      <span>Avg: <strong>{(agent.avg_execution_time_ms / 1000).toFixed(1)}s</strong></span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Agent Inspector Panel */}
        {selectedAgent ? (
          <div className="card" style={{ padding: "28px", height: "fit-content", position: "sticky", top: "84px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "14px", marginBottom: "16px" }}>
              <div
                style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "10px",
                  backgroundColor: "var(--primary-light)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  color: "var(--primary-accent)",
                  fontWeight: 700,
                  fontSize: "18px",
                }}
              >
                {selectedAgent.name.charAt(0)}
              </div>
              <div>
                <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>{selectedAgent.name}</h2>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", textTransform: "capitalize" }}>
                  {selectedAgent.role.replace("_", " ")} Specialist
                </div>
              </div>
            </div>

            <div style={{ marginBottom: "20px" }}>
              <h4 style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "6px" }}>
                Mission Scope
              </h4>
              <p style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: "1.5" }}>
                {selectedAgent.description}
              </p>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
                padding: "16px",
                backgroundColor: "#F9FAFB",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                marginBottom: "20px",
              }}
            >
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Completed Tasks</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)" }}>
                  {selectedAgent.completed_tasks}
                </div>
              </div>
              <div>
                <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>Reliability Score</div>
                <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--success)" }}>
                  {selectedAgent.success_rate}%
                </div>
              </div>
            </div>

            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "8px" }}>
                <Terminal size={14} color="var(--primary-accent)" />
                <h4 style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase", color: "var(--text-secondary)" }}>
                  System Prompt & Guardrails
                </h4>
              </div>
              <div
                style={{
                  padding: "14px",
                  borderRadius: "8px",
                  backgroundColor: "#1E293B",
                  color: "#E2E8F0",
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  lineHeight: "1.5",
                  maxHeight: "260px",
                  overflowY: "auto",
                }}
              >
                {selectedAgent.system_prompt}
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};
