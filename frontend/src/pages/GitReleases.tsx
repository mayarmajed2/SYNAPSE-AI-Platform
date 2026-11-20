import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { GitPullRequest, GitCommit, GitBranch, PlusCircle, CheckCircle2 } from "lucide-react";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";
import { ErrorBanner, EmptyState, LoadingSkeleton } from "../components/ui/PageState";

export const GitReleases: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error } = useToast();

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(searchParams.get("project") || "");
  const [repo, setRepo] = useState<any>(null);
  const [commits, setCommits] = useState<any[]>([]);
  const [prs, setPrs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"commits" | "prs" | "branches">("commits");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const loadGit = useCallback(async (projId: string) => {
    if (!projId) return;
    try {
      const [st, cm, prList] = await Promise.all([
        api.getRepoStatus(projId),
        api.getCommits(projId),
        api.getPullRequests(projId),
      ]);
      setRepo(st);
      setCommits(Array.isArray(cm) ? cm : []);
      setPrs(Array.isArray(prList) ? prList : []);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load repository history.");
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
        if (target) return loadGit(target);
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
  }, [loadGit]);

  const handleMerge = async (prId: number) => {
    try {
      await api.mergePullRequest(selectedProjectId, prId);
      success("Pull Request merged", `PR #${prId} merged into main.`);
      await loadGit(selectedProjectId);
    } catch (err: any) {
      error("Merge failed", err?.message);
    }
  };

  if (loading) return <LoadingSkeleton rows={2} />;

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<GitPullRequest size={24} />}
        title="No Git repositories initialized"
        description="Create a project to track agent commits, feature branches, and pull requests."
        action={<Link to="/app/projects/new" className="btn-primary"><PlusCircle size={14} /> New Project</Link>}
      />
    );
  }

  const branches: string[] = repo?.branches || [];

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {errorMsg && <ErrorBanner message={errorMsg} onRetry={() => loadGit(selectedProjectId)} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Git & Releases</h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
            Agent-authored commit logs, pull request lifecycle, and branch status.
          </p>
        </div>
        <select
          className="input-field"
          style={{ width: 220 }}
          value={selectedProjectId}
          onChange={(e) => {
            setSelectedProjectId(e.target.value);
            setSearchParams({ project: e.target.value });
            loadGit(e.target.value);
          }}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <button type="button" className={activeTab === "commits" ? "btn-primary btn-sm" : "btn-secondary btn-sm"} onClick={() => setActiveTab("commits")}>
          <GitCommit size={13} /> Commits ({commits.length})
        </button>
        <button type="button" className={activeTab === "prs" ? "btn-primary btn-sm" : "btn-secondary btn-sm"} onClick={() => setActiveTab("prs")}>
          <GitPullRequest size={13} /> Pull Requests ({prs.length})
        </button>
        <button type="button" className={activeTab === "branches" ? "btn-primary btn-sm" : "btn-secondary btn-sm"} onClick={() => setActiveTab("branches")}>
          <GitBranch size={13} /> Branches ({branches.length})
        </button>
      </div>

      {activeTab === "commits" && (
        commits.length === 0 ? (
          <EmptyState icon={<GitCommit size={22} />} title="No commits yet" description="Start the project workflow to generate agent commits." />
        ) : (
          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {commits.map((c: any, idx: number) => (
              <div key={c.id || idx} style={{ padding: 12, borderRadius: 9, background: "var(--bg-main)", border: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                <div>
                  <div style={{ fontSize: 13.5, fontWeight: 600 }}>{c.message}</div>
                  <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 3 }}>
                    {c.author} · branch <code>{c.branch || "main"}</code> · {c.files_changed || 0} file(s)
                  </div>
                </div>
                <span className="badge badge-neutral" style={{ fontFamily: "var(--font-mono)" }}>{c.id || "commit"}</span>
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === "prs" && (
        prs.length === 0 ? (
          <EmptyState icon={<GitPullRequest size={22} />} title="No Pull Requests yet" description="Pull Requests created during workflow delivery will appear here." />
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            {prs.map((pr: any) => (
              <div key={pr.id} className="card" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 12 }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <strong style={{ fontSize: 14.5 }}>#{pr.id} {pr.title}</strong>
                    <span className={`badge ${pr.status === "merged" ? "badge-success" : "badge-primary"}`}>{pr.status}</span>
                  </div>
                  <div style={{ fontSize: 12.5, color: "var(--text-secondary)", marginTop: 4 }}>
                    {pr.source_branch} → {pr.target_branch}
                  </div>
                </div>
                {pr.status === "open" ? (
                  <button type="button" className="btn-primary btn-sm" onClick={() => handleMerge(pr.id)}>
                    <CheckCircle2 size={13} /> Merge PR
                  </button>
                ) : (
                  <span style={{ fontSize: 12, color: "var(--success)", fontWeight: 600 }}>Merged</span>
                )}
              </div>
            ))}
          </div>
        )
      )}

      {activeTab === "branches" && (
        <div className="card" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {branches.map((b) => (
            <div key={b} style={{ padding: "10px 14px", borderRadius: 8, background: "var(--bg-main)", border: "1px solid var(--border-color)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 13, fontWeight: 600 }}>{b}</span>
              {b === (repo?.current_branch || "main") && <span className="badge badge-primary">Default</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
