import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FileText, Download, Printer, PlusCircle } from "lucide-react";
import { api } from "../services/api";
import { ErrorBanner, EmptyState, LoadingSkeleton } from "../components/ui/PageState";

export const EngineeringReports: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(searchParams.get("project") || "");
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const loadReport = useCallback(async (projId: string) => {
    if (!projId) return;
    try {
      const data = await api.getDeliveryReport(projId);
      setReport(data);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to generate engineering delivery report.");
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
        if (target) return loadReport(target);
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
  }, [loadReport]);

  if (loading) return <LoadingSkeleton rows={2} />;

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<FileText size={24} />}
        title="No delivery reports available"
        description="Launch a project to generate an executive engineering delivery dossier with QA, security, and cost metrics."
        action={<Link to="/app/projects/new" className="btn-primary"><PlusCircle size={14} /> New Project</Link>}
      />
    );
  }

  const s = report?.sections || {};
  const exec = s["1_executive_summary"] || {};
  const qa = s["10_testing_results"] || {};
  const sec = s["12_security_findings"] || {};
  const cost = s["17_cost_summary"] || {};
  const files = s["6_file_structure"] || {};

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {errorMsg && <ErrorBanner message={errorMsg} onRetry={() => loadReport(selectedProjectId)} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Engineering Delivery Reports</h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
            Live release dossier computed from persisted QA, SAST, artifact, and LLM usage records.
          </p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <select
            className="input-field"
            style={{ width: 220 }}
            value={selectedProjectId}
            onChange={(e) => {
              setSelectedProjectId(e.target.value);
              setSearchParams({ project: e.target.value });
              loadReport(e.target.value);
            }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          {report && (
            <>
              <a href={api.getReportDownloadUrl(selectedProjectId)} className="btn-secondary btn-sm">
                <Download size={14} /> Markdown
              </a>
              <button type="button" className="btn-primary btn-sm" onClick={() => window.print()}>
                <Printer size={14} /> Print / PDF
              </button>
            </>
          )}
        </div>
      </div>

      {report && (
        <>
          <div className="grid-kpi">
            <div className="card">
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)" }}>RELEASE STATUS</div>
              <div style={{ marginTop: 8 }}>
                <span className={`badge ${exec.status === "APPROVED_FOR_RELEASE" ? "badge-success" : exec.status === "REVIEW_REQUIRED" ? "badge-warning" : "badge-primary"}`}>
                  {(exec.status || "IN_PROGRESS").replace(/_/g, " ")}
                </span>
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)", marginTop: 6 }}>Progress: {exec.progress || "0%"}</div>
            </div>

            <div className="card">
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)" }}>QA PASS RATE</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>{qa.pass_rate || "Not run"}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {qa.passed_tests ?? 0}/{qa.total_tests ?? 0} passed
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)" }}>SECURITY POSTURE</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6, color: (sec.critical || 0) > 0 ? "var(--error)" : "var(--success)" }}>
                {sec.critical ?? 0} Critical
              </div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {sec.high ?? 0} High · {sec.medium ?? 0} Med · {sec.low ?? 0} Low
              </div>
            </div>

            <div className="card">
              <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)" }}>LLM COST</div>
              <div style={{ fontSize: 24, fontWeight: 800, marginTop: 6 }}>${Number(cost.estimated_cost_usd || 0).toFixed(4)}</div>
              <div style={{ fontSize: 12, color: "var(--text-muted)" }}>
                {Number(cost.total_tokens_consumed || 0).toLocaleString()} tokens
              </div>
            </div>
          </div>

          <div className="card" style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div>
              <h2 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{exec.title || "Executive Summary"}</h2>
              <p style={{ fontSize: 13.5, color: "var(--text-secondary)", lineHeight: 1.65 }}>{exec.content}</p>
            </div>
            <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: 14 }}>
              <h3 style={{ fontSize: 14.5, fontWeight: 700, marginBottom: 8 }}>Generated Artifacts ({files.total_files ?? 0})</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {(files.files || []).map((f: string) => (
                  <span key={f} className="badge badge-neutral" style={{ fontFamily: "var(--font-mono)" }}>{f}</span>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
