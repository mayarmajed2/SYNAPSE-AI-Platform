import React from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  PlusCircle,
  FolderGit2,
  Users2,
  Workflow,
  CheckSquare,
  Code2,
  FlaskConical,
  ShieldCheck,
  BarChart3,
  ScrollText,
  Settings,
  Cpu,
  Layers,
  GitPullRequest,
  FileCheck2,
  FileSpreadsheet,
} from "lucide-react";

interface NavGroup {
  label: string;
  items: {
    name: string;
    path: string;
    icon: React.ComponentType<{ className?: string; size?: number }>;
    badge?: string;
  }[];
}

const NAV_GROUPS: NavGroup[] = [
  {
    label: "Core",
    items: [
      { name: "Overview", path: "/", icon: LayoutDashboard },
      { name: "New Project", path: "/projects/new", icon: PlusCircle },
      { name: "Projects", path: "/projects", icon: FolderGit2 },
      { name: "Agent Workforce", path: "/workforce", icon: Users2, badge: "10" },
    ],
  },
  {
    label: "Engineering",
    items: [
      { name: "Workflow Studio", path: "/workflow-studio", icon: Workflow },
      { name: "Task Center", path: "/tasks", icon: CheckSquare },
      { name: "Code Workspace", path: "/workspace", icon: Code2 },
      { name: "Testing & QA", path: "/testing", icon: FlaskConical },
      { name: "Security Center", path: "/security", icon: ShieldCheck },
    ],
  },
  {
    label: "Governance & Ops",
    items: [
      { name: "Architecture Intel", path: "/architecture", icon: Layers },
      { name: "Approvals Center", path: "/approvals", icon: FileCheck2 },
      { name: "Git & Releases", path: "/git-releases", icon: GitPullRequest },
      { name: "Delivery Reports", path: "/reports", icon: FileSpreadsheet },
    ],
  },
  {
    label: "Observability",
    items: [
      { name: "Analytics", path: "/analytics", icon: BarChart3 },
      { name: "Activity Logs", path: "/audit-logs", icon: ScrollText },
      { name: "Settings", path: "/settings", icon: Settings },
    ],
  },
];

export const Sidebar: React.FC = () => {
  return (
    <aside
      style={{
        width: "255px",
        minWidth: "255px",
        backgroundColor: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: "20px 22px",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          borderBottom: "1px solid var(--border-color)",
        }}
      >
        <div
          style={{
            width: "32px",
            height: "32px",
            borderRadius: "8px",
            backgroundColor: "var(--primary-accent)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#ffffff",
          }}
        >
          <Cpu size={18} />
        </div>
        <div>
          <span style={{ fontWeight: 700, fontSize: "16px", letterSpacing: "-0.3px", color: "var(--text-primary)" }}>
            SYNAPSE
          </span>
          <span
            style={{
              display: "block",
              fontSize: "10px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.8px",
              color: "var(--text-secondary)",
            }}
          >
            Autonomous AI Eng
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <nav style={{ flex: 1, padding: "14px 10px", overflowY: "auto", display: "flex", flexDirection: "column", gap: "16px" }}>
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <div
              style={{
                fontSize: "10px",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.8px",
                color: "var(--text-secondary)",
                padding: "4px 12px 6px",
              }}
            >
              {group.label}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    end={item.path === "/"}
                    style={({ isActive }) => ({
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      padding: "8px 12px",
                      borderRadius: "7px",
                      fontSize: "13px",
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "var(--primary-accent)" : "var(--text-secondary)",
                      backgroundColor: isActive ? "var(--primary-light)" : "transparent",
                      textDecoration: "none",
                      transition: "all 0.12s ease",
                    })}
                  >
                    <Icon size={17} />
                    <span style={{ flex: 1 }}>{item.name}</span>
                    {item.badge && (
                      <span
                        style={{
                          fontSize: "10px",
                          fontWeight: 700,
                          padding: "1px 6px",
                          borderRadius: "10px",
                          backgroundColor: "#E2E8F0",
                          color: "var(--text-primary)",
                        }}
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

      {/* System Status Footer */}
      <div
        style={{
          padding: "14px 18px",
          borderTop: "1px solid var(--border-color)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
          backgroundColor: "#FAFAFA",
        }}
      >
        <span className="pulse-indicator" />
        <div style={{ fontSize: "11px" }}>
          <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>Workforce Fleet Active</div>
          <div style={{ color: "var(--text-secondary)" }}>10 Specialized Agents Ready</div>
        </div>
      </div>
    </aside>
  );
};
