import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  FileCode,
  Download,
  Copy,
  Check,
  FolderTree,
  FileText,
} from "lucide-react";
import { api } from "../services/api";

export const CodeWorkspacePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectIdParam = searchParams.get("projectId");

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectIdParam || "");
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [selectedArtifact, setSelectedArtifact] = useState<any | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  // Load projects
  useEffect(() => {
    api.getProjects().then((projs) => {
      setProjects(projs || []);
      if (!selectedProjectId && projs && projs.length > 0) {
        setSelectedProjectId(projs[0].id);
      }
    });
  }, []);

  // Fetch artifacts for selected project
  useEffect(() => {
    if (!selectedProjectId) return;
    setLoading(true);
    api.getProjectArtifacts(selectedProjectId)
      .then((arts) => {
        setArtifacts(arts || []);
        if (arts && arts.length > 0) {
          setSelectedArtifact(arts[0]);
        } else {
          setSelectedArtifact(null);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedProjectId]);

  const handleCopy = () => {
    if (!selectedArtifact) return;
    navigator.clipboard.writeText(selectedArtifact.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getFileIcon = (name: string) => {
    if (name.endsWith(".json")) return <FileCode size={15} color="#F59E0B" />;
    if (name.endsWith(".tsx") || name.endsWith(".ts")) return <FileCode size={15} color="#315EFB" />;
    if (name.endsWith(".py")) return <FileCode size={15} color="#10B981" />;
    if (name.endsWith(".md")) return <FileText size={15} color="#6B7280" />;
    return <FileCode size={15} color="var(--text-secondary)" />;
  };

  return (
    <div style={{ maxWidth: "1500px", margin: "0 auto", display: "flex", flexDirection: "column", height: "calc(100vh - 120px)", gap: "16px" }}>
      {/* Workspace Toolbar */}
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
              Code Workspace
            </h1>
            <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
              Inspect and download generated software repository
            </div>
          </div>

          <select
            className="input-field"
            style={{ width: "240px", height: "34px" }}
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

        {/* Download Codebase Action */}
        {selectedProjectId && (
          <a
            href={api.getDownloadUrl(selectedProjectId)}
            download
            className="btn-primary"
            style={{ padding: "6px 14px", textDecoration: "none" }}
          >
            <Download size={14} />
            <span>Download Complete ZIP</span>
          </a>
        )}
      </div>

      {/* Split Code Explorer View */}
      <div style={{ flex: 1, display: "grid", gridTemplateColumns: "300px 1fr", gap: "16px", minHeight: 0 }}>
        {/* File Tree Panel */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            padding: "16px",
            display: "flex",
            flexDirection: "column",
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px", color: "var(--text-secondary)" }}>
            <FolderTree size={16} />
            <span style={{ fontSize: "12px", fontWeight: 600, textTransform: "uppercase" }}>Project Files ({artifacts.length})</span>
          </div>

          {loading ? (
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", padding: "20px 0" }}>Loading file tree...</div>
          ) : artifacts.length === 0 ? (
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", padding: "20px 0", textAlign: "center" }}>
              No files generated yet for this project. Run the workflow to produce artifacts.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
              {artifacts.map((art) => {
                const isSelected = selectedArtifact?.id === art.id;
                return (
                  <button
                    key={art.id}
                    onClick={() => setSelectedArtifact(art)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      padding: "8px 10px",
                      borderRadius: "6px",
                      border: "none",
                      backgroundColor: isSelected ? "var(--primary-light)" : "transparent",
                      color: isSelected ? "var(--primary-accent)" : "var(--text-primary)",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "13px",
                      fontWeight: isSelected ? 600 : 400,
                      transition: "all 0.15s ease",
                    }}
                  >
                    {getFileIcon(art.file_name)}
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                      {art.file_path}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Code Content & Metadata Viewer */}
        <div
          style={{
            backgroundColor: "#FFFFFF",
            border: "1px solid var(--border-color)",
            borderRadius: "10px",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
          }}
        >
          {selectedArtifact ? (
            <>
              {/* File Header Bar */}
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 20px",
                  borderBottom: "1px solid var(--border-color)",
                  backgroundColor: "#F9FAFB",
                }}
              >
                <div>
                  <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text-primary)" }}>
                    {selectedArtifact.file_path}
                  </span>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                    Type: {selectedArtifact.artifact_type} | Language: {selectedArtifact.language} | Size: {selectedArtifact.size_bytes} bytes
                  </div>
                </div>

                <button onClick={handleCopy} className="btn-secondary" style={{ padding: "6px 12px" }}>
                  {copied ? <Check size={14} color="var(--success)" /> : <Copy size={14} />}
                  <span>{copied ? "Copied" : "Copy Code"}</span>
                </button>
              </div>

              {/* Code Pre Block */}
              <div
                style={{
                  flex: 1,
                  padding: "20px",
                  backgroundColor: "#0F172A",
                  color: "#F8FAFC",
                  fontFamily: "var(--font-mono)",
                  fontSize: "13px",
                  lineHeight: "1.6",
                  overflowY: "auto",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-all",
                }}
              >
                {selectedArtifact.content}
              </div>
            </>
          ) : (
            <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%", color: "var(--text-secondary)", fontSize: "14px" }}>
              Select a generated file from the left to inspect its code and architecture specifications.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
