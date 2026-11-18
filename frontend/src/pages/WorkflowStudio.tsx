import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Play,
  Pause,
  RotateCcw,
  AlertTriangle,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Code2,
  FileCheck,
  Square,
} from "lucide-react";
import { api } from "../services/api";
import { useWebSocket } from "../hooks/useWebSocket";

interface NodeItem {
  id: string;
  node_key: string;
  agent_role: string;
  title: string;
  status: "pending" | "running" | "completed" | "failed" | "waiting_approval" | "skipped";
  position_x: number;
  position_y: number;
  duration_ms: number;
  error_message?: string;
}

export const WorkflowStudioPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectIdParam = searchParams.get("projectId");

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectIdParam || "");
  const [workflow, setWorkflow] = useState<any | null>(null);
  const [selectedNode, setSelectedNode] = useState<NodeItem | null>(null);
  const [pendingApproval, setPendingApproval] = useState<any | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [pulse, setPulse] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setPulse(p => !p), 800);
    return () => clearInterval(interval);
  }, []);

  // Load available projects
  useEffect(() => {
    api.getProjects().then((projs) => {
      setProjects(projs || []);
      if (!selectedProjectId && projs && projs.length > 0) {
        setSelectedProjectId(projs[0].id);
      }
    });
  }, []);

  // Fetch workflow when selected project changes
  const loadWorkflow = () => {
    if (!selectedProjectId) return;
    api.getProjectWorkflow(selectedProjectId)
      .then((wf) => {
        setWorkflow(wf);
        if (wf && wf.nodes && wf.nodes.length > 0) {
          setSelectedNode(wf.nodes[0]);
        }
      })
      .catch(() => {});

    // Check if there are pending approvals for this project
    api.getApprovals(selectedProjectId, "pending")
      .then((apps) => {
        if (apps && apps.length > 0) setPendingApproval(apps[0]);
        else setPendingApproval(null);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadWorkflow();
  }, [selectedProjectId]);

  // Real-time WebSocket live updates
  useWebSocket(selectedProjectId, (event) => {
    if (
      event.event.startsWith("workflow.") ||
      event.event.startsWith("agent.") ||
      event.event.startsWith("task.") ||
      event.event.startsWith("approval.")
    ) {
      loadWorkflow();
    }
  });

  const handleStart = async () => {
    if (!workflow) return;
    try {
      await api.startWorkflow(workflow.id);
      loadWorkflow();
    } catch (err: any) {
      alert("Error starting workflow: " + err.message);
    }
  };

  const handlePause = async () => {
    if (!workflow) return;
    try {
      await api.pauseWorkflow(workflow.id);
      loadWorkflow();
    } catch (err: any) {
      alert("Error pausing workflow: " + err.message);
    }
  };

  const handleResume = async () => {
    if (!workflow) return;
    try {
      await api.resumeWorkflow(workflow.id);
      loadWorkflow();
    } catch (err: any) {
      alert("Error resuming workflow: " + err.message);
    }
  };

  const handleCancel = async () => {
    if (!workflow) return;
    if (window.confirm("Cancel active workflow execution?")) {
      try {
        await api.cancelWorkflow(workflow.id);
        loadWorkflow();
      } catch (err: any) {
        alert("Error cancelling workflow: " + err.message);
      }
    }
  };

  const handleResolveApproval = async (decision: "approved" | "rejected") => {
    if (!pendingApproval) return;
    try {
      await api.resolveApproval(pendingApproval.id, decision, "Resolved via Workflow Studio gate");
      setPendingApproval(null);
      loadWorkflow();
    } catch (err: any) {
      alert("Error resolving approval: " + err.message);
    }
  };

  const getNodeColor = (status: string) => {
    switch (status) {
      case "completed":
        return { border: "#10B981", bg: "#F0FDF4", badge: "badge-success" };
      case "running":
        return { border: "#315EFB", bg: "#EFF6FF", badge: "badge-primary" };
      case "failed":
        return { border: "#EF4444", bg: "#FEF2F2", badge: "badge-error" };
      case "waiting_approval":
        return { border: "#F59E0B", bg: "#FFFBEB", badge: "badge-warning" };
      default:
        return { border: "var(--border-color)", bg: "#FFFFFF", badge: "badge-neutral" };
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", gap: "16px" }}>
      {/* Studio Header Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
          padding: "12px 20px",
          borderRadius: "10px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div>
            <h1 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
              Workflow Studio
            </h1>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
              Interactive Multi-Agent Graph Engine
            </div>
          </div>

          {/* Project Switcher */}
          <select
            className="input-field"
            style={{ width: "220px", height: "34px" }}
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Execution Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          {workflow?.status === "running" ? (
            <>
              <button onClick={handlePause} className="btn-secondary" style={{ padding: "6px 12px" }}>
                <Pause size={14} />
                <span>Pause</span>
              </button>
              <button onClick={handleCancel} className="btn-danger" style={{ padding: "6px 12px" }}>
                <Square size={14} />
                <span>Stop</span>
              </button>
            </>
          ) : workflow?.status === "paused" ? (
            <button onClick={handleResume} className="btn-primary" style={{ padding: "6px 12px" }}>
              <Play size={14} />
              <span>Resume</span>
            </button>
          ) : (
            <button
              onClick={handleStart}
              disabled={workflow?.status === "completed"}
              className="btn-primary"
              style={{ padding: "6px 12px" }}
            >
              <Play size={14} />
              <span>{workflow?.status === "completed" ? "Execution Completed" : "Run Workflow"}</span>
            </button>
          )}

          <button onClick={loadWorkflow} className="btn-secondary" style={{ padding: "6px 10px" }} title="Refresh graph">
            <RotateCcw size={14} />
          </button>
        </div>
      </div>

      {/* Human Approval Required Gate Banner */}
      {pendingApproval && (
        <div
          style={{
            backgroundColor: "var(--warning-light)",
            border: "1px solid #FCD34D",
            borderRadius: "8px",
            padding: "12px 20px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <AlertTriangle size={20} color="var(--warning)" />
            <div>
              <div style={{ fontWeight: 600, fontSize: "13px", color: "#92400E" }}>{pendingApproval.title}</div>
              <div style={{ fontSize: "12px", color: "#B45309" }}>{pendingApproval.description}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={() => handleResolveApproval("rejected")} className="btn-danger" style={{ padding: "6px 12px", fontSize: "12px" }}>
              Reject
            </button>
            <button onClick={() => handleResolveApproval("approved")} className="btn-primary" style={{ padding: "6px 12px", fontSize: "12px" }}>
              Approve & Proceed
            </button>
          </div>
        </div>
      )}

      {/* Canvas + Inspector Split View */}
      <div style={{ flex: 1, display: "flex", gap: "16px", minHeight: 0 }}>
        {/* Visual Graph Canvas */}
        <div
          style={{
            flex: 1,
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            position: "relative",
            overflow: "hidden",
            backgroundImage: "radial-gradient(#E5E7EB 1px, transparent 1px)",
            backgroundSize: "20px 20px",
          }}
        >
          {/* Zoom Controls Overlay */}
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              left: "16px",
              display: "flex",
              gap: "4px",
              backgroundColor: "#FFFFFF",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "4px",
              boxShadow: "var(--shadow-sm)",
              zIndex: 10,
            }}
          >
            <button
              onClick={() => setZoomLevel((z) => Math.min(z + 0.15, 1.6))}
              className="btn-secondary"
              style={{ padding: "6px 8px" }}
            >
              <ZoomIn size={14} />
            </button>
            <button
              onClick={() => setZoomLevel((z) => Math.max(z - 0.15, 0.6))}
              className="btn-secondary"
              style={{ padding: "6px 8px" }}
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={() => setZoomLevel(1)}
              className="btn-secondary"
              style={{ padding: "6px 8px" }}
            >
              <Maximize2 size={14} />
            </button>
          </div>

          {/* Minimap Status Overlay */}
          <div
            style={{
              position: "absolute",
              bottom: "16px",
              right: "16px",
              backgroundColor: "rgba(255,255,255,0.92)",
              backdropFilter: "blur(4px)",
              border: "1px solid var(--border-color)",
              borderRadius: "8px",
              padding: "10px 14px",
              fontSize: "11px",
              color: "var(--text-secondary)",
              zIndex: 10,
            }}
          >
            <div>
              Workflow: <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{workflow?.status || "Idle"}</span>
            </div>
            <div>
              Current Step: <span style={{ fontWeight: 600, color: "var(--primary-accent)" }}>{workflow?.current_step || "Standby"}</span>
            </div>
          </div>

          {/* Renderable SVG Canvas with Zoom */}
          <div
            style={{
              width: "1920px",
              height: "800px",
              transform: `scale(${zoomLevel})`,
              transformOrigin: "top left",
              position: "relative",
            }}
          >
            {/* SVG Connecting Edges */}
            <svg
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: "100%",
                pointerEvents: "none",
              }}
            >
              <defs>
                <marker
                  id="arrowhead"
                  markerWidth="8"
                  markerHeight="6"
                  refX="8"
                  refY="3"
                  orient="auto"
                >
                  <polygon points="0 0, 8 3, 0 6" fill="#94A3B8" />
                </marker>
              </defs>

              <line x1="230" y1="190" x2="280" y2="110" stroke="#CBD5E1" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <line x1="460" y1="110" x2="520" y2="110" stroke="#CBD5E1" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <line x1="700" y1="110" x2="760" y2="70" stroke="#CBD5E1" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <line x1="700" y1="110" x2="760" y2="190" stroke="#CBD5E1" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <line x1="940" y1="70" x2="1000" y2="130" stroke="#CBD5E1" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <line x1="940" y1="190" x2="1000" y2="130" stroke="#CBD5E1" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <line x1="1180" y1="130" x2="1220" y2="80" stroke="#CBD5E1" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <line x1="1180" y1="130" x2="1220" y2="200" stroke="#CBD5E1" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <line x1="1400" y1="80" x2="1460" y2="140" stroke="#CBD5E1" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <line x1="1400" y1="200" x2="1460" y2="140" stroke="#CBD5E1" strokeWidth="2" markerEnd="url(#arrowhead)" />
              <line x1="1640" y1="140" x2="1680" y2="140" stroke="#CBD5E1" strokeWidth="2" markerEnd="url(#arrowhead)" />
            </svg>

            {/* Interactive Graph Nodes */}
            {workflow?.nodes?.map((node: NodeItem) => {
              const colors = getNodeColor(node.status);
              const isSelected = selectedNode?.id === node.id;
              return (
                <div
                  key={node.id}
                  onClick={() => setSelectedNode(node)}
                  style={{
                    position: "absolute",
                    left: `${node.position_x}px`,
                    top: `${node.position_y}px`,
                    width: "180px",
                    padding: "12px 14px",
                    backgroundColor: colors.bg,
                    border: isSelected ? "2px solid var(--primary-accent)" : `1px solid ${colors.border}`,
                    borderRadius: "10px",
                    boxShadow: node.status === 'running'
                      ? (pulse ? '0 0 0 3px rgba(49,94,251,0.4)' : '0 0 0 3px rgba(49,94,251,0.1)')
                      : isSelected ? 'var(--shadow-md)' : 'var(--shadow-sm)',
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    zIndex: 5,
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "6px" }}>
                    <span style={{ fontSize: "10px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)" }}>
                      {node.agent_role.replace("_", " ")}
                    </span>
                    <span className={`badge ${colors.badge}`}>{node.status}</span>
                  </div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", lineHeight: "1.3" }}>
                    {node.title}
                  </div>
                  {node.duration_ms > 0 && (
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "6px" }}>
                      ⏱ {(node.duration_ms / 1000).toFixed(2)}s
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Node Inspection Drawer */}
        <div
          style={{
            width: "360px",
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-color)",
            borderRadius: "12px",
            padding: "24px",
            display: "flex",
            flexDirection: "column",
            gap: "16px",
            overflowY: "auto",
          }}
        >
          {selectedNode ? (
            <>
              <div style={{ borderBottom: "1px solid var(--border-color)", paddingBottom: "12px" }}>
                <span className={`badge ${getNodeColor(selectedNode.status).badge}`}>{selectedNode.status}</span>
                <h3 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginTop: "8px" }}>
                  {selectedNode.title}
                </h3>
                <div style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "capitalize", marginTop: "2px" }}>
                  Assigned: {selectedNode.agent_role.replace("_", " ")} Agent
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "4px" }}>
                  Execution Duration
                </h4>
                <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                  {selectedNode.duration_ms > 0 ? `${(selectedNode.duration_ms / 1000).toFixed(2)}s` : "Pending execution"}
                </div>
              </div>

              <div>
                <h4 style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Responsibilities & Artifacts
                </h4>
                <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                  Autonomous agent decomposes prompt, invokes structured LLM generation, validates outputs, and commits code artifacts to project repository.
                </p>
              </div>

              <div>
                <h4 style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)", marginBottom: "6px" }}>
                  Quick Nav to Output
                </h4>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <a
                    href={`/workspace?projectId=${selectedProjectId}`}
                    className="btn-secondary"
                    style={{ fontSize: "12px", padding: "8px" }}
                  >
                    <Code2 size={14} />
                    <span>View Generated Code</span>
                  </a>
                  <a
                    href={`/testing?projectId=${selectedProjectId}`}
                    className="btn-secondary"
                    style={{ fontSize: "12px", padding: "8px" }}
                  >
                    <FileCheck size={14} />
                    <span>Inspect QA Assertions</span>
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div style={{ textAlign: "center", color: "var(--text-secondary)", padding: "40px 0" }}>
              Click any node in the graph to inspect inputs, outputs, and status.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
