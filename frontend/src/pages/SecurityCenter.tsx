import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ShieldAlert, ShieldCheck, Play, PlusCircle, FileWarning } from "lucide-react";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";
import { ErrorBanner, EmptyState, LoadingSkeleton } from "../components/ui/PageState";

export const SecurityCenter: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error } = useToast();

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(searchParams.get("project") || "");
  const [scans, setScans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadScans = useCallback(async (projId: string) => {
    if (!projId) return;
    try {
      const data = await api.getProjectSecurityScans(projId);
      setScans(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load security scans.");
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
        if (target) return loadScans(target);
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
  }, [loadScans]);

  const handleScan = async () => {
    if (!selectedProjectId) return;
    setScanning(true);
    try {
      const scan = await api.executeSecurityScan(selectedProjectId);
      success("SAST Audit Completed", `${scan.total_vulnerabilities} finding(s) identified across project artifacts.`);
      await loadScans(selectedProjectId);
    } catch (err: any) {
      error("Security scan failed", err?.message);
    } finally {
      setScanning(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={2} />;

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<ShieldAlert size={24} />}
        title="No projects available to audit"
        description="Create a project first to run automated SAST vulnerability scans across generated source files."
        action={<Link to="/app/projects/new" className="btn-primary"><PlusCircle size={14} /> New Project</Link>}
      />
    );
  }

  const latest = scans[0] || null;
  const hasHighRisk = latest && (latest.critical_count > 0 || latest.high_count > 0);
  const postureBadge = !latest
    ? { cls: "badge-neutral", label: "Not Scanned" }
    : hasHighRisk
    ? { cls: "badge-error", label: "Action Required" }
    : latest.total_vulnerabilities > 0
    ? { cls: "badge-warning", label: "Review Advised" }
    : { cls: "badge-success", label: "Clean Posture" };

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {errorMsg && <ErrorBanner message={errorMsg} onRetry={() => loadScans(selectedProjectId)} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Security Center (SAST)</h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
            Deterministic OWASP & CWE static analysis over generated source code artifacts.
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
              loadScans(e.target.value);
            }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button type="button" className="btn-primary" onClick={handleScan} disabled={scanning}>
            <Play size={14} /> {scanning ? "Scanning Artifacts..." : "Run SAST Audit"}
          </button>
        </div>
      </div>

      <div className="grid-kpi">
        <div className="card">
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)" }}>OVERALL POSTURE</div>
          <div style={{ marginTop: 10 }}>
            <span className={`badge ${postureBadge.cls}`} style={{ fontSize: 12.5, padding: "5px 12px" }}>
              {postureBadge.label}
            </span>
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 8 }}>Scans run: {scans.length}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)" }}>CRITICAL / HIGH</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: hasHighRisk ? "var(--error)" : "var(--text-primary)" }}>
            {(latest?.critical_count ?? 0) + (latest?.high_count ?? 0)}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {latest?.critical_count ?? 0} critical · {latest?.high_count ?? 0} high
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)" }}>MEDIUM / LOW</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>
            {(latest?.medium_count ?? 0) + (latest?.low_count ?? 0)}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
            {latest?.medium_count ?? 0} medium · {latest?.low_count ?? 0} low
          </div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)" }}>TOTAL FINDINGS</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>{latest?.total_vulnerabilities ?? 0}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Latest static audit</div>
        </div>
      </div>

      {!latest ? (
        <EmptyState
          icon={<ShieldCheck size={24} />}
          title="No security scans executed yet"
          description="Trigger a SAST audit to inspect all project artifacts for hardcoded secrets, injection risks, and OWASP misconfigurations."
          action={<button type="button" className="btn-primary" onClick={handleScan}><Play size={14} /> Run SAST Audit</button>}
        />
      ) : (
        <div className="card">
          <div style={{ marginBottom: 14 }}>
            <h2 style={{ fontSize: 15.5, fontWeight: 700 }}>Audit Findings</h2>
            <p style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>{latest.summary}</p>
          </div>
          {(latest.findings || []).length === 0 ? (
            <div style={{ padding: 24, textAlign: "center", color: "var(--success)", fontWeight: 600, fontSize: 13.5 }}>
              <ShieldCheck size={22} style={{ marginBottom: 6 }} />
              <div>Zero vulnerabilities detected in scanned source files.</div>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              {latest.findings.map((f: any) => (
                <div
                  key={f.id || `${f.affected_file}-${f.line_number}-${f.cwe_id}`}
                  style={{
                    padding: 16,
                    borderRadius: 10,
                    border: "1px solid var(--border-color)",
                    background: "var(--bg-main)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                      <FileWarning size={16} color={f.severity === "critical" || f.severity === "high" ? "var(--error)" : "var(--warning)"} />
                      <strong style={{ fontSize: 14 }}>{f.title}</strong>
                      {f.cwe_id && <span className="badge badge-neutral">{f.cwe_id}</span>}
                    </div>
                    <span className={`badge ${f.severity === "critical" || f.severity === "high" ? "badge-error" : f.severity === "medium" ? "badge-warning" : "badge-neutral"}`}>
                      {f.severity}
                    </span>
                  </div>
                  <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--primary-accent)", marginBottom: 6 }}>
                    {f.affected_file}{f.line_number ? `:${f.line_number}` : ""}
                  </div>
                  <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>{f.description}</p>
                  {f.suggested_fix && (
                    <div style={{ fontSize: 12.5, padding: "8px 12px", borderRadius: 2, background: "var(--bg-card)", border: "1px solid var(--border-color)" }}>
                      <strong>Remediation:</strong> {f.suggested_fix}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
