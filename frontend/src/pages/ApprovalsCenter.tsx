import React, { useEffect, useState, useCallback } from "react";
import { FileCheck2, CheckCircle2, XCircle, ShieldAlert } from "lucide-react";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { ErrorBanner, EmptyState, LoadingSkeleton } from "../components/ui/PageState";

export const ApprovalsCenter: React.FC = () => {
  const { success, error } = useToast();
  const { user } = useAuth();

  const [approvals, setApprovals] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(true);
  const [resolving, setResolving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadApprovals = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await api.getApprovals(undefined, filter || undefined);
      const list = Array.isArray(data) ? data : [];
      setApprovals(list);
      setSelectedId((prev) => (prev && list.some((a) => a.id === prev) ? prev : list[0]?.id || null));
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load approval requests.");
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadApprovals();
  }, [loadApprovals]);

  const selected = approvals.find((a) => a.id === selectedId) || approvals[0] || null;

  const handleResolve = async (decision: "approved" | "rejected") => {
    if (!selected) return;
    setResolving(true);
    try {
      await api.resolveApproval(selected.id, decision, comment.trim() || undefined, user?.full_name);
      success(`Approval ${decision}`, decision === "approved" ? "Autonomous workflow has resumed." : "Pipeline halted.");
      setComment("");
      await loadApprovals();
    } catch (err: any) {
      error("Action failed", err?.message || "Could not resolve approval gate.");
    } finally {
      setResolving(false);
    }
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Human Approvals Center</h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
            Review PRD & System Architecture checkpoints before autonomous code generation proceeds.
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          {["", "pending", "approved", "rejected"].map((st) => (
            <button
              key={st || "all"}
              type="button"
              className={filter === st ? "btn-primary btn-sm" : "btn-secondary btn-sm"}
              onClick={() => setFilter(st)}
            >
              {st ? st.charAt(0).toUpperCase() + st.slice(1) : "All"}
            </button>
          ))}
        </div>
      </div>

      {errorMsg && <ErrorBanner message={errorMsg} onRetry={loadApprovals} />}

      {loading ? (
        <LoadingSkeleton rows={2} />
      ) : approvals.length === 0 ? (
        <EmptyState
          icon={<FileCheck2 size={24} />}
          title="No approval requests"
          description="When a project has Human Approval Gates enabled, review checkpoints will appear here."
        />
      ) : (
        <div className="grid-main-aside">
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {approvals.map((ap) => {
              const isSelected = selected?.id === ap.id;
              return (
                <button
                  key={ap.id}
                  type="button"
                  onClick={() => setSelectedId(ap.id)}
                  className="card card-interactive"
                  style={{
                    textAlign: "left",
                    cursor: "pointer",
                    border: isSelected ? "2px solid var(--primary-accent)" : "1px solid var(--border-color)",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 8, marginBottom: 6 }}>
                    <strong style={{ fontSize: 14 }}>{ap.title}</strong>
                    <span className={`badge ${ap.status === "approved" ? "badge-success" : ap.status === "rejected" ? "badge-error" : "badge-warning"}`}>
                      {ap.status}
                    </span>
                  </div>
                  <p style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{ap.description}</p>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 8 }}>
                    Requested by {ap.requested_by} · Risk: <strong>{ap.risk_level}</strong>
                  </div>
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="card" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span className={`badge ${selected.status === "approved" ? "badge-success" : selected.status === "rejected" ? "badge-error" : "badge-warning"}`}>
                  {selected.status}
                </span>
                <span className="badge badge-neutral">Risk: {selected.risk_level}</span>
              </div>

              <h2 style={{ fontSize: 17, fontWeight: 700 }}>{selected.title}</h2>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>{selected.description}</p>

              {/* Real evidence from approval metadata_json */}
              {selected.metadata_json && Object.keys(selected.metadata_json).length > 0 && (
                <div style={{ padding: 14, borderRadius: 10, background: "var(--bg-main)", border: "1px solid var(--border-color)", fontSize: 12.5 }}>
                  <div style={{ fontWeight: 700, marginBottom: 6, display: "flex", alignItems: "center", gap: 6 }}>
                    <ShieldAlert size={14} color="var(--primary-accent)" /> Specification Evidence
                  </div>
                  {selected.metadata_json.prd_overview && (
                    <div style={{ marginBottom: 8 }}>
                      <strong>PRD Summary:</strong> {selected.metadata_json.prd_overview}
                    </div>
                  )}
                  {selected.metadata_json.architecture_overview && (
                    <div>
                      <strong>Architecture:</strong> {selected.metadata_json.architecture_overview}
                    </div>
                  )}
                </div>
              )}

              {selected.status === "pending" ? (
                <>
                  <div>
                    <label style={{ display: "block", fontSize: 12.5, fontWeight: 600, marginBottom: 5 }}>
                      Review Notes (optional)
                    </label>
                    <textarea
                      rows={3}
                      className="input-field"
                      placeholder="Add architectural feedback or sign-off notes..."
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                    />
                  </div>
                  <div style={{ display: "flex", gap: 10 }}>
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ flex: 1 }}
                      onClick={() => handleResolve("approved")}
                      disabled={resolving}
                    >
                      <CheckCircle2 size={14} /> Approve & Continue
                    </button>
                    <button
                      type="button"
                      className="btn-danger"
                      onClick={() => handleResolve("rejected")}
                      disabled={resolving}
                    >
                      <XCircle size={14} /> Reject
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ padding: 12, borderRadius: 10, background: "var(--bg-main)", fontSize: 12.5, color: "var(--text-secondary)" }}>
                  Resolved by <strong>{selected.resolved_by || "Admin"}</strong>
                  {selected.comments ? ` — "${selected.comments}"` : ""}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
