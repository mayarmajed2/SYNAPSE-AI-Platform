import React, { useEffect, useState } from "react";
import { NavLink, Link } from "react-router-dom";
import {
  LayoutDashboard,
  FolderKanban,
  PlusCircle,
  Users,
  GitBranch,
  CheckSquare,
  Code2,
  FlaskConical,
  ShieldAlert,
  FileCheck2,
  BarChart3,
  History,
  Settings,
  Cpu,
  Layers,
  GitPullRequest,
  FileText,
  X,
  Sparkles,
} from "lucide-react";
import { api } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const [agentCount, setAgentCount] = useState<number | null>(null);
  const [pendingApprovals, setPendingApprovals] = useState<number>(0);

  useEffect(() => {
    api.getAgents().then((list) => setAgentCount(Array.isArray(list) ? list.length : null)).catch(() => {});
    api
      .getApprovals(undefined, "pending")
      .then((list) => setPendingApprovals(Array.isArray(list) ? list.length : 0))
      .catch(() => {});
  }, []);

  const navGroups = [
    {
      label: "WORKSPACE",
      items: [
        { name: "Overview", path: "/app", icon: LayoutDashboard, end: true },
        { name: "New Project", path: "/app/projects/new", icon: PlusCircle },
        { name: "Projects", path: "/app/projects", icon: FolderKanban },
        { name: "Agent Workforce", path: "/app/agents", icon: Users, badge: agentCount !== null ? String(agentCount) : undefined },
      ],
    },
    {
      label: "BUILD & VERIFY",
      items: [
        { name: "Workflow Studio", path: "/app/workflows", icon: GitBranch },
        { name: "Task Center", path: "/app/tasks", icon: CheckSquare },
        { name: "Code Workspace", path: "/app/code", icon: Code2 },
        { name: "Testing & QA", path: "/app/testing", icon: FlaskConical },
        { name: "Security Center", path: "/app/security", icon: ShieldAlert },
      ],
    },
    {
      label: "GOVERNANCE & OPS",
      items: [
        {
          name: "Approvals",
          path: "/app/approvals",
          icon: FileCheck2,
          badge: pendingApprovals > 0 ? String(pendingApprovals) : undefined,
          badgeWarn: pendingApprovals > 0,
        },
        { name: "Architecture", path: "/app/architecture", icon: Layers },
        { name: "Git & Releases", path: "/app/git", icon: GitPullRequest },
        { name: "Delivery Reports", path: "/app/reports", icon: FileText },
      ],
    },
    {
      label: "OBSERVABILITY",
      items: [
        { name: "Analytics", path: "/app/analytics", icon: BarChart3 },
        { name: "Audit Logs", path: "/app/audit", icon: History },
        { name: "Settings", path: "/app/settings", icon: Settings },
      ],
    },
  ];

  const planName = (user?.workspace?.plan || "pro").toUpperCase();

  return (
    <aside className={`app-sidebar ${isOpen ? "open" : ""}`}>
      {/* Brand Header */}
      <div
        style={{
          height: "var(--topnav-height)",
          padding: "0 18px",
          borderBottom: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 9,
              background: "linear-gradient(135deg, #2563EB 0%, #4F46E5 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#FFFFFF",
              boxShadow: "0 2px 6px rgba(37, 99, 235, 0.25)",
            }}
          >
            <Cpu size={17} />
          </div>
          <div>
            <div style={{ fontSize: 15, fontWeight: 800, color: "var(--text-primary)", letterSpacing: "-0.02em", lineHeight: 1.1 }}>
              SYNAPSE
            </div>
            <div style={{ fontSize: 9.5, fontWeight: 700, color: "var(--text-muted)", letterSpacing: "0.06em" }}>
              AUTONOMOUS AI ENG
            </div>
          </div>
        </Link>
        <button
          type="button"
          className="mobile-menu-btn btn-ghost"
          onClick={onClose}
          aria-label="Close navigation"
          style={{ padding: 6 }}
        >
          <X size={18} />
        </button>
      </div>

      {/* Navigation Groups */}
      <nav style={{ flex: 1, overflowY: "auto", padding: "14px 10px" }}>
        {navGroups.map((group) => (
          <div key={group.label} style={{ marginBottom: 18 }}>
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "var(--text-muted)",
                letterSpacing: "0.07em",
                padding: "0 10px 6px",
              }}
            >
              {group.label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={Boolean((item as any).end)}
                    style={({ isActive }) => ({
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "8px 10px",
                      borderRadius: 8,
                      textDecoration: "none",
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "var(--primary-accent)" : "var(--text-secondary)",
                      backgroundColor: isActive ? "var(--primary-light)" : "transparent",
                      transition: "all 0.14s ease",
                    })}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 9 }}>
                      <Icon size={16} strokeWidth={1.85} />
                      <span>{item.name}</span>
                    </span>
                    {item.badge && (
                      <span
                        className={`badge ${(item as any).badgeWarn ? "badge-warning" : "badge-neutral"}`}
                        style={{ padding: "1px 7px", fontSize: 10.5 }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* Plan & Workforce Footer */}
      <div style={{ padding: "12px 14px", borderTop: "1px solid var(--border-color)", background: "rgba(15, 23, 42, 0.65)" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7 }}>
            <span className="pulse-indicator" />
            <span style={{ fontSize: 12, fontWeight: 600, color: "var(--text-primary)" }}>
              {agentCount !== null ? `${agentCount} Agents Ready` : "Workforce Fleet"}
            </span>
          </div>
          <span className="badge badge-violet" style={{ fontSize: 10, padding: "1px 7px" }}>
            {planName}
          </span>
        </div>
        <Link
          to="/pricing"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 6,
            padding: "7px 10px",
            borderRadius: 8,
            background: "rgba(59, 130, 246, 0.12)",
            border: "1px solid rgba(59, 130, 246, 0.28)",
            fontSize: 12,
            fontWeight: 600,
            color: "#93C5FD",
            textDecoration: "none",
          }}
        >
          <Sparkles size={13} color="#60A5FA" />
          Manage Plan & Billing
        </Link>
      </div>
    </aside>
  );
};
