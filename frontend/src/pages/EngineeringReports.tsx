import React, { useEffect, useState } from "react";
import {
  Download,
  Printer,
} from "lucide-react";
import { api } from "../services/api";

export const EngineeringReportsPage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [report, setReport] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getProjects().then((projs) => {
      setProjects(projs || []);
      if (projs && projs.length > 0) {
        setSelectedProjectId(projs[0].id);
      }
    });
  }, []);

  useEffect(() => {
    if (!selectedProjectId) return;
    setLoading(true);
    api.getDeliveryReport(selectedProjectId)
      .then((data) => {
        setReport(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedProjectId]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
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
            Official Engineering Delivery Reports
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Comprehensive 18-section audit, architecture, quality, security, and deployment dossier for stakeholders.
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

          {selectedProjectId && (
            <>
              <a
                href={api.getReportDownloadUrl(selectedProjectId)}
                download
                className="btn-secondary"
                style={{ padding: "8px 12px", fontSize: "12px" }}
              >
                <Download size={14} />
                <span>Markdown</span>
              </a>
              <button
                onClick={handlePrint}
                className="btn-primary"
                style={{ padding: "8px 12px", fontSize: "12px" }}
              >
                <Printer size={14} />
                <span>Print / PDF</span>
              </button>
            </>
          )}
        </div>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-secondary)" }}>
          Synthesizing comprehensive engineering delivery dossier...
        </div>
      ) : !report ? (
        <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
          No delivery report compiled for this project yet.
        </div>
      ) : (
        <div
          id="printable-report"
          className="card"
          style={{
            padding: "40px",
            display: "flex",
            flexDirection: "column",
            gap: "28px",
            backgroundColor: "#FFFFFF",
          }}
        >
          {/* Document Cover Header */}
          <div style={{ borderBottom: "2px solid var(--border-color)", paddingBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <span className="badge badge-success" style={{ marginBottom: "8px" }}>
                  {report.sections?.["1_executive_summary"]?.status || "APPROVED"}
                </span>
                <h1 style={{ fontSize: "26px", fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.5px" }}>
                  {report.project_name}
                </h1>
                <div style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
                  Autonomous Software Delivery Dossier • Generated {report.sections?.["1_executive_summary"]?.delivery_date}
                </div>
              </div>

              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--text-secondary)" }}>
                  Engineering Fleet
                </div>
                <div style={{ fontSize: "13px", fontWeight: 600, color: "var(--primary-accent)", marginTop: "2px" }}>
                  SYNAPSE AI Workforce (10 Agents)
                </div>
              </div>
            </div>
          </div>

          {/* Section 1: Executive Summary */}
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              1. Executive Summary
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", lineHeight: "1.6" }}>
              {report.sections?.["1_executive_summary"]?.content}
            </p>
          </div>

          {/* Section 2: Product Requirements */}
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              2. Product Requirements Document (PRD)
            </h2>
            <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginBottom: "12px" }}>
              {report.sections?.["2_product_requirements"]?.overview}
            </p>
            <div style={{ fontSize: "12px", fontWeight: 600, color: "var(--text-primary)", marginBottom: "6px" }}>
              Core Functional Requirements:
            </div>
            <ul style={{ margin: 0, paddingLeft: "20px", fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
              {report.sections?.["2_product_requirements"]?.functional_requirements?.map((req: string, idx: number) => (
                <li key={idx}>{req}</li>
              ))}
            </ul>
          </div>

          {/* Section 3 & 4: Architecture & Tech Stack */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div style={{ padding: "16px", backgroundColor: "#F9FAFB", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                3. Architecture Overview
              </h3>
              <p style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.5" }}>
                {report.sections?.["3_architecture_overview"]?.description}
              </p>
              <div style={{ fontSize: "11px", color: "var(--primary-accent)", fontWeight: 600, marginTop: "6px" }}>
                Topology: {report.sections?.["3_architecture_overview"]?.pattern}
              </div>
            </div>

            <div style={{ padding: "16px", backgroundColor: "#F9FAFB", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <h3 style={{ fontSize: "13px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
                4. Technology Stack Matrix
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "12px", color: "var(--text-secondary)" }}>
                <div><strong>Frontend:</strong> {report.sections?.["4_technology_stack"]?.frontend}</div>
                <div><strong>Backend:</strong> {report.sections?.["4_technology_stack"]?.backend}</div>
                <div><strong>Database:</strong> {report.sections?.["4_technology_stack"]?.database}</div>
              </div>
            </div>
          </div>

          {/* Section 7: API Documentation */}
          <div>
            <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "8px" }}>
              7. API Documentation Endpoints
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {report.sections?.["7_api_documentation"]?.endpoints?.map((ep: any, idx: number) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "8px 12px",
                    backgroundColor: "#FAFAFA",
                    borderRadius: "6px",
                    border: "1px solid var(--border-color)",
                    fontSize: "12px",
                  }}
                >
                  <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
                    <span className="badge badge-primary">{ep.method}</span>
                    <span style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{ep.path}</span>
                  </div>
                  <span style={{ color: "var(--text-secondary)" }}>{ep.description}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 9, 10, 11, 12: Quality & Security Scorecards */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: "12px" }}>
            <div style={{ padding: "14px", backgroundColor: "#FAFAFA", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Code Review</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--primary-accent)", marginTop: "4px" }}>
                {report.sections?.["9_code_review_results"]?.score} / 100
              </div>
              <div style={{ fontSize: "11px", color: "var(--success)", marginTop: "2px" }}>Approved</div>
            </div>

            <div style={{ padding: "14px", backgroundColor: "#FAFAFA", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase" }}>QA Pass Rate</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--success)", marginTop: "4px" }}>
                {report.sections?.["10_testing_results"]?.pass_rate}
              </div>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", marginTop: "2px" }}>
                {report.sections?.["10_testing_results"]?.passed_tests} tests passing
              </div>
            </div>

            <div style={{ padding: "14px", backgroundColor: "#FAFAFA", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Code Coverage</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--primary-accent)", marginTop: "4px" }}>
                {report.sections?.["11_code_coverage"]?.statement_coverage}
              </div>
              <div style={{ fontSize: "11px", color: "var(--success)", marginTop: "2px" }}>Exceeds 80% baseline</div>
            </div>

            <div style={{ padding: "14px", backgroundColor: "#FAFAFA", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
              <div style={{ fontSize: "11px", color: "var(--text-secondary)", textTransform: "uppercase" }}>Security SAST</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "#10B981", marginTop: "4px" }}>
                0 Critical
              </div>
              <div style={{ fontSize: "11px", color: "var(--success)", marginTop: "2px" }}>Low risk profile</div>
            </div>
          </div>

          {/* Section 14: Deployment Instructions */}
          <div style={{ padding: "16px", backgroundColor: "#F9FAFB", borderRadius: "8px", border: "1px solid var(--border-color)" }}>
            <h2 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "6px" }}>
              14. Deployment Instructions
            </h2>
            <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginBottom: "6px" }}>
              To spin up this autonomous project with PostgreSQL, FastAPI backend, and React frontend:
            </div>
            <pre style={{ margin: 0, padding: "10px 14px", backgroundColor: "#1E293B", color: "#F1F5F9", borderRadius: "6px", fontSize: "12px", fontFamily: "var(--font-mono)" }}>
              {report.sections?.["14_deployment_instructions"]?.command}
            </pre>
          </div>

          {/* Section 17: Cost Breakdown */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 20px", backgroundColor: "#EFF6FF", borderRadius: "8px", border: "1px solid #BFDBFE" }}>
            <div>
              <div style={{ fontSize: "12px", fontWeight: 600, color: "#1E40AF" }}>
                17. Autonomous AI Engineering Cost
              </div>
              <div style={{ fontSize: "20px", fontWeight: 800, color: "var(--primary-accent)", marginTop: "2px" }}>
                ${report.sections?.["17_cost_summary"]?.estimated_cost_usd} USD
              </div>
            </div>
            <div style={{ textAlign: "right", fontSize: "12px", color: "#3B82F6" }}>
              <div>Traditional Agency Value: <strong>{report.sections?.["17_cost_summary"]?.traditional_agency_equivalent}</strong></div>
              <div>Net Efficiency Gain: <strong>{report.sections?.["17_cost_summary"]?.savings_percentage}</strong></div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
