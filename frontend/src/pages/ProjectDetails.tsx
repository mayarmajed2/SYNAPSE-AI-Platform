import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ArrowLeft,
  Workflow,
  Code2,
  FileCheck,
  Shield,
  Layers,
  Calendar,
} from "lucide-react";
import { api } from "../services/api";

export const ProjectDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [details, setDetails] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "workflow" | "code" | "tests" | "security">("overview");
  const [artifacts, setArtifacts] = useState<any[]>([]);
  const [testRuns, setTestRuns] = useState<any[]>([]);
  const [securityScans, setSecurityScans] = useState<any[]>([]);

  useEffect(() => {
    if (!id) return;
    setLoading(true);

    api.getProjectDetails(id)
      .then((data) => {
        setDetails(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load project details:", err);
        setLoading(false);
      });

    api.getProjectArtifacts(id).then((arts) => setArtifacts(arts || [])).catch(() => {});
    api.getProjectTestRuns(id).then((trs) => setTestRuns(trs || [])).catch(() => {});
    api.getProjectSecurityScans(id).then((scs) => setSecurityScans(scs || [])).catch(() => {});
  }, [id]);

  if (loading) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 0", textAlign: "center", color: "var(--text-secondary)" }}>
        Loading project details...
      </div>
    );
  }

  if (!details) {
    return (
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "60px 0", textAlign: "center" }}>
        <h2 style={{ fontSize: "18px", color: "var(--text-primary)" }}>Project not found</h2>
        <Link to="/projects" className="btn-secondary" style={{ marginTop: "16px", display: "inline-flex" }}>
          <ArrowLeft size={14} />
          <span>Back to Projects</span>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: "1300px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Breadcrumb & Action Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Link
          to="/projects"
          style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--text-secondary)", textDecoration: "none" }}
        >
          <ArrowLeft size={16} />
          <span>All Projects</span>
        </Link>

        <div style={{ display: "flex", gap: "10px" }}>
          <Link
            to={`/workflow-studio?projectId=${details.id}`}
            className="btn-primary"
            style={{ padding: "8px 14px", fontSize: "13px" }}
          >
            <Workflow size={15} />
            <span>Open in Workflow Studio</span>
          </Link>
          <Link
            to={`/workspace?projectId=${details.id}`}
            className="btn-secondary"
            style={{ padding: "8px 14px", fontSize: "13px" }}
          >
            <Code2 size={15} />
            <span>Workspace</span>
          </Link>
        </div>
      </div>

      {/* Project Banner Card */}
      <div
        className="card"
        style={{
          padding: "24px 28px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>
              {details.name}
            </h1>
            <span className={`badge badge-${details.status === "completed" ? "success" : "primary"}`}>
              {details.status}
            </span>
            <span className="badge badge-neutral">{details.project_type}</span>
          </div>

          <p style={{ fontSize: "14px", color: "var(--text-secondary)", maxWidth: "700px" }}>
            {details.idea}
          </p>

          <div style={{ display: "flex", gap: "16px", marginTop: "12px", fontSize: "12px", color: "var(--text-secondary)" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Calendar size={13} />
              Created {details.created_at ? new Date(details.created_at).toLocaleDateString() : "Recently"}
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <Layers size={13} />
              Complexity: <strong>{details.complexity}</strong>
            </span>
          </div>
        </div>

        {/* Progress Bar Widget */}
        <div style={{ minWidth: "180px", textAlign: "right" }}>
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)" }}>
            Autonomous Execution
          </div>
          <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--text-primary)", marginTop: "2px" }}>
            {details.execution_progress}%
          </div>
          <div
            style={{
              height: "6px",
              width: "100%",
              backgroundColor: "#E5E7EB",
              borderRadius: "3px",
              marginTop: "6px",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                height: "100%",
                width: `${details.execution_progress}%`,
                backgroundColor: details.execution_progress === 100 ? "var(--success)" : "var(--primary-accent)",
              }}
            />
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div style={{ display: "flex", gap: "4px", borderBottom: "1px solid var(--border-color)", paddingBottom: "2px" }}>
        {[
          { key: "overview", label: "Overview", icon: Layers },
          { key: "workflow", label: "Workflow Nodes", icon: Workflow },
          { key: "code", label: `Code Artifacts (${artifacts.length || details.stats?.artifact_count || 0})`, icon: Code2 },
          { key: "tests", label: `QA Testing (${testRuns.length || details.stats?.test_run_count || 0})`, icon: FileCheck },
          { key: "security", label: `Security Scans (${securityScans.length || details.stats?.security_scan_count || 0})`, icon: Shield },
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
                padding: "10px 16px",
                fontSize: "13px",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--primary-accent)" : "var(--text-secondary)",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid var(--primary-accent)" : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Overview */}
      {activeTab === "overview" && (
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px" }}>
          <div className="card" style={{ padding: "24px", display: "flex", flexDirection: "column", gap: "20px" }}>
            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                Product Vision & Scope
              </h3>
              <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
                {details.idea}
              </p>
            </div>

            <div>
              <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
                Target Architecture & Tech Stack
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
                <div style={{ padding: "12px", backgroundColor: "#F9FAFB", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Frontend</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginTop: "4px" }}>
                    {details.tech_stack?.frontend || "React + TypeScript"}
                  </div>
                </div>
                <div style={{ padding: "12px", backgroundColor: "#F9FAFB", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Backend</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginTop: "4px" }}>
                    {details.tech_stack?.backend || "FastAPI"}
                  </div>
                </div>
                <div style={{ padding: "12px", backgroundColor: "#F9FAFB", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
                  <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Database</div>
                  <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)", marginTop: "4px" }}>
                    {details.tech_stack?.database || "PostgreSQL 16"}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Metrics */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div className="card" style={{ padding: "20px" }}>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>
                Workflow Lifecycle
              </div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text-primary)", marginTop: "8px" }}>
                {details.workflow?.status || "Pending"}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                Current stage: <strong>{details.workflow?.current_step || "Standby"}</strong>
              </div>
            </div>

            <div className="card" style={{ padding: "20px" }}>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", textTransform: "uppercase", fontWeight: 600 }}>
                Generated Artifacts
              </div>
              <div style={{ fontSize: "24px", fontWeight: 700, color: "var(--primary-accent)", marginTop: "8px" }}>
                {artifacts.length || details.stats?.artifact_count || 0}
              </div>
              <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                PRD, architecture, backend code, React components, test suites
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Workflow Nodes */}
      {activeTab === "workflow" && (
        <div className="card" style={{ padding: "24px" }}>
          <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "16px" }}>
            Multi-Agent Execution Pipeline Nodes
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {details.workflow?.nodes?.map((node: any, idx: number) => (
              <div
                key={node.id || idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 16px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "#FAFAFA",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "6px",
                      backgroundColor: "var(--primary-light)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "var(--primary-accent)",
                      fontWeight: 700,
                      fontSize: "12px",
                    }}
                  >
                    {idx + 1}
                  </div>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {node.title}
                    </div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "capitalize" }}>
                      Agent: {node.agent_role.replace("_", " ")}
                    </div>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                  {node.duration_ms > 0 && (
                    <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      {(node.duration_ms / 1000).toFixed(2)}s
                    </span>
                  )}
                  <span className={`badge badge-${node.status === "completed" ? "success" : node.status === "running" ? "primary" : "neutral"}`}>
                    {node.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: Code Artifacts */}
      {activeTab === "code" && (
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Project Artifacts Repository
            </h3>
            <Link to={`/workspace?projectId=${details.id}`} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
              <Code2 size={13} />
              <span>Open in Code Workspace</span>
            </Link>
          </div>

          {artifacts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
              No artifacts generated yet. Run the workflow to produce codebase files.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {artifacts.map((art) => (
                <div
                  key={art.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    border: "1px solid var(--border-color)",
                    backgroundColor: "#FAFAFA",
                    fontSize: "13px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Code2 size={15} color="var(--primary-accent)" />
                    <span style={{ fontFamily: "var(--font-mono)", color: "var(--text-primary)" }}>
                      {art.file_path}
                    </span>
                  </div>
                  <span className="badge badge-neutral">{art.artifact_type}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: QA Testing */}
      {activeTab === "tests" && (
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              Automated QA Test Runs
            </h3>
            <Link to={`/testing?projectId=${details.id}`} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
              <FileCheck size={13} />
              <span>Open QA Center</span>
            </Link>
          </div>

          {testRuns.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
              No test suites executed for this project yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {testRuns.map((tr) => (
                <div
                  key={tr.id}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-primary)" }}>{tr.title}</div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                      Passed: {tr.passed_tests}/{tr.total_tests} tests ({tr.duration_ms}ms)
                    </div>
                  </div>
                  <span className={`badge badge-${tr.status === "passed" ? "success" : "error"}`}>
                    {tr.status}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Security */}
      {activeTab === "security" && (
        <div className="card" style={{ padding: "24px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>
              SAST Security Audit Reports
            </h3>
            <Link to={`/security?projectId=${details.id}`} className="btn-secondary" style={{ padding: "6px 12px", fontSize: "12px" }}>
              <Shield size={13} />
              <span>Open Security Center</span>
            </Link>
          </div>

          {securityScans.length === 0 ? (
            <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
              No security scans recorded for this project yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {securityScans.map((scan) => (
                <div
                  key={scan.id}
                  style={{
                    padding: "12px 16px",
                    borderRadius: "8px",
                    border: "1px solid var(--border-color)",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600, fontSize: "13px", color: "var(--text-primary)" }}>{scan.scan_type} Audit</div>
                    <div style={{ fontSize: "11px", color: "var(--text-secondary)" }}>
                      Risk Level: {scan.risk_level} • Vulnerabilities: {scan.total_vulnerabilities}
                    </div>
                  </div>
                  <span className={`badge badge-${scan.risk_level === "low" ? "success" : "warning"}`}>
                    {scan.risk_level} risk
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
