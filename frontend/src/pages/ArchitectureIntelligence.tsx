import React, { useEffect, useState } from "react";
import {
  Layers,
  Database,
  Globe,
  FileCode,
  Share2,
} from "lucide-react";
import { api } from "../services/api";

export const ArchitectureIntelligencePage: React.FC = () => {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>("");
  const [archData, setArchData] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"topology" | "schema" | "contracts" | "adrs">("topology");

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
    api.getProjectArchitecture(selectedProjectId)
      .then((data) => {
        setArchData(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedProjectId]);

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
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
            Architecture Intelligence & Systems Topology
          </h1>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "2px" }}>
            Interactive component boundaries, relational schemas, API contracts, and Architecture Decision Records (ADRs).
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
        </div>
      </div>

      {/* Navigation Tabs */}
      <div style={{ display: "flex", gap: "6px", borderBottom: "1px solid var(--border-color)", paddingBottom: "2px" }}>
        {[
          { key: "topology", label: "Service Topology", icon: Layers },
          { key: "schema", label: `Database ER Model (${archData?.entities?.length || 0})`, icon: Database },
          { key: "contracts", label: `API Contracts (${archData?.endpoints?.length || 0})`, icon: Globe },
          { key: "adrs", label: `Architecture Decision Records (${archData?.adrs?.length || 0})`, icon: FileCode },
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
                padding: "10px 18px",
                fontSize: "13px",
                fontWeight: isActive ? 600 : 500,
                color: isActive ? "var(--primary-accent)" : "var(--text-secondary)",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: isActive ? "2px solid var(--primary-accent)" : "2px solid transparent",
                cursor: "pointer",
                transition: "all 0.12s ease",
              }}
            >
              <Icon size={15} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-secondary)" }}>
          Compiling architecture intelligence...
        </div>
      ) : !archData ? (
        <div className="card" style={{ padding: "40px", textAlign: "center", color: "var(--text-secondary)" }}>
          No architectural specifications found for this project.
        </div>
      ) : (
        <>
          {/* Tab 1: Service Topology */}
          {activeTab === "topology" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {/* Architecture Blueprint Card */}
              <div className="card" style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                  <div>
                    <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                      Component Architecture Diagram
                    </h2>
                    <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                      Decoupled service tiers and interaction boundaries designed by Marcus Aurelius (System Architect)
                    </p>
                  </div>
                  <span className="badge badge-primary">Active Blueprint</span>
                </div>

                {/* Visual Topology Nodes Flow */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "16px", margin: "16px 0" }}>
                  {archData.components?.map((comp: any) => (
                    <div
                      key={comp.id}
                      style={{
                        padding: "18px",
                        borderRadius: "10px",
                        border: "1px solid var(--border-color)",
                        backgroundColor: "#FAFAFA",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "var(--primary-accent)" }}>
                          {comp.type}
                        </span>
                        <span className="badge badge-success">{comp.status}</span>
                      </div>
                      <h3 style={{ fontSize: "14px", fontWeight: 700, color: "var(--text-primary)" }}>{comp.name}</h3>
                      <div style={{ fontSize: "12px", color: "var(--text-secondary)", fontFamily: "var(--font-mono)" }}>
                        {comp.tech}
                      </div>
                      <div style={{ borderTop: "1px solid var(--border-color)", paddingTop: "8px" }}>
                        <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", marginBottom: "4px" }}>
                          Responsibilities:
                        </div>
                        <ul style={{ margin: 0, paddingLeft: "16px", fontSize: "11px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                          {comp.responsibilities?.map((r: string, idx: number) => (
                            <li key={idx}>{r}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Inter-Component Network Connections */}
              <div className="card" style={{ padding: "24px" }}>
                <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)", marginBottom: "12px" }}>
                  Service Communication Protocols & Data Contracts
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  {archData.connections?.map((conn: any, idx: number) => (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        backgroundColor: "#FFFFFF",
                        border: "1px solid var(--border-color)",
                        borderRadius: "8px",
                        fontSize: "13px",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{conn.from}</span>
                        <Share2 size={14} color="var(--primary-accent)" />
                        <span style={{ fontWeight: 600, color: "var(--text-primary)" }}>{conn.to}</span>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
                        <span className="badge badge-primary">{conn.protocol}</span>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{conn.nature}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Database Schema & ER Model */}
          {activeTab === "schema" && (
            <div className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                    Relational Database Entities & Schemas
                  </h2>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    PostgreSQL 16 relational tables with types, primary keys, and relations
                  </p>
                </div>
                <span className="badge badge-neutral">ACID Compliant</span>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
                {archData.entities?.map((table: any, idx: number) => (
                  <div
                    key={idx}
                    style={{
                      border: "1px solid var(--border-color)",
                      borderRadius: "10px",
                      overflow: "hidden",
                      backgroundColor: "#FFFFFF",
                    }}
                  >
                    <div style={{ padding: "12px 16px", backgroundColor: "#F9FAFB", borderBottom: "1px solid var(--border-color)", display: "flex", alignItems: "center", gap: "8px" }}>
                      <Database size={15} color="var(--primary-accent)" />
                      <span style={{ fontWeight: 700, fontSize: "14px", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
                        {table.table_name}
                      </span>
                    </div>

                    <div style={{ padding: "14px 16px" }}>
                      <div style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)", textTransform: "uppercase", marginBottom: "8px" }}>
                        Columns & Attributes
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        {table.columns?.map((col: string, cidx: number) => (
                          <div
                            key={cidx}
                            style={{
                              padding: "6px 10px",
                              backgroundColor: "#FAFAFA",
                              borderRadius: "6px",
                              fontSize: "12px",
                              fontFamily: "var(--font-mono)",
                              color: "var(--text-primary)",
                              display: "flex",
                              justifyContent: "space-between",
                            }}
                          >
                            <span>{col}</span>
                            {col.includes("PK") && <span className="badge badge-primary">PK</span>}
                          </div>
                        ))}
                      </div>

                      <div style={{ marginTop: "12px", paddingTop: "8px", borderTop: "1px solid var(--border-color)", fontSize: "11px", color: "var(--text-secondary)" }}>
                        Relationships: <strong>{table.relationships}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: API Contracts */}
          {activeTab === "contracts" && (
            <div className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                    REST API Contracts & Endpoints
                  </h2>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Standardized FastAPI endpoints with HTTP verbs, path definitions, and schema bounds
                  </p>
                </div>
                <span className="badge badge-success">OpenAPI v3.1</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {archData.endpoints?.map((ep: any, idx: number) => {
                  const methodColor =
                    ep.method === "GET" ? "badge-primary" : ep.method === "POST" ? "badge-success" : "badge-warning";
                  return (
                    <div
                      key={idx}
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        padding: "12px 16px",
                        borderRadius: "8px",
                        border: "1px solid var(--border-color)",
                        backgroundColor: "#FAFAFA",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                        <span className={`badge ${methodColor}`} style={{ width: "50px", textAlign: "center" }}>
                          {ep.method}
                        </span>
                        <span style={{ fontFamily: "var(--font-mono)", fontSize: "13px", fontWeight: 600, color: "var(--text-primary)" }}>
                          {ep.path}
                        </span>
                      </div>
                      <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                        {ep.description}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tab 4: Architecture Decision Records (ADRs) */}
          {activeTab === "adrs" && (
            <div className="card" style={{ padding: "24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                <div>
                  <h2 style={{ fontSize: "16px", fontWeight: 700, color: "var(--text-primary)" }}>
                    Architecture Decision Records (ADRs)
                  </h2>
                  <p style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
                    Formal technical trade-offs, architectural decisions, and consequences recorded by the System Architect
                  </p>
                </div>
                <span className="badge badge-success">4 Decisions Accepted</span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {archData.adrs?.map((adr: any) => (
                  <div
                    key={adr.id}
                    style={{
                      padding: "18px 20px",
                      borderRadius: "10px",
                      border: "1px solid var(--border-color)",
                      backgroundColor: "#FAFAFA",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span className="badge badge-neutral">{adr.id}</span>
                        <h3 style={{ fontSize: "15px", fontWeight: 700, color: "var(--text-primary)" }}>{adr.title}</h3>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>{adr.date}</span>
                        <span className="badge badge-success">{adr.status}</span>
                      </div>
                    </div>

                    <div style={{ fontSize: "13px", color: "var(--text-primary)", lineHeight: "1.5", marginBottom: "8px" }}>
                      <strong>Decision: </strong>{adr.decision}
                    </div>

                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", lineHeight: "1.4" }}>
                      <strong>Consequences: </strong>{adr.consequences}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};
