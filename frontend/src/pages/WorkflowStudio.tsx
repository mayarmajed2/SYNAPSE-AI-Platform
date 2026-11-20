import React, { useEffect, useState, useCallback, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import {
  Play,
  Pause,
  RotateCcw,
  Square,
  ZoomIn,
  ZoomOut,
  Maximize2,
  ArrowUpRight,
  GitBranch,
  Plus,
} from "lucide-react";
import { api } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import { AgentGlyph } from "../components/ui/AgentGlyph";
import { ErrorBanner, EmptyState, LoadingSkeleton } from "../components/ui/PageState";

export const WorkflowStudio: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error } = useToast();
  const { user } = useAuth();

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(searchParams.get("project") || "");
  const [workflow, setWorkflow] = useState<any>(null);
  const [approvals, setApprovals] = useState<any[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const [zoom, setZoom] = useState(0.84);
  const [pan, setPan] = useState({ x: 24, y: 24 });
  const dragRef = useRef<{ dragging: boolean; startX: number; startY: number; origX: number; origY: number }>({
    dragging: false,
    startX: 0,
    startY: 0,
    origX: 0,
    origY: 0,
  });

  const loadWorkflow = useCallback(async (projId: string) => {
    if (!projId) return;
    try {
      const [wf, ap] = await Promise.all([
        api.getProjectWorkflow(projId),
        api.getApprovals(projId, "pending").catch(() => []),
      ]);
      setWorkflow(wf);
      setApprovals(Array.isArray(ap) ? ap : []);
      setSelectedNodeId((prev) => {
        const nodes = wf?.nodes || [];
        if (prev && nodes.some((n: any) => n.id === prev)) return prev;
        return nodes[0]?.id || null;
      });
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load workflow.");
    }
  }, []);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setErrorMsg("");
    api
      .getProjects()
      .then((list) => {
        if (!active) return;
        const arr = Array.isArray(list) ? list : [];
        setProjects(arr);
        const target = searchParams.get("project") || arr[0]?.id || "";
        setSelectedProjectId(target);
        if (target) return loadWorkflow(target);
      })
      .catch((err) => {
        if (active) setErrorMsg(err?.message || "Failed to load projects.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [loadWorkflow]);

  useWebSocket(selectedProjectId || undefined, () => {
    if (selectedProjectId) loadWorkflow(selectedProjectId);
  });

  const handleProjectChange = (projId: string) => {
    setSelectedProjectId(projId);
    setSearchParams({ project: projId });
    loadWorkflow(projId);
  };

  const runAction = async (action: "start" | "pause" | "resume" | "cancel") => {
    if (!workflow?.id) return;
    setActionBusy(true);
    try {
      if (action === "start") await api.startWorkflow(workflow.id);
      if (action === "pause") await api.pauseWorkflow(workflow.id);
      if (action === "resume") await api.resumeWorkflow(workflow.id);
      if (action === "cancel") await api.cancelWorkflow(workflow.id);
      success(`Workflow ${action}`, "Live graph updated.");
      await loadWorkflow(selectedProjectId);
    } catch (err: any) {
      error("Workflow action failed", err?.message);
    } finally {
      setActionBusy(false);
    }
  };

  const handleResolveApproval = async (approvalId: string, decision: "approved" | "rejected") => {
    setActionBusy(true);
    try {
      await api.resolveApproval(approvalId, decision, `${decision} from Workflow Studio`, user?.full_name);
      success(`Gate ${decision}`, decision === "approved" ? "Pipeline resumed." : "Pipeline halted.");
      await loadWorkflow(selectedProjectId);
    } catch (err: any) {
      error("Could not resolve approval", err?.message);
    } finally {
      setActionBusy(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={2} />;

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<GitBranch size={22} />}
        title="No workflows yet"
        description="Create a software project to visualize its 10-stage multi-agent graph."
        action={<Link to="/app/projects/new" className="btn-accent"><Plus size={14} /> New Project</Link>}
      />
    );
  }

  const nodes: any[] = workflow?.nodes || [];
  const edges: any[] = workflow?.edges || [];
  const nodeMap = new Map<string, any>();
  nodes.forEach((n) => {
    if (n.node_key) nodeMap.set(n.node_key, n);
    if (n.id) nodeMap.set(n.id, n);
  });
  const selectedNode = nodes.find((n) => n.id === selectedNodeId) || nodes[0] || null;
  const pendingApproval = approvals[0] || null;

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 18 }}>
      {errorMsg && <ErrorBanner message={errorMsg} onRetry={() => loadWorkflow(selectedProjectId)} />}

      <div className="card" style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 19, fontWeight: 800 }}>Workflow Studio</h1>
            <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Interactive multi-agent graph · Drag to pan</div>
          </div>
          <select
            className="input-field"
            style={{ width: 220 }}
            value={selectedProjectId}
            onChange={(e) => handleProjectChange(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {workflow?.status === "running" ? (
            <>
              <button type="button" className="btn-secondary btn-sm" onClick={() => runAction("pause")} disabled={actionBusy}>
                <Pause size={13} /> Pause
              </button>
              <button type="button" className="btn-danger btn-sm" onClick={() => runAction("cancel")} disabled={actionBusy}>
                <Square size={13} /> Cancel
              </button>
            </>
          ) : workflow?.status === "paused" ? (
            <button type="button" className="btn-accent btn-sm" onClick={() => runAction("resume")} disabled={actionBusy}>
              <Play size={13} /> Resume
            </button>
          ) : (
            <button
              type="button"
              className="btn-accent btn-sm"
              onClick={() => runAction("start")}
              disabled={actionBusy || workflow?.status === "completed"}
            >
              <Play size={13} /> {workflow?.status === "completed" ? "Completed" : "Run Pipeline"}
            </button>
          )}
          <button type="button" className="btn-secondary btn-sm" onClick={() => loadWorkflow(selectedProjectId)} aria-label="Refresh">
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {pendingApproval && (
        <div className="ink-panel" style={{ padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary-accent)" }}>Approval Gate Pending</div>
            <div style={{ fontSize: 14, fontWeight: 600, marginTop: 2 }}>{pendingApproval.title}</div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button type="button" className="btn-accent btn-sm" onClick={() => handleResolveApproval(pendingApproval.id, "approved")} disabled={actionBusy}>
              Approve &amp; Continue
            </button>
            <button type="button" className="btn-danger btn-sm" onClick={() => handleResolveApproval(pendingApproval.id, "rejected")} disabled={actionBusy}>
              Reject
            </button>
          </div>
        </div>
      )}

      <div className="grid-main-aside">
        <div
          className="card"
          style={{
            padding: 0,
            height: 540,
            position: "relative",
            overflow: "hidden",
            backgroundColor: "#08090C",
            backgroundImage: "radial-gradient(rgba(255, 255, 255, 0.12) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            cursor: "grab",
            userSelect: "none",
          }}
          onMouseDown={(e) => {
            if ((e.target as HTMLElement).closest("button")) return;
            dragRef.current = { dragging: true, startX: e.clientX, startY: e.clientY, origX: pan.x, origY: pan.y };
          }}
          onMouseMove={(e) => {
            if (!dragRef.current.dragging) return;
            setPan({
              x: dragRef.current.origX + (e.clientX - dragRef.current.startX),
              y: dragRef.current.origY + (e.clientY - dragRef.current.startY),
            });
          }}
          onMouseUp={() => { dragRef.current.dragging = false; }}
          onMouseLeave={() => { dragRef.current.dragging = false; }}
        >
          <div
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: "0 0",
              position: "relative",
              width: 2200,
              height: 800,
            }}
          >
            <svg width={2200} height={800} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              <defs>
                <marker id="synapse-arrow-mint" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                  <path d="M0,0 L7,3.5 L0,7 Z" fill="#7C5CFF" />
                </marker>
                <marker id="synapse-arrow-muted" markerWidth="7" markerHeight="7" refX="6" refY="3.5" orient="auto">
                  <path d="M0,0 L7,3.5 L0,7 Z" fill="rgba(255,255,255,0.35)" />
                </marker>
              </defs>
              {edges.map((edge: any) => {
                const srcKey = edge.source_node_id || edge.source_node_key;
                const tgtKey = edge.target_node_id || edge.target_node_key;
                const src = nodeMap.get(srcKey);
                const tgt = nodeMap.get(tgtKey);
                if (!src || !tgt) return null;
                const x1 = (src.position_x || 0) + 216;
                const y1 = (src.position_y || 0) + 46;
                const x2 = (tgt.position_x || 0);
                const y2 = (tgt.position_y || 0) + 46;
                const isActive = src.status === "running" || tgt.status === "running";
                const isDone = src.status === "completed";
                return (
                  <line
                    key={edge.id || `${srcKey}-${tgtKey}`}
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isActive || isDone ? "#7C5CFF" : "rgba(255,255,255,0.22)"}
                    strokeWidth={isActive ? 2.4 : isDone ? 1.8 : 1.3}
                    className={isActive ? "edge-animated" : undefined}
                    markerEnd={isActive || isDone ? "url(#synapse-arrow-mint)" : "url(#synapse-arrow-muted)"}
                  />
                );
              })}
            </svg>

            {nodes.map((node: any) => {
              const isSelected = selectedNode?.id === node.id;
              const isRunning = node.status === "running";
              const isCompleted = node.status === "completed";
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{
                    position: "absolute",
                    left: node.position_x || 0,
                    top: node.position_y || 0,
                    width: 216,
                    padding: "13px 15px",
                    borderRadius: 14,
                    background: isSelected ? "#181E29" : "#12151C",
                    color: "#FFFFFF",
                    border: isSelected
                      ? "1.5px solid #7C5CFF"
                      : isCompleted
                      ? "1px solid rgba(16, 229, 147, 0.35)"
                      : "1px solid rgba(255, 255, 255, 0.12)",
                    boxShadow: isSelected ? "0 8px 28px rgba(16, 229, 147, 0.18)" : "0 6px 18px rgba(0, 0, 0, 0.45)",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <AgentGlyph role={node.agent_role} size={18} active={isRunning || isSelected || isCompleted} />
                    <span className={`badge ${isRunning || isCompleted ? "badge-success" : "badge-neutral"}`} style={{ fontSize: 10 }}>
                      {node.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, lineHeight: 1.25 }}>{node.title || node.label}</div>
                  <div className="tabular-nums" style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 5 }}>
                    {node.duration_ms ? `${(node.duration_ms / 1000).toFixed(2)}s` : "Queued"}
                  </div>
                </button>
              );
            })}
          </div>

          <div style={{ position: "absolute", left: 14, bottom: 14, display: "flex", gap: 4, background: "#14171F", padding: 5, borderRadius: 10, border: "1px solid var(--border-color)" }}>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))} aria-label="Zoom in"><ZoomIn size={14} /></button>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setZoom((z) => Math.max(0.45, z - 0.1))} aria-label="Zoom out"><ZoomOut size={14} /></button>
            <button type="button" className="btn-ghost btn-sm" onClick={() => { setZoom(0.75); setPan({ x: 20, y: 20 }); }} aria-label="Reset view"><Maximize2 size={14} /></button>
          </div>

          <div style={{ position: "absolute", right: 14, bottom: 14, background: "#14171F", padding: "8px 14px", borderRadius: 10, border: "1px solid var(--border-color)", fontSize: 12 }}>
            Status: <strong style={{ color: "var(--primary-accent)", textTransform: "capitalize" }}>{workflow?.status || "pending"}</strong> · {workflow?.current_step || "Queued"}
          </div>
        </div>

        <div className="card">
          {selectedNode ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-muted)" }}>Stage Inspector</span>
                <span className={`badge ${selectedNode.status === "completed" || selectedNode.status === "running" ? "badge-success" : "badge-neutral"}`}>
                  {selectedNode.status}
                </span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{ width: 42, height: 42, borderRadius: 12, background: "var(--primary-light)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <AgentGlyph role={selectedNode.agent_role} size={22} active />
                </div>
                <div>
                  <h2 style={{ fontSize: 17, fontWeight: 700 }}>{selectedNode.title || selectedNode.label}</h2>
                  <div style={{ fontSize: 12.5, color: "var(--text-muted)", textTransform: "capitalize" }}>
                    {(selectedNode.agent_role || "").replace(/_/g, " ")}
                  </div>
                </div>
              </div>

              <div style={{ padding: 14, borderRadius: 12, background: "#161922", border: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>Execution Duration</div>
                <div className="tabular-nums" style={{ fontSize: 22, fontWeight: 800, marginTop: 2 }}>
                  {selectedNode.duration_ms ? `${(selectedNode.duration_ms / 1000).toFixed(2)}s` : "—"}
                </div>
              </div>

              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                Autonomous stage commits versioned artifacts to the project repository and logs telemetry to the audit trail.
              </p>

              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <Link to={`/app/code?project=${selectedProjectId}`} className="btn-secondary" style={{ width: "100%", justifyContent: "space-between" }}>
                  <span>View Generated Code</span> <ArrowUpRight size={14} />
                </Link>
                <Link to={`/app/testing?project=${selectedProjectId}`} className="btn-secondary" style={{ width: "100%", justifyContent: "space-between" }}>
                  <span>QA Assertions</span> <ArrowUpRight size={14} />
                </Link>
                <Link to={`/app/security?project=${selectedProjectId}`} className="btn-secondary" style={{ width: "100%", justifyContent: "space-between" }}>
                  <span>Security Audit</span> <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Select a node to inspect its details.</div>
          )}
        </div>
      </div>
    </div>
  );
};
