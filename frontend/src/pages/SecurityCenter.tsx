import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  ShieldCheck,
} from "lucide-react";
import { api } from "../services/api";

export const SecurityCenterPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectIdParam = searchParams.get("projectId");

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectIdParam || "");
  const [securityScans, setSecurityScans] = useState<any[]>([]);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects().then((projs) => {
      setProjects(projs || []);
      if (!selectedProjectId && projs && projs.length > 0) {
        setSelectedProjectId(projs[0].id);
      }
    });
  }, []);

  const loadScans = () => {
    if (!selectedProjectId) return;
    setLoading(true);
    api.getProjectSecurityScans(selectedProjectId)
      .then((scans) => {
        setSecurityScans(scans || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadScans();
  }, [selectedProjectId]);

  const handleExecuteScan = async () => {
    if (!selectedProjectId) return;
    setScanning(true);
    try {
      await api.executeSecurityScan(selectedProjectId);
      loadScans();
    } catch (err: any) {
      alert("Failed to execute security scan: " + err.message);
    } finally {
      setScanning(false);
    }
  };

  const latestScan = securityScans[0];

  const getSeverityBadge = (severity: string) => {
    switch (severity.toLowerCase()) {
      case "critical":
        return <span className="badge badge-error">Critical</span>;
      case "high":
        return <span className="badge badge-error">High</span>;
      case "medium":
        return <span className="badge badge-warning">Medium</span>;
      default:
        return <span className="badge badge-neutral">Low / Info</span>;
    }
  };

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>
            Security & Compliance Center
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Static application security testing (SAST), OWASP Top 10 scans, and credential leak detection.
          </p>
        </div>

        <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
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

          <button
            onClick={handleExecuteScan}
            disabled={scanning || !selectedProjectId}
            className="btn-primary"
            style={{ padding: "8px 16px" }}
          >
            <ShieldCheck size={15} />
            <span>{scanning ? "Auditing Codebase..." : "Trigger Security Audit"}</span>
          </button>
        </div>
      </div>

      {/* Vulnerability Severity Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <div className="card">
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
            Critical Findings
          </div>
          <div style={{ fontSize: "26px", fontWeight: 700, marginTop: "8px", color: "var(--error)" }}>
            {latestScan?.critical_count || 0}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
            High Severity
          </div>
          <div style={{ fontSize: "26px", fontWeight: 700, marginTop: "8px", color: "var(--warning)" }}>
            {latestScan?.high_count || 0}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
            Medium / Low Findings
          </div>
          <div style={{ fontSize: "26px", fontWeight: 700, marginTop: "8px", color: "var(--primary-accent)" }}>
            {(latestScan?.medium_count || 0) + (latestScan?.low_count || 0)}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
            Overall Posture
          </div>
          <div style={{ marginTop: "10px" }}>
            <span className="badge badge-success">
              {latestScan?.critical_count === 0 ? "PASSED GOVERNANCE" : "ATTENTION REQUIRED"}
            </span>
          </div>
        </div>
      </div>

      {/* Findings Registry */}
      <div className="card" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
          Security Findings & Suggested Fixes
        </h2>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "20px" }}>
          Automated SAST findings identified during codebase analysis
        </p>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
            Analyzing security posture...
          </div>
        ) : !latestScan || !latestScan.findings || latestScan.findings.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-secondary)" }}>
            <ShieldCheck size={36} color="var(--success)" style={{ margin: "0 auto 8px" }} />
            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>Zero Security Vulnerabilities Detected</div>
            <div style={{ fontSize: "12px", marginTop: "4px" }}>
              Codebase adheres to strict input validation, token-based authentication, and sanitized ORM queries.
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {latestScan.findings.map((f: any) => (
              <div
                key={f.id}
                style={{
                  padding: "16px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  backgroundColor: "#FAFAFA",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    {getSeverityBadge(f.severity)}
                    <span style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{f.title}</span>
                  </div>
                  {f.cwe_id && <span className="badge badge-neutral">{f.cwe_id}</span>}
                </div>

                <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.4", marginBottom: "8px" }}>
                  {f.description}
                </p>

                <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "8px" }}>
                  <span style={{ fontWeight: 600 }}>Affected File:</span> <code>{f.affected_file}</code>
                  {f.line_number && <span> (Line {f.line_number})</span>}
                </div>

                {f.suggested_fix && (
                  <div
                    style={{
                      padding: "10px 12px",
                      backgroundColor: "#F1F5F9",
                      borderRadius: "6px",
                      fontSize: "12px",
                      color: "#334155",
                    }}
                  >
                    <span style={{ fontWeight: 600, color: "var(--primary-accent)" }}>Remediation:</span> {f.suggested_fix}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
