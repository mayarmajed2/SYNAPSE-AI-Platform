import React, { useEffect, useState } from "react";
import { Filter, RotateCcw, User } from "lucide-react";
import { api } from "../services/api";

export const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [selectedDetails, setSelectedDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchLogs = () => {
    setLoading(true);
    api.getAuditLogs(undefined, eventTypeFilter || undefined)
      .then((data) => {
        setLogs(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchLogs();
  }, [eventTypeFilter]);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>
          Activity & Audit Logs
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Append-only immutable record of all system events, agent delegations, and human approvals.
        </p>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
          padding: "12px 16px",
          borderRadius: "10px",
          border: "1px solid var(--border-color)",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={15} color="var(--text-secondary)" />
          <select
            className="input-field"
            style={{ width: "220px", height: "36px" }}
            value={eventTypeFilter}
            onChange={(e) => setEventTypeFilter(e.target.value)}
          >
            <option value="">All Event Types</option>
            <option value="project.created">project.created</option>
            <option value="workflow.started">workflow.started</option>
            <option value="task.completed">task.completed</option>
            <option value="test.executed">test.executed</option>
            <option value="security.scan_completed">security.scan_completed</option>
            <option value="approval.granted">approval.granted</option>
            <option value="project.delivered">project.delivered</option>
          </select>
        </div>

        <button onClick={fetchLogs} className="btn-secondary" style={{ padding: "8px" }} title="Refresh logs">
          <RotateCcw size={15} />
        </button>
      </div>

      {/* Main Table */}
      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
          <thead>
            <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
              <th style={{ padding: "12px 20px", fontWeight: 600 }}>Timestamp</th>
              <th style={{ padding: "12px 16px", fontWeight: 600 }}>Event Type</th>
              <th style={{ padding: "12px 16px", fontWeight: 600 }}>Actor</th>
              <th style={{ padding: "12px 20px", fontWeight: 600, textAlign: "right" }}>Payload Details</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                  Loading audit logs...
                </td>
              </tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                  No audit logs recorded for this criteria.
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "14px 20px", color: "var(--text-secondary)", fontSize: "12px" }}>
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span className="badge badge-primary">{log.event_type}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px", color: "var(--text-primary)", fontWeight: 500 }}>
                      <User size={14} color="var(--text-secondary)" />
                      <span>{log.actor}</span>
                    </div>
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    <button
                      onClick={() => setSelectedDetails(log.details)}
                      className="btn-secondary"
                      style={{ padding: "4px 10px", fontSize: "11px" }}
                    >
                      View JSON
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* JSON Details Inspector Dialog */}
      {selectedDetails && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setSelectedDetails(null)}
        >
          <div
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "12px",
              padding: "24px",
              width: "560px",
              maxWidth: "90%",
              maxHeight: "80vh",
              display: "flex",
              flexDirection: "column",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>Payload Inspector</h3>
              <button onClick={() => setSelectedDetails(null)} className="btn-secondary" style={{ padding: "4px 8px" }}>
                ✕
              </button>
            </div>
            <pre
              style={{
                flex: 1,
                padding: "16px",
                backgroundColor: "#0F172A",
                color: "#F8FAFC",
                borderRadius: "8px",
                overflowY: "auto",
                fontFamily: "var(--font-mono)",
                fontSize: "12px",
                lineHeight: "1.5",
              }}
            >
              {JSON.stringify(selectedDetails, null, 2)}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
