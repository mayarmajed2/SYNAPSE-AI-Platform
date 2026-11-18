import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FolderGit2,
  PlusCircle,
  Search,
  Filter,
  Trash2,
  Workflow,
  Code2,
  FlaskConical,
} from "lucide-react";
import { api } from "../services/api";

export const ProjectsPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchProjects = () => {
    setLoading(true);
    api.getProjects(search || undefined, statusFilter || undefined)
      .then((data) => {
        setProjects(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, [search, statusFilter]);

  const handleDelete = async (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to delete project "${name}" and all its artifacts?`)) {
      try {
        await api.deleteProject(id);
        setProjects((prev) => prev.filter((p) => p.id !== id));
      } catch (err: any) {
        alert("Failed to delete project: " + err.message);
      }
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>
            Software Projects
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Manage autonomous projects, inspect artifacts, and monitor multi-agent execution status.
          </p>
        </div>
        <Link to="/projects/new" className="btn-primary">
          <PlusCircle size={16} />
          <span>New Project</span>
        </Link>
      </div>

      {/* Filters Bar */}
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
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: "10px", color: "var(--text-secondary)" }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search projects by name, archetype, or keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "34px", height: "36px" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Filter size={15} color="var(--text-secondary)" />
          <select
            className="input-field"
            style={{ width: "160px", height: "36px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="planning">Planning</option>
            <option value="in_progress">In Progress</option>
            <option value="review">Review</option>
            <option value="testing">Testing</option>
            <option value="completed">Completed</option>
          </select>
        </div>
      </div>

      {/* Projects Table / Card List */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-secondary)" }}>
          Loading project registry...
        </div>
      ) : projects.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "60px 20px",
            border: "1px dashed var(--border-color)",
          }}
        >
          <FolderGit2 size={40} color="var(--text-secondary)" style={{ margin: "0 auto 12px" }} />
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>No projects found</h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px", marginBottom: "16px" }}>
            {search || statusFilter ? "No projects match your filter criteria." : "Create your first autonomous software project now."}
          </p>
          <Link to="/projects/new" className="btn-primary">
            <PlusCircle size={15} />
            <span>Create New Project</span>
          </Link>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
          {projects.map((p) => (
            <div
              key={p.id}
              className="card"
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "18px 24px",
              }}
            >
              <div style={{ flex: 1, paddingRight: "24px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
                  <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
                    <Link to={`/projects/${p.id}`} style={{ color: "inherit", textDecoration: "none" }}>
                      {p.name}
                    </Link>
                  </h3>
                  <span className="badge badge-neutral">{p.project_type}</span>
                  <span className={`badge badge-${p.status === "completed" ? "success" : "primary"}`}>{p.status}</span>
                </div>
                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.4" }}>{p.idea}</p>
                <div style={{ display: "flex", gap: "16px", marginTop: "10px", fontSize: "11px", color: "var(--text-secondary)" }}>
                  <span>Created: {new Date(p.created_at).toLocaleDateString()}</span>
                  <span>Stack: React, FastAPI, PostgreSQL</span>
                </div>
              </div>

              {/* Progress & Quick Actions */}
              <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
                <div style={{ width: "120px", textAlign: "right" }}>
                  <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {p.execution_progress}%
                  </div>
                  <div
                    style={{
                      height: "6px",
                      width: "100%",
                      backgroundColor: "#E5E7EB",
                      borderRadius: "3px",
                      marginTop: "4px",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        width: `${p.execution_progress}%`,
                        backgroundColor: p.execution_progress === 100 ? "var(--success)" : "var(--primary-accent)",
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <Link
                    to={`/workflow-studio?projectId=${p.id}`}
                    className="btn-secondary"
                    title="Open Workflow Studio"
                    style={{ padding: "8px" }}
                  >
                    <Workflow size={16} />
                  </Link>
                  <Link
                    to={`/workspace?projectId=${p.id}`}
                    className="btn-secondary"
                    title="Inspect Codebase Artifacts"
                    style={{ padding: "8px" }}
                  >
                    <Code2 size={16} />
                  </Link>
                  <Link
                    to={`/testing?projectId=${p.id}`}
                    className="btn-secondary"
                    title="QA Test Runs"
                    style={{ padding: "8px" }}
                  >
                    <FlaskConical size={16} />
                  </Link>
                  <button
                    onClick={() => handleDelete(p.id, p.name)}
                    className="btn-danger"
                    title="Delete Project"
                    style={{ padding: "8px" }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
