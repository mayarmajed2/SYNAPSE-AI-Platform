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
  Code2,
  FlaskConical,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  GitBranch,
  PlusCircle,
} from "lucide-react";
import { api } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
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

  // Interactive pan & zoom state
  const [zoom, setZoom] = useState(0.85);
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
      setErrorMsg(err?.message || "Failed to load workflow graph.");
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
        if (target) {
          return loadWorkflow(target);
        }
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
      success(`Workflow ${action} requested`, "Live status will stream over WebSocket.");
      await loadWorkflow(selectedProjectId);
    } catch (err: any) {
      error("Workflow action failed", err?.message || "Please try again.");
    } finally {
      setActionBusy(false);
    }
  };

  const handleResolveApproval = async (approvalId: string, decision: "approved" | "rejected") => {
    setActionBusy(true);
    try {
      await api.resolveApproval(approvalId, decision, `${decision} from Workflow Studio`, user?.full_name);
      success(`Gate ${decision}`, decision === "approved" ? "Autonomous pipeline resumed." : "Pipeline halted.");
      await loadWorkflow(selectedProjectId);
    } catch (err: any) {
      error("Could not resolve approval", err?.message);
    } finally {
      setActionBusy(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={2} />;

  if (!loading && projects.length === 0) {
    return (
      <EmptyState
        icon={<GitBranch size={24} />}
        title="No workflows available yet"
        description="Create a software project first to generate and visualize its 10-stage autonomous multi-agent graph."
        action={
          <Link to="/app/projects/new" className="btn-primary">
            <PlusCircle size={14} /> Launch New Project
          </Link>
        }
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

  const statusColors: Record<string, { bg: string; border: string; glow: string; badge: string }> = {
    completed: { bg: "rgba(6, 78, 59, 0.38)", border: "rgba(16, 185, 129, 0.65)", glow: "0 0 20px rgba(16, 185, 129, 0.18)", badge: "badge-success" },
    running: { bg: "rgba(30, 58, 138, 0.48)", border: "rgba(59, 130, 246, 0.85)", glow: "0 0 26px rgba(59, 130, 246, 0.35)", badge: "badge-cyan" },
    failed: { bg: "rgba(136, 19, 55, 0.42)", border: "rgba(244, 63, 94, 0.75)", glow: "0 0 22px rgba(244, 63, 94, 0.25)", badge: "badge-error" },
    waiting_approval: { bg: "rgba(120, 53, 15, 0.42)", border: "rgba(245, 158, 11, 0.75)", glow: "0 0 22px rgba(245, 158, 11, 0.25)", badge: "badge-warning" },
    pending: { bg: "rgba(15, 23, 42, 0.86)", border: "rgba(148, 163, 184, 0.25)", glow: "var(--shadow-sm)", badge: "badge-neutral" },
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {errorMsg && <ErrorBanner message={errorMsg} onRetry={() => loadWorkflow(selectedProjectId)} />}

      {/* Toolbar */}
      <div
        className="card"
        style={{
          padding: "14px 18px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 800, letterSpacing: "-0.02em" }}>Workflow Studio</h1>
            <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>Interactive Multi-Agent Graph Engine (Drag canvas to pan)</div>
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
            <button type="button" className="btn-primary btn-sm" onClick={() => runAction("resume")} disabled={actionBusy}>
              <Play size={13} /> Resume
            </button>
          ) : (
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => runAction("start")}
              disabled={actionBusy || workflow?.status === "completed"}
            >
              <Play size={13} /> {workflow?.status === "completed" ? "Execution Completed" : "Start Execution"}
            </button>
          )}
          <button type="button" className="btn-secondary btn-sm" onClick={() => loadWorkflow(selectedProjectId)} aria-label="Refresh graph">
            <RotateCcw size={13} />
          </button>
        </div>
      </div>

      {/* Inline Human Approval Banner */}
      {pendingApproval && (
        <div
          className="card"
          style={{
            padding: "14px 18px",
            background: "var(--warning-light)",
            border: "1px solid #FCD34D",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 12,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <ShieldCheck size={20} color="var(--warning)" />
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700 }}>{pendingApproval.title}</div>
              <div style={{ fontSize: 12, color: "var(--text-secondary)" }}>{pendingApproval.description}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              className="btn-primary btn-sm"
              onClick={() => handleResolveApproval(pendingApproval.id, "approved")}
              disabled={actionBusy}
            >
              <CheckCircle2 size={13} /> Approve & Continue
            </button>
            <button
              type="button"
              className="btn-danger btn-sm"
              onClick={() => handleResolveApproval(pendingApproval.id, "rejected")}
              disabled={actionBusy}
            >
              <XCircle size={13} /> Reject
            </button>
          </div>
        </div>
      )}

      {/* Interactive Canvas + Inspector */}
      <div className="grid-main-aside">
        <div
          className="card"
          style={{
            padding: 0,
            height: 540,
            position: "relative",
            overflow: "hidden",
            backgroundColor: "#040814",
            backgroundImage:
              "radial-gradient(rgba(96, 165, 250, 0.22) 1px, transparent 1px), radial-gradient(ellipse 60% 50% at 30% 30%, rgba(59, 130, 246, 0.12), transparent 70%)",
            backgroundSize: "24px 24px, 100% 100%",
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
          onMouseUp={() => {
            dragRef.current.dragging = false;
          }}
          onMouseLeave={() => {
            dragRef.current.dragging = false;
          }}
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
            {/* Dynamic Animated SVG Edges from workflow.edges */}
            <svg width={2200} height={800} style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
              <defs>
                <linearGradient id="synapse-edge-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#3B82F6" />
                  <stop offset="50%" stopColor="#8B5CF6" />
                  <stop offset="100%" stopColor="#06B6D4" />
                </linearGradient>
                <marker id="synapse-arrow" markerWidth="8" markerHeight="8" refX="7" refY="4" orient="auto">
                  <path d="M0,0 L8,4 L0,8 Z" fill="#22D3EE" />
                </marker>
              </defs>
              {edges.map((edge: any) => {
                const srcKey = edge.source_node_id || edge.source_node_key;
                const tgtKey = edge.target_node_id || edge.target_node_key;
                const src = nodeMap.get(srcKey);
                const tgt = nodeMap.get(tgtKey);
                if (!src || !tgt) return null;
                const x1 = (src.position_x || 0) + 210;
                const y1 = (src.position_y || 0) + 46;
                const x2 = (tgt.position_x || 0);
                const y2 = (tgt.position_y || 0) + 46;
                const isLive = src.status === "completed" || src.status === "running";
                return (
                  <g key={edge.id || `${srcKey}-${tgtKey}`}>
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={isLive ? "url(#synapse-edge-grad)" : "rgba(148, 163, 184, 0.3)"}
                      strokeWidth={isLive ? 2.5 : 1.5}
                      className={isLive ? "edge-animated" : undefined}
                      markerEnd="url(#synapse-arrow)"
                    />
                  </g>
                );
              })}
            </svg>

            {/* Workflow Nodes */}
            {nodes.map((node: any) => {
              const style = statusColors[node.status] || statusColors.pending;
              const isSelected = selectedNode?.id === node.id;
              return (
                <button
                  key={node.id}
                  type="button"
                  onClick={() => setSelectedNodeId(node.id)}
                  style={{
                    position: "absolute",
                    left: node.position_x || 0,
                    top: node.position_y || 0,
                    width: 210,
                    padding: "12px 14px",
                    borderRadius: 12,
                    background: style.bg,
                    border: isSelected ? "2px solid var(--primary-accent)" : `1.5px solid ${style.border}`,
                    boxShadow: isSelected ? "0 0 0 4px var(--primary-ring)" : "var(--shadow-sm)",
                    textAlign: "left",
                    cursor: "pointer",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 6, marginBottom: 6 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
                      {(node.agent_role || "").replace(/_/g, " ")}
                    </span>
                    <span className={`badge ${style.badge}`} style={{ fontSize: 10, padding: "1px 6px" }}>
                      {node.status}
                    </span>
                  </div>
                  <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--text-primary)" }}>{node.title || node.label}</div>
                  <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                    {node.duration_ms ? `${(node.duration_ms / 1000).toFixed(2)}s` : "Queued"}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Zoom Controls */}
          <div
            style={{
              position: "absolute",
              left: 14,
              bottom: 14,
              display: "flex",
              gap: 6,
              background: "rgba(15, 23, 42, 0.88)",
              backdropFilter: "blur(10px)",
              padding: 6,
              borderRadius: 10,
              border: "1px solid var(--border-color)",
              boxShadow: "var(--shadow-md)",
            }}
          >
            <button type="button" className="btn-ghost btn-sm" onClick={() => setZoom((z) => Math.min(1.4, z + 0.1))} aria-label="Zoom in">
              <ZoomIn size={14} />
            </button>
            <button type="button" className="btn-ghost btn-sm" onClick={() => setZoom((z) => Math.max(0.45, z - 0.1))} aria-label="Zoom out">
              <ZoomOut size={14} />
            </button>
            <button
              type="button"
              className="btn-ghost btn-sm"
              onClick={() => {
                setZoom(0.75);
                setPan({ x: 20, y: 20 });
              }}
              aria-label="Reset view"
            >
              <Maximize2 size={14} />
            </button>
          </div>

          <div
            style={{
              position: "absolute",
              right: 14,
              bottom: 14,
              background: "rgba(15, 23, 42, 0.88)",
              backdropFilter: "blur(10px)",
              padding: "8px 12px",
              borderRadius: 10,
              border: "1px solid var(--border-color)",
              fontSize: 12,
              boxShadow: "var(--shadow-md)",
            }}
          >
            <div>Status: <strong style={{ textTransform: "capitalize" }}>{workflow?.status || "pending"}</strong></div>
            <div style={{ color: "var(--text-muted)" }}>Step: <strong style={{ color: "var(--primary-accent)" }}>{workflow?.current_step || "Queued"}</strong></div>
          </div>
        </div>

        {/* Node Inspector */}
        <div className="card">
          {selectedNode ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div>
                <span className={`badge ${(statusColors[selectedNode.status] || statusColors.pending).badge}`}>
                  {selectedNode.status}
                </span>
                <h2 style={{ fontSize: 17, fontWeight: 700, marginTop: 8 }}>{selectedNode.title || selectedNode.label}</h2>
                <div style={{ fontSize: 12.5, color: "var(--text-muted)" }}>
                  Role: {(selectedNode.agent_role || "").replace(/_/g, " ")}
                </div>
              </div>

              <div style={{ padding: 12, borderRadius: 10, background: "var(--bg-main)", border: "1px solid var(--border-color)" }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)" }}>EXECUTION DURATION</div>
                <div style={{ fontSize: 18, fontWeight: 800, marginTop: 2 }}>
                  {selectedNode.duration_ms ? `${(selectedNode.duration_ms / 1000).toFixed(2)}s` : "Not executed yet"}
                </div>
              </div>

              <div style={{ fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                This stage executes autonomously, commits its generated artifacts to the project repository,
                and logs a traceable task and audit record.
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, paddingTop: 8, borderTop: "1px solid var(--border-color)" }}>
                <Link to={`/app/code?project=${selectedProjectId}`} className="btn-secondary" style={{ width: "100%" }}>
                  <Code2 size={14} /> View Generated Code
                </Link>
                <Link to={`/app/testing?project=${selectedProjectId}`} className="btn-secondary" style={{ width: "100%" }}>
                  <FlaskConical size={14} /> Inspect QA Assertions
                </Link>
                <Link to={`/app/security?project=${selectedProjectId}`} className="btn-secondary" style={{ width: "100%" }}>
                  <ShieldCheck size={14} /> View Security Audit
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ fontSize: 13, color: "var(--text-muted)" }}>Select a node on the canvas to inspect its details.</div>
          )}
        </div>
      </div>
    </div>
  );
};
