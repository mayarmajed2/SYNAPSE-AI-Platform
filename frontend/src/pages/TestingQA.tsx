import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { FlaskConical, Play, CheckCircle2, XCircle, MinusCircle, PlusCircle } from "lucide-react";
import { api } from "../services/api";
import { useToast } from "../context/ToastContext";
import { ErrorBanner, EmptyState, LoadingSkeleton } from "../components/ui/PageState";

export const TestingQA: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const { success, error } = useToast();

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(searchParams.get("project") || "");
  const [testRuns, setTestRuns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [executing, setExecuting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const loadRuns = useCallback(async (projId: string) => {
    if (!projId) return;
    try {
      const data = await api.getProjectTestRuns(projId);
      setTestRuns(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load QA test runs.");
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
        if (target) return loadRuns(target);
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
  }, [loadRuns]);

  const handleExecute = async () => {
    if (!selectedProjectId) return;
    setExecuting(true);
    try {
      const res = await api.executeTests(selectedProjectId);
      success("QA Suite Executed", `Status: ${res.status} (${res.passed_tests}/${res.total_tests} passed)`);
      await loadRuns(selectedProjectId);
    } catch (err: any) {
      error("Test execution failed", err?.message);
    } finally {
      setExecuting(false);
    }
  };

  if (loading) return <LoadingSkeleton rows={2} />;

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<FlaskConical size={24} />}
        title="No projects to test yet"
        description="Create a software project first so the QA Engineer agent can verify syntax and execute automated pytest suites."
        action={<Link to="/app/projects/new" className="btn-primary"><PlusCircle size={14} /> New Project</Link>}
      />
    );
  }

  const latest = testRuns[0] || null;
  const passRate = latest && latest.total_tests > 0
    ? `${Math.round((latest.passed_tests / latest.total_tests) * 100)}%`
    : "—";

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {errorMsg && <ErrorBanner message={errorMsg} onRetry={() => loadRuns(selectedProjectId)} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Testing & QA Center</h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
            Real Python AST syntax verification and automated sandbox pytest execution.
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
              loadRuns(e.target.value);
            }}
          >
            {projects.map((p) => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
          <button type="button" className="btn-primary" onClick={handleExecute} disabled={executing}>
            <Play size={14} /> {executing ? "Running Sandbox..." : "Run Test Suite"}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid-kpi">
        <div className="card">
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)" }}>PASS RATE</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: latest?.failed_tests ? "var(--error)" : "var(--success)" }}>
            {passRate}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>{latest ? "Latest sandbox run" : "No runs executed"}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)" }}>PASSED ASSERTIONS</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>{latest?.passed_tests ?? 0}</div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Out of {latest?.total_tests ?? 0} total</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)" }}>FAILED ASSERTIONS</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6, color: (latest?.failed_tests ?? 0) > 0 ? "var(--error)" : "var(--text-primary)" }}>
            {latest?.failed_tests ?? 0}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Skipped: {latest?.skipped_tests ?? 0}</div>
        </div>
        <div className="card">
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--text-muted)" }}>DURATION</div>
          <div style={{ fontSize: 26, fontWeight: 800, marginTop: 6 }}>
            {latest ? `${(latest.duration_ms / 1000).toFixed(2)}s` : "—"}
          </div>
          <div style={{ fontSize: 12, color: "var(--text-muted)" }}>Historical runs: {testRuns.length}</div>
        </div>
      </div>

      {!latest ? (
        <EmptyState
          icon={<FlaskConical size={24} />}
          title="No test runs recorded for this project"
          description="Click 'Run Test Suite' to execute Python AST syntax checks and pytest assertions in the project sandbox."
          action={<button type="button" className="btn-primary" onClick={handleExecute}><Play size={14} /> Run Test Suite</button>}
        />
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ padding: "16px 20px", borderBottom: "1px solid var(--border-color)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 style={{ fontSize: 15, fontWeight: 700 }}>Latest Test Assertions</h2>
            <span className={`badge ${latest.status === "passed" ? "badge-success" : latest.status === "failed" ? "badge-error" : "badge-neutral"}`}>
              {latest.status}
            </span>
          </div>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Status</th>
                  <th>Assertion</th>
                  <th>File</th>
                  <th>Duration</th>
                  <th>Details</th>
                </tr>
              </thead>
              <tbody>
                {(latest.results || []).map((res: any) => {
                  const st = (res.status || "skipped").toLowerCase();
                  return (
                    <tr key={res.id || res.test_name}>
                      <td>
                        <span className={`badge ${st === "passed" ? "badge-success" : st === "failed" ? "badge-error" : "badge-neutral"}`}>
                          {st === "passed" ? <CheckCircle2 size={12} /> : st === "failed" ? <XCircle size={12} /> : <MinusCircle size={12} />}
                          {st}
                        </span>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: 12.5, fontWeight: 500 }}>{res.test_name}</td>
                      <td style={{ color: "var(--text-secondary)", fontSize: 12.5 }}>{res.test_file}</td>
                      <td style={{ color: "var(--text-muted)" }}>{res.duration_ms}ms</td>
                      <td style={{ color: "var(--error)", fontSize: 12 }}>{res.error_message || "—"}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {latest.output_logs && (
            <div style={{ padding: 16, borderTop: "1px solid var(--border-color)", background: "#0F172A", color: "#E2E8F0", fontFamily: "var(--font-mono)", fontSize: 12, whiteSpace: "pre-wrap" }}>
              {latest.output_logs}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
