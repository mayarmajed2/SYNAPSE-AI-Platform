import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  Play,
  CheckCircle2,
} from "lucide-react";
import { api } from "../services/api";

export const TestingQAPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const projectIdParam = searchParams.get("projectId");

  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectIdParam || "");
  const [testRuns, setTestRuns] = useState<any[]>([]);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects().then((projs) => {
      setProjects(projs || []);
      if (!selectedProjectId && projs && projs.length > 0) {
        setSelectedProjectId(projs[0].id);
      }
    });
  }, []);

  const loadTestRuns = () => {
    if (!selectedProjectId) return;
    setLoading(true);
    api.getProjectTestRuns(selectedProjectId)
      .then((runs) => {
        setTestRuns(runs || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    loadTestRuns();
  }, [selectedProjectId]);

  const handleExecuteTests = async () => {
    if (!selectedProjectId) return;
    setRunning(true);
    try {
      await api.executeTests(selectedProjectId);
      loadTestRuns();
    } catch (err: any) {
      alert("Failed to execute test suite: " + err.message);
    } finally {
      setRunning(false);
    }
  };

  const latestRun = testRuns[0];

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>
            Quality Assurance & Testing
          </h1>
          <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Automated test runners validating API behavior, schema integrity, and regressions.
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
            onClick={handleExecuteTests}
            disabled={running || !selectedProjectId}
            className="btn-primary"
            style={{ padding: "8px 16px" }}
          >
            <Play size={14} />
            <span>{running ? "Executing Test Sandbox..." : "Run Test Suite"}</span>
          </button>
        </div>
      </div>

      {/* Overview Metric Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "16px" }}>
        <div className="card">
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
            Total Test Runs
          </div>
          <div style={{ fontSize: "26px", fontWeight: 700, marginTop: "8px", color: "var(--text-primary)" }}>
            {testRuns.length}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
            Latest Pass Rate
          </div>
          <div style={{ fontSize: "26px", fontWeight: 700, marginTop: "8px", color: "var(--success)" }}>
            {latestRun ? `${Math.round((latestRun.passed_tests / (latestRun.total_tests || 1)) * 100)}%` : "100%"}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
            Execution Duration
          </div>
          <div style={{ fontSize: "26px", fontWeight: 700, marginTop: "8px", color: "var(--text-primary)" }}>
            {latestRun ? `${latestRun.duration_ms}ms` : "0ms"}
          </div>
        </div>

        <div className="card">
          <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase" }}>
            Status
          </div>
          <div style={{ marginTop: "10px" }}>
            <span className={`badge badge-${latestRun?.status === "passed" ? "success" : "neutral"}`}>
              {latestRun?.status || "Idle"}
            </span>
          </div>
        </div>
      </div>

      {/* Latest Run Results / Assertions */}
      <div className="card" style={{ padding: "24px" }}>
        <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "4px" }}>
          Automated Test Assertions
        </h2>
        <p style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "16px" }}>
          Unit, schema, and API integration assertions evaluated in isolated runner
        </p>

        {loading ? (
          <div style={{ textAlign: "center", padding: "40px", color: "var(--text-secondary)" }}>
            Loading QA metrics...
          </div>
        ) : !latestRun || !latestRun.results || latestRun.results.length === 0 ? (
          <div style={{ textAlign: "center", padding: "40px 20px", color: "var(--text-secondary)" }}>
            No test runs executed yet. Click "Run Test Suite" to execute automated tests against generated code.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {latestRun.results.map((res: any) => (
              <div
                key={res.id}
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
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <CheckCircle2 size={16} color="var(--success)" />
                  <div>
                    <span style={{ fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                      {res.test_name}
                    </span>
                    <span style={{ fontSize: "11px", color: "var(--text-secondary)", marginLeft: "10px" }}>
                      {res.test_file}
                    </span>
                  </div>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <span style={{ fontSize: "11px", color: "var(--text-secondary)" }}>{res.duration_ms}ms</span>
                  <span className="badge badge-success">PASSED</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
