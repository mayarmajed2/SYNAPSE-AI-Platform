import React, { useEffect, useState } from "react";
import {
  FileCheck2,
  CheckCircle,
  XCircle,
  ShieldAlert,
} from "lucide-react";
import { api } from "../services/api";

export const ApprovalsCenterPage: React.FC = () => {
  const [approvals, setApprovals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [selectedApproval, setSelectedApproval] = useState<any | null>(null);
  const [comment, setComment] = useState("");
  const [resolving, setResolving] = useState(false);

  const fetchApprovals = () => {
    setLoading(true);
    const filter = statusFilter === "all" ? undefined : statusFilter;
    api.getApprovals(undefined, filter)
      .then((data) => {
        setApprovals(data || []);
        if (data && data.length > 0 && !selectedApproval) {
          setSelectedApproval(data[0]);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchApprovals();
  }, [statusFilter]);

  const handleResolve = async (decision: "approved" | "rejected") => {
    if (!selectedApproval) return;
    setResolving(true);
    try {
      await api.resolveApproval(
        selectedApproval.id,
        decision,
        comment.trim() || `Resolution submitted as ${decision} by Principal Engineer.`,
      );
      setComment("");
      fetchApprovals();
      setSelectedApproval(null);
    } catch (err: any) {
      alert("Failed to resolve approval: " + err.message);
    } finally {
      setResolving(false);
    }
  };

  const getRiskBadge = (level: string) => {
    switch (level?.toLowerCase()) {
      case "critical":
        return "badge-error";
      case "high":
        return "badge-error";
      case "medium":
        return "badge-warning";
      default:
        return "badge-primary";
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>
            Human-in-the-Loop Governance & Approvals Center
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Authoritative human sign-off gates for architectural decisions, major code revisions, security exceptions, and production releases.
          </p>
        </div>

        {/* Filter Pills */}
        <div style={{ display: "flex", gap: "6px" }}>
          {["all", "pending", "approved", "rejected"].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: statusFilter === s ? 600 : 500,
                backgroundColor: statusFilter === s ? "var(--primary-accent)" : "#FFFFFF",
                color: statusFilter === s ? "#FFFFFF" : "var(--text-secondary)",
                border: "1px solid var(--border-color)",
                cursor: "pointer",
                textTransform: "capitalize",
              }}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Main Split: Approvals List + Inspection Panel */}
      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px" }}>
        {/* Approvals List */}
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {loading ? (
            <div style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
              Loading governance gates...
            </div>
          ) : approvals.length === 0 ? (
            <div className="card" style={{ padding: "50px 20px", textAlign: "center" }}>
              <FileCheck2 size={40} color="var(--text-secondary)" style={{ margin: "0 auto 12px" }} />
              <h3 style={{ fontSize: "15px", fontWeight: 600, color: "var(--text-primary)" }}>
                No {statusFilter !== "all" ? statusFilter : ""} approval requests
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                All autonomous agent workflows are proceeding without pending human gates.
              </p>
            </div>
          ) : (
            approvals.map((app) => {
              const isSelected = selectedApproval?.id === app.id;
              return (
                <div
                  key={app.id}
                  onClick={() => setSelectedApproval(app)}
                  className="card"
                  style={{
                    padding: "18px 20px",
                    cursor: "pointer",
                    border: isSelected ? "2px solid var(--primary-accent)" : "1px solid var(--border-color)",
                    backgroundColor: isSelected ? "#FAFBFD" : "#FFFFFF",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span className={`badge ${getRiskBadge(app.risk_level)}`}>
                        {app.risk_level} risk
                      </span>
                      <span className={`badge badge-${app.status === "approved" ? "success" : app.status === "pending" ? "warning" : "error"}`}>
                        {app.status}
                      </span>
                    </div>
                    <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                      {app.title}
                    </h3>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)", maxWidth: "480px" }}>
                      {app.description}
                    </p>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                      Requested by: <strong>{app.requested_by}</strong> • {new Date(app.created_at).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Selected Approval Inspector */}
        {selectedApproval ? (
          <div className="card" style={{ padding: "26px", height: "fit-content", position: "sticky", top: "84px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span className={`badge ${getRiskBadge(selectedApproval.risk_level)}`}>
                {selectedApproval.risk_level} Risk Level
              </span>
              <span className={`badge badge-${selectedApproval.status === "approved" ? "success" : selectedApproval.status === "pending" ? "warning" : "error"}`}>
                {selectedApproval.status}
              </span>
            </div>

            <h2 style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              {selectedApproval.title}
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.5", marginBottom: "16px" }}>
              {selectedApproval.description}
            </p>

            {/* Agent Context & Recommendation */}
            <div
              style={{
                padding: "14px",
                borderRadius: "8px",
                backgroundColor: "#F9FAFB",
                border: "1px solid var(--border-color)",
                marginBottom: "20px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "6px", marginBottom: "6px" }}>
                <ShieldAlert size={15} color="var(--primary-accent)" />
                <span style={{ fontSize: "12px", fontWeight: 700, color: "var(--text-primary)" }}>
                  Agent Recommendation & Evidence
                </span>
              </div>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                The Supervisor and Architect have finalized specification artifacts. Verification of scope and architectural trade-offs is advised before backend and frontend developers synthesize code.
              </p>
            </div>

            {/* Resolution Form (if pending) */}
            {selectedApproval.status === "pending" ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <label style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                  Resolution Notes / Instructions (Optional):
                </label>
                <textarea
                  className="input-field"
                  rows={3}
                  placeholder="Enter comments, conditions, or reason for decision..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginTop: "4px" }}>
                  <button
                    onClick={() => handleResolve("rejected")}
                    disabled={resolving}
                    className="btn-danger"
                    style={{ padding: "10px", justifyContent: "center" }}
                  >
                    <XCircle size={15} />
                    <span>Reject</span>
                  </button>
                  <button
                    onClick={() => handleResolve("approved")}
                    disabled={resolving}
                    className="btn-primary"
                    style={{ padding: "10px", justifyContent: "center" }}
                  >
                    <CheckCircle size={15} />
                    <span>Approve & Proceed</span>
                  </button>
                </div>
              </div>
            ) : (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "6px",
                  backgroundColor: selectedApproval.status === "approved" ? "#F0FDF4" : "#FEF2F2",
                  border: selectedApproval.status === "approved" ? "1px solid #BBF7D0" : "1px solid #FECACA",
                  fontSize: "12px",
                }}
              >
                <div style={{ fontWeight: 600, color: selectedApproval.status === "approved" ? "var(--success)" : "var(--error)" }}>
                  Resolved as {selectedApproval.status}
                </div>
                {selectedApproval.comments && (
                  <div style={{ color: "var(--text-secondary)", marginTop: "4px" }}>
                    Notes: {selectedApproval.comments}
                  </div>
                )}
                {selectedApproval.resolved_at && (
                  <div style={{ color: "var(--text-secondary)", fontSize: "11px", marginTop: "4px" }}>
                    Resolved at: {new Date(selectedApproval.resolved_at).toLocaleString()} by {selectedApproval.resolved_by || "User"}
                  </div>
                )}
              </div>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
};
