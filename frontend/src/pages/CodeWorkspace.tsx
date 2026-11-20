import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Code2, Copy, Download, FileCode, Check, PlusCircle } from "lucide-react";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";
import { ErrorBanner, EmptyState, LoadingSkeleton } from "../components/ui/PageState";

export const CodeWorkspace: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success } = useToast();

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(searchParams.get("project") || "");
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");
  const [copied, setCopied] = useState(false);

  const loadArtifacts = useCallback(async (projId: string) => {
    if (!projId) return;
    try {
      const data = await api.getProjectArtifacts(projId);
      const list = Array.isArray(data) ? data : [];
      setArtifacts(list);
      setSelectedArtifact(list[0] || null);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load generated artifacts.");
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
        if (target) return loadArtifacts(target);
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
  }, [loadArtifacts]);

  const handleCopy = async () => {
    if (!selectedArtifact?.content) return;
    try {
      await navigator.clipboard.writeText(selectedArtifact.content);
      setCopied(true);
      success("Copied to clipboard", selectedArtifact.file_path);
      setTimeout(() => setCopied(false), 1800);
    } catch {}
  };

  if (loading) return <LoadingSkeleton rows={2} />;

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<Code2 size={24} />}
        title="No code repositories yet"
        description="Launch a software project to generate full-stack backend, frontend, test, and deployment files."
        action={<Link to="/app/projects/new" className="btn-primary"><PlusCircle size={14} /> New Project</Link>}
      />
    );
  }

  const lines = (selectedArtifact?.content || "").split("\n");

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {errorMsg && <ErrorBanner message={errorMsg} onRetry={() => loadArtifacts(selectedProjectId)} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Code Workspace</h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
            Inspect generated source files, specifications, and download the full ZIP archive.
          </p>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <select
            className="input-field"
            style={{ width: 220 }}
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSearchParams({ project: e.target.value });
              loadArtifacts(e.target.value);
            }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {artifacts.length > 0 && (
            <a href={api.getDownloadUrl(selectedProjectId)} className="btn-primary">
              <Download size={14} /> Download ZIP
            </a>
          )}
        </div>
      </div>

      {artifacts.length === 0 ? (
        <EmptyState
          icon={<FileCode size={24} />}
          title="No artifacts generated for this project yet"
          description="Open Workflow Studio and start autonomous execution to generate backend, frontend, test, and docs files."
          action={<Link to={`/app/workflows?project=${selectedProjectId}`} className="btn-primary">Open Workflow Studio</Link>}
        />
      ) : (
        <div className="grid-main-aside" style={{ gridTemplateColumns: "minmax(240px, 280px) minmax(0, 1fr)" }}>
          {/* File Explorer */}
          <div className="card" style={{ padding: 12, maxHeight: 620, overflowY: "auto" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", padding: "4px 8px 10px", letterSpacing: "0.05em" }}>
              FILES ({artifacts.length})
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 3 }}>
              {artifacts.map((art) => {
                const active = selectedArtifact?.id === art.id;
                return (
                  <button
                    key={art.id}
                    type="button"
                    onClick={() => setSelectedArtifact(art)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "8px 10px",
                      borderRadius: 8,
                      border: "none",
                      background: active ? "var(--primary-light)" : "transparent",
                      color: active ? "var(--primary-accent)" : "var(--text-secondary)",
                      fontWeight: active ? 600 : 500,
                      fontSize: 12.5,
                      textAlign: "left",
                      cursor: "pointer",
                      wordBreak: "break-all",
                    }}
                  >
                    <FileCode size={14} style={{ flexShrink: 0 }} />
                    <span>{art.file_path}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Code Viewer */}
          <div className="card" style={{ padding: 0, overflow: "hidden" }}>
            <div
              style={{
                padding: "12px 16px",
                borderBottom: "1px solid var(--border-color)",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                gap: 10,
                background: "var(--bg-main)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {selectedArtifact?.file_path}
                </span>
                <span className="badge badge-neutral">{selectedArtifact?.language || "text"}</span>
              </div>
              <button type="button" className="btn-secondary btn-sm" onClick={handleCopy}>
                {copied ? <Check size={13} color="var(--success)" /> : <Copy size={13} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>
            <div
              style={{
                background: "#0F172A",
                color: "#E2E8F0",
                fontFamily: "var(--font-mono)",
                fontSize: 12.5,
                lineHeight: 1.65,
                maxHeight: 560,
                overflow: "auto",
                padding: "14px 0",
              }}
            >
              {lines.map((line: string, idx: number) => (
                <div key={idx} style={{ display: "flex", padding: "0 16px" }}>
                  <span style={{ width: 42, flexShrink: 0, color: "#475569", userSelect: "none", textAlign: "right", paddingRight: 14 }}>
                    {idx + 1}
                  </span>
                  <span style={{ whiteSpace: "pre" }}>{line}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
