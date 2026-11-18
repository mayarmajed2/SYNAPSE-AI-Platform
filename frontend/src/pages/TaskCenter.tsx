import React, { useEffect, useState } from "react";
import { CheckSquare, Search, Filter, RotateCcw } from "lucide-react";
import { api } from "../services/api";

export const TaskCenterPage: React.FC = () => {
  const [tasks, setTasks] = useState<any[]>([]);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchTasks = () => {
    setLoading(true);
    api.getTasks(undefined, statusFilter || undefined)
      .then((data) => {
        setTasks(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetchTasks();
  }, [statusFilter]);

  const handleRetry = async (taskId: string) => {
    try {
      await api.retryTask(taskId);
      fetchTasks();
    } catch (err: any) {
      alert("Failed to retry task: " + err.message);
    }
  };

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) || t.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ maxWidth: "1400px", margin: "0 auto", display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: "22px", fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.4px" }}>
          Task Center
        </h1>
        <p style={{ fontSize: "14px", color: "var(--text-secondary)", marginTop: "2px" }}>
          Unified queue of all autonomous agent subtasks, dependencies, execution durations, and retries.
        </p>
      </div>

      {/* Filter & Search Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          backgroundColor: "#FFFFFF",
          padding: "12px 16px",
          borderRadius: "10px",
          border: "1px solid var(--border-color)",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flex: 1, position: "relative" }}>
          <Search size={16} style={{ position: "absolute", left: "10px", color: "var(--text-secondary)" }} />
          <input
            type="text"
            className="input-field"
            placeholder="Search tasks by title or specification..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ paddingLeft: "34px", height: "36px" }}
          />
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Filter size={15} color="var(--text-secondary)" />
          <select
            className="input-field"
            style={{ width: "160px", height: "36px" }}
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          <button onClick={fetchTasks} className="btn-secondary" style={{ padding: "8px" }} title="Refresh tasks">
            <RotateCcw size={15} />
          </button>
        </div>
      </div>

      {/* Tasks Table */}
      {loading ? (
        <div style={{ textAlign: "center", padding: "60px", color: "var(--text-secondary)" }}>
          Loading task queues...
        </div>
      ) : filteredTasks.length === 0 ? (
        <div
          className="card"
          style={{
            textAlign: "center",
            padding: "60px 20px",
            border: "1px dashed var(--border-color)",
          }}
        >
          <CheckSquare size={40} color="var(--text-secondary)" style={{ margin: "0 auto 12px" }} />
          <h2 style={{ fontSize: "16px", fontWeight: 600, color: "var(--text-primary)" }}>No tasks in queue</h2>
          <p style={{ fontSize: "13px", color: "var(--text-secondary)", marginTop: "4px" }}>
            Tasks are dynamically assigned as projects transition through the multi-agent pipeline.
          </p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ backgroundColor: "#F9FAFB", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                <th style={{ padding: "12px 20px", fontWeight: 600 }}>Task Title</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Priority</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Status</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Retries</th>
                <th style={{ padding: "12px 16px", fontWeight: 600 }}>Created</th>
                <th style={{ padding: "12px 20px", fontWeight: 600, textAlign: "right" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredTasks.map((t) => (
                <tr key={t.id} style={{ borderBottom: "1px solid var(--border-color)" }}>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>{t.title}</div>
                    <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "2px" }}>
                      {t.description}
                    </div>
                    {t.error_message && (
                      <div style={{ fontSize: "11px", color: "var(--error)", marginTop: "4px" }}>
                        Error: {t.error_message}
                      </div>
                    )}
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span className="badge badge-neutral">{t.priority}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <span className={`badge badge-${t.status === "completed" ? "success" : t.status === "failed" ? "error" : "primary"}`}>
                      {t.status}
                    </span>
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--text-secondary)" }}>
                    {t.retry_count} / {t.max_retries}
                  </td>
                  <td style={{ padding: "14px 16px", color: "var(--text-secondary)", fontSize: "12px" }}>
                    {new Date(t.created_at).toLocaleTimeString()}
                  </td>
                  <td style={{ padding: "14px 20px", textAlign: "right" }}>
                    {t.status === "failed" && (
                      <button
                        onClick={() => handleRetry(t.id)}
                        className="btn-secondary"
                        style={{ padding: "4px 8px", fontSize: "11px" }}
                      >
                        <RotateCcw size={12} />
                        <span>Retry</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
