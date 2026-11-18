import React, { useEffect, useState } from "react";
import {
  GitPullRequest,
  GitBranch,
  GitCommit,
  CheckCircle,
} from "lucide-react";
import { api } from "../services/api";

export const GitReleasesPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [repoState, setRepoState] = useState<any | null>(null);
  const [commits, setCommits] = useState<any[]>([]);
  const [pullRequests, setPullRequests] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"prs" | "commits" | "branches">("prs");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects().then((projs) => {
      setProjects(projs || []);
      if (projs && projs.length > 0) {
        setSelectedProjectId(projs[0].id);
      }
    });
  }, []);

  const loadGitData = () => {
    if (!selectedProjectId) return;
    setLoading(true);
    Promise.all([
      api.getRepoStatus(selectedProjectId).catch(() => null),
      api.getCommits(selectedProjectId).catch(() => []),
      api.getPullRequests(selectedProjectId).catch(() => []),
    ]).then(([repo, cmts, prs]) => {
      setRepoState(repo);
      setCommits(cmts || []);
      setPullRequests(prs || []);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadGitData();
  }, [selectedProjectId]);

  const handleMerge = async (prId: number) => {
    if (!selectedProjectId) return;
    try {
      await api.mergePullRequest(selectedProjectId, prId);
      loadGitData();
    } catch (err: any) {
      alert("Merge failed: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header Toolbar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
          padding: "16px 24px",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          boxShadow: "var(--shadow-sm)",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <h1 style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>
            Git Integration & Release Lifecycle
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Autonomous branch pipelines, agent commits, Pull Request code reviews, and release management.
          </p>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <select
            className="input-field"
            style={{ width: "220px", height: "36px" }}
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
      </div>

      {/* Repo Stats Bar */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "16px" }}>
        <div className="card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", fontWeight: 600 }}>
            <span>Active Branch</span>
            <GitBranch size={16} color="var(--primary-accent)" />
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginTop: "8px", fontFamily: "var(--font-mono)" }}>
            {repoState?.current_branch || "main"}
          </div>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", fontWeight: 600 }}>
            <span>Total Commits</span>
            <GitCommit size={16} color="var(--primary-accent)" />
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginTop: "8px" }}>
            {commits.length}
          </div>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", fontWeight: 600 }}>
            <span>Pull Requests</span>
            <GitPullRequest size={16} color="var(--primary-accent)" />
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text-primary)", marginTop: "8px" }}>
            {pullRequests.length}
          </div>
        </div>

        <div className="card" style={{ padding: "18px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", color: "var(--text-secondary)", fontSize: "12px", textTransform: "uppercase", fontWeight: 600 }}>
            <span>Release Tag</span>
            <CheckCircle size={16} color="var(--success)" />
          </div>
          <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--success)", marginTop: "8px", fontFamily: "var(--font-mono)" }}>
            v1.0.0-rc1
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "6px", borderBottom: "1px solid var(--border-color)", paddingBottom: "2px" }}>
        {[
          { key: "prs", label: `Pull Requests (${pullRequests.length})`, icon: GitPullRequest },
          { key: "commits", label: `Commit History (${commits.length})`, icon: GitCommit },
          { key: "branches", label: `Branches (${repoState?.branches?.length || 5})`, icon: GitBranch },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 18px",
                fontSize: "13px",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--primary-accent)" : "var(--text-secondary)",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid var(--primary-accent)" : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.12s ease",
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "50px", color: "var(--text-secondary)" }}>
          Loading repository logs...
        </div>
      ) : (
        <>
          {/* Tab 1: Pull Requests */}
          {activeTab === "prs" && (
            <div className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                    Pull Requests & Code Reviews
                  </h2>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Automated feature branch review workflows and peer reviews
                  </p>
                </div>
              </div>

              {pullRequests.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                  No Pull Requests opened yet. Run the workflow to trigger code authoring and PR creation.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {pullRequests.map((pr) => (
                    <div
                      key={pr.id}
                      style={{
                        padding: "16px 20px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)",
                        backgroundColor: "#FAFAFA",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span className={`badge badge-${pr.status === "merged" ? "success" : "primary"}`}>
                            PR #{pr.id} {pr.status}
                          </span>
                          <span style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                            {pr.source_branch} → {pr.target_branch}
                          </span>
                        </div>

                        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
                          {pr.title}
                        </h3>
                        <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                          {pr.description}
                        </p>

                        <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "4px" }}>
                          Authored by <strong>{pr.author}</strong> • {new Date(pr.created_at).toLocaleString()}
                        </div>

                        {pr.reviews && pr.reviews.length > 0 && (
                          <div style={{ marginTop: "8px", padding: "8px 12px", backgroundColor: "#EFF6FF", borderRadius: "6px", border: "1px solid #BFDBFE", fontSize: "12px" }}>
                            <strong>{pr.reviews[0].reviewer}: </strong>
                            <span style={{ color: "var(--text-secondary)" }}>{pr.reviews[0].comment}</span>
                          </div>
                        )}
                      </div>

                      {pr.status === "open" && (
                        <button
                          onClick={() => handleMerge(pr.id)}
                          className="btn-primary"
                          style={{ padding: "8px 16px", fontSize: "13px" }}
                        >
                          Merge Pull Request
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 2: Commit History */}
          {activeTab === "commits" && (
            <div className="card" style={{ padding: "24px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
                Autonomous Commit History
              </h2>

              {commits.length === 0 ? (
                <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
                  No commits recorded yet.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {commits.map((c) => (
                    <div
                      key={c.id}
                      style={{
                        padding: "12px 16px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)",
                        backgroundColor: "#FFFFFF",
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: 700, padding: "3px 8px", backgroundColor: "#F1F5F9", borderRadius: "4px" }}>
                          {c.id}
                        </span>
                        <div>
                          <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                            {c.message}
                          </div>
                          <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                            Author: <strong>{c.author}</strong> on branch <code>{c.branch}</code>
                          </div>
                        </div>
                      </div>

                      <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                        {new Date(c.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Tab 3: Branches */}
          {activeTab === "branches" && (
            <div className="card" style={{ padding: "24px" }}>
              <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
                Repository Branches
              </h2>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {(repoState?.branches || ["main", "feature/architecture", "feature/backend-api", "feature/frontend-ui", "fix/qa-patch"]).map((b: string) => (
                  <div
                    key={b}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "12px 16px",
                      borderRadius: "6px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: b === "main" ? "#EFF6FF" : "#FAFAFA",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <GitBranch size={16} color="var(--primary-accent)" />
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                        {b}
                      </span>
                      {b === "main" && <span className="badge badge-primary">Default</span>}
                    </div>
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>Active Pipeline Branch</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
