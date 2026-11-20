import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import {
  PlusCircle,
  Search,
  Trash2,
  GitBranch,
  Code2,
  ExternalLink,
  FolderKanban,
} from "lucide-react";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";
import { ConfirmModal } from "../components/ui/ConfirmModal";
import { ErrorBanner, EmptyState, LoadingSkeleton } from "../components/ui/PageState";

export const Projects: React.FC = () => {
  const { success, error } = useToast();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<any | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Debounce search input by 280ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search.trim()), 280);
    return () => clearTimeout(timer);
  }, [search]);

  const fetchProjects = useCallback(async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const data = await api.getProjects(debouncedSearch || undefined, statusFilter || undefined);
      setProjects(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load projects.");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, statusFilter]);

  useEffect(() => {
    fetchProjects();
  }, [fetchProjects]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await api.deleteProject(deleteTarget.id);
      success("Project deleted", `"${deleteTarget.name}" has been removed.`);
      setDeleteTarget(null);
      fetchProjects();
    } catch (err: any) {
      error("Delete failed", err?.message || "Could not delete project.");
    } finally {
      setDeleting(false);
    }
  };

  const formatStack = (stack: any): string => {
    if (!stack || typeof stack !== "object") return "React, FastAPI, PostgreSQL";
    const vals = Object.values(stack).filter(Boolean).map(String);
    return vals.length > 0 ? vals.join(" · ") : "React, FastAPI, PostgreSQL";
  };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Projects</h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
            Manage autonomous software repositories, execution pipelines, and generated deliverables.
          </p>
        </div>
        <Link to="/app/projects/new" className="btn-primary">
          <PlusCircle size={15} /> New Software Project
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="card" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ position: "relative", flex: 1, minWidth: 220 }}>
          <Search size={15} color="var(--text-muted)" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
          <input
            type="text"
            className="input-field"
            style={{ paddingLeft: 34 }}
            placeholder="Search projects by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className="input-field"
          style={{ width: 180 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Statuses</option>
          <option value="planning">Planning</option>
          <option value="in_progress">In Progress</option>
          <option value="review">In Review</option>
          <option value="completed">Completed</option>
          <option value="failed">Failed</option>
        </select>
      </div>

      {errorMsg && <ErrorBanner message={errorMsg} onRetry={fetchProjects} />}

      {loading ? (
        <LoadingSkeleton rows={3} />
      ) : projects.length === 0 ? (
        <EmptyState
          icon={<FolderKanban size={24} />}
          title="No projects found"
          description={
            search || statusFilter
              ? "Try adjusting your search query or status filter."
              : "Launch your first autonomous software project to watch all 10 agents build, test, and verify your codebase."
          }
          action={
            <Link to="/app/projects/new" className="btn-primary">
              <PlusCircle size={14} /> Create Software Project
            </Link>
          }
        />
      ) : (
        <div className="grid-2col">
          {projects.map((p) => (
            <div key={p.id} className="card card-interactive" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 10 }}>
                <div>
                  <Link
                    to={`/app/projects/${p.id}`}
                    style={{ fontSize: 16, fontWeight: 700, textDecoration: "none", color: "var(--text-primary)" }}
                  >
                    {p.name}
                  </Link>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 4, flexWrap: "wrap" }}>
                    <span className="badge badge-neutral">{p.project_type}</span>
                    <span className="badge badge-neutral">{p.complexity}</span>
                  </div>
                </div>
                <span
                  className={`badge ${
                    p.status === "completed"
                      ? "badge-success"
                      : p.status === "failed"
                      ? "badge-error"
                      : p.status === "review"
                      ? "badge-warning"
                      : "badge-primary"
                  }`}
                >
                  {p.status}
                </span>
              </div>

              <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.55 }}>
                {(p.description || p.idea || "").slice(0, 160)}
                {(p.description || p.idea || "").length > 160 ? "..." : ""}
              </p>

              <div style={{ fontSize: 12, color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>
                Stack: {formatStack(p.tech_stack)}
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, fontWeight: 600, marginBottom: 5 }}>
                  <span style={{ color: "var(--text-muted)" }}>Pipeline Progress</span>
                  <span>{p.execution_progress}%</span>
                </div>
                <div style={{ height: 6, borderRadius: 99, background: "var(--bg-subtle)", overflow: "hidden" }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${p.execution_progress}%`,
                      background: p.status === "failed" ? "var(--error)" : "var(--primary-accent)",
                    }}
                  />
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  paddingTop: 12,
                  borderTop: "1px solid var(--border-color)",
                  flexWrap: "wrap",
                  gap: 8,
                }}
              >
                <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                  <Link to={`/app/projects/${p.id}`} className="btn-secondary btn-sm">
                    <ExternalLink size={13} /> Details
                  </Link>
                  <Link to={`/app/workflows?project=${p.id}`} className="btn-secondary btn-sm">
                    <GitBranch size={13} /> Studio
                  </Link>
                  <Link to={`/app/code?project=${p.id}`} className="btn-secondary btn-sm">
                    <Code2 size={13} /> Code
                  </Link>
                </div>
                <button
                  type="button"
                  className="btn-danger btn-sm"
                  onClick={() => setDeleteTarget(p)}
                  aria-label={`Delete ${p.name}`}
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmModal
        open={Boolean(deleteTarget)}
        title="Delete Project"
        description={`Are you sure you want to permanently delete "${deleteTarget?.name}" and all associated workflows, artifacts, test runs, and security scans?`}
        confirmLabel="Delete Project"
        destructive
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
