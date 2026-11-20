import React, { useEffect, useState, useCallback } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layers, PlusCircle, CheckCircle2, Server } from "lucide-react";
import { api } from "../services/api";
import { ErrorBanner, EmptyState, LoadingSkeleton } from "../components/ui/PageState";

export const ArchitectureIntelligence: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string>(searchParams.get("project") || "");
  const [arch, setArch] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<"topology" | "adrs" | "endpoints" | "schema">("topology");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  const loadArch = useCallback(async (projId: string) => {
    if (!projId) return;
    try {
      const data = await api.getProjectArchitecture(projId);
      setArch(data);
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to load architecture intelligence.");
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
        if (target) return loadArch(target);
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
  }, [loadArch]);

  if (loading) return <LoadingSkeleton rows={2} />;

  if (projects.length === 0) {
    return (
      <EmptyState
        icon={<Layers size={24} />}
        title="No architecture blueprints yet"
        description="Launch a project so the System Architect agent can generate topology diagrams, ADRs, and database schemas."
        action={<Link to="/app/projects/new" className="btn-primary"><PlusCircle size={14} /> New Project</Link>}
      />
    );
  }

  const components = arch?.components || [];
  const adrs = arch?.adrs || [];
  const endpoints = arch?.api_endpoints || [];
  const tables = arch?.database_tables || [];

  return (
    <div className="fade-in" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {errorMsg && <ErrorBanner message={errorMsg} onRetry={() => loadArch(selectedProjectId)} />}

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 800, letterSpacing: "-0.02em" }}>Architecture Intelligence</h1>
          <p style={{ fontSize: 13.5, color: "var(--text-secondary)" }}>
            System topology, Architecture Decision Records (ADRs), API contracts, and data models.
          </p>
        </div>
        <select
          className="input-field"
          style={{ width: 220 }}
          value={selectedProjectId}
          onChange={(e) => {
            setSelectedProjectId(e.target.value);
            setSearchParams({ project: e.target.value });
            loadArch(e.target.value);
          }}
        >
          {projects.map((p) => (
            <option key={p.id} value={p.id}>{p.name}</option>
          ))}
        </select>
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        {[
          { id: "topology", label: `Components (${components.length})` },
          { id: "adrs", label: `ADRs (${adrs.length})` },
          { id: "endpoints", label: `API Contracts (${endpoints.length})` },
          { id: "schema", label: `DB Tables (${tables.length})` },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={activeTab === tab.id ? "btn-primary btn-sm" : "btn-secondary btn-sm"}
            onClick={() => setActiveTab(tab.id as any)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "topology" && (
        <div className="grid-2col">
          {components.map((c: any) => (
            <div key={c.id || c.name} className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Server size={16} color="var(--primary-accent)" />
                  <strong style={{ fontSize: 14.5 }}>{c.name}</strong>
                </div>
                <span className="badge badge-neutral">{c.type || c.layer || "service"}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 8 }}>{c.description || c.responsibility}</p>
              {c.technology && (
                <div style={{ fontSize: 12, fontFamily: "var(--font-mono)", color: "var(--primary-accent)" }}>{c.technology}</div>
              )}
            </div>
          ))}
        </div>
      )}

      {activeTab === "adrs" && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-secondary)" }}>
            {adrs.length} Architecture Decision Record{adrs.length === 1 ? "" : "s"} documented
          </div>
          {adrs.map((adr: any) => (
            <div key={adr.id || adr.title} className="card">
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 6 }}>
                <strong style={{ fontSize: 14.5 }}>{adr.id}: {adr.title}</strong>
                <span className="badge badge-success"><CheckCircle2 size={12} /> {adr.status || "Accepted"}</span>
              </div>
              <p style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 6 }}>{adr.context || adr.rationale}</p>
              {adr.decision && <div style={{ fontSize: 13 }}><strong>Decision:</strong> {adr.decision}</div>}
            </div>
          ))}
        </div>
      )}

      {activeTab === "endpoints" && (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Method</th>
                  <th>Path</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {endpoints.map((ep: any, idx: number) => (
                  <tr key={idx}>
                    <td><span className="badge badge-primary">{ep.method}</span></td>
                    <td style={{ fontFamily: "var(--font-mono)", fontWeight: 600 }}>{ep.path}</td>
                    <td style={{ color: "var(--text-secondary)" }}>{ep.description}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "schema" && (
        <div className="grid-2col">
          {tables.map((t: any, idx: number) => (
            <div key={idx} className="card">
              <h3 style={{ fontSize: 14.5, fontWeight: 700, fontFamily: "var(--font-mono)", marginBottom: 10 }}>
                {t.table_name || t.name}
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 5 }}>
                {(t.columns || []).map((col: any, i: number) => (
                  <div key={i} style={{ fontSize: 12.5, fontFamily: "var(--font-mono)", padding: "5px 8px", borderRadius: 6, background: "var(--bg-main)" }}>
                    {typeof col === "string" ? col : `${col.name} (${col.type})`}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
