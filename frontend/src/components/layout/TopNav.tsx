import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Search,
  Bell,
  Wifi,
  WifiOff,
  Building2,
  Menu,
  LogOut,
  Settings,
  CreditCard,
  FolderKanban,
  Users,
  FileCheck2,
  ChevronDown,
  LogIn,
} from "lucide-react";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";

interface TopNavProps {
  onMenuClick: () => void;
}

const QUICK_PAGES = [
  { name: "Overview Dashboard", path: "/app" },
  { name: "Create New Project", path: "/app/projects/new" },
  { name: "Workflow Studio", path: "/app/workflows" },
  { name: "Code Workspace", path: "/app/code" },
  { name: "Testing & QA", path: "/app/testing" },
  { name: "Security Center", path: "/app/security" },
  { name: "Approvals Center", path: "/app/approvals" },
  { name: "Analytics & ROI", path: "/app/analytics" },
  { name: "Workspace Settings", path: "/app/settings" },
];

export const TopNav: React.FC<TopNavProps> = ({ onMenuClick }) => {
  const { isConnected } = useWebSocket();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [projects, setProjects] = useState<any[]>([]);
  const [agents, setAgents] = useState<any[]>([]);
  const [pendingApprovals, setPendingApprovals] = useState<any[]>([]);

  const searchRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    api.getProjects().then((d) => setProjects(Array.isArray(d) ? d : [])).catch(() => {});
    api.getAgents().then((d) => setAgents(Array.isArray(d) ? d : [])).catch(() => {});
    api.getApprovals(undefined, "pending").then((d) => setPendingApprovals(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  // Close popovers on outside click + Ctrl+K shortcut
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setProfileOpen(false);
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setSearchOpen(true);
        const input = searchRef.current?.querySelector("input");
        input?.focus();
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotifOpen(false);
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  const q = query.trim().toLowerCase();
  const matchedProjects = q ? projects.filter((p) => (p.name || "").toLowerCase().includes(q)).slice(0, 4) : projects.slice(0, 3);
  const matchedAgents = q ? agents.filter((a) => (a.name || "").toLowerCase().includes(q) || (a.display_name || "").toLowerCase().includes(q)).slice(0, 3) : [];
  const matchedPages = q ? QUICK_PAGES.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 4) : QUICK_PAGES.slice(0, 4);

  const initials = (user?.full_name || "PE")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const workspaceLabel = user?.workspace?.name || "SYNAPSE HQ";

  return (
    <header className="app-topnav">
      {/* Left: Mobile Menu + Workspace Badge */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <button
          type="button"
          className="mobile-menu-btn btn-ghost"
          onClick={onMenuClick}
          aria-label="Open menu"
          style={{ padding: 7 }}
        >
          <Menu size={20} />
        </button>

        <Link
          to="/app/settings"
          className="hide-mobile"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 8,
            padding: "5px 11px",
            borderRadius: 8,
            background: "var(--bg-main)",
            border: "1px solid var(--border-color)",
            fontSize: 12.5,
            fontWeight: 600,
            color: "var(--text-primary)",
            textDecoration: "none",
          }}
        >
          <Building2 size={14} color="var(--primary-accent)" />
          <span>{workspaceLabel}</span>
          <span className="badge badge-neutral" style={{ fontSize: 10, padding: "1px 6px" }}>v2.0</span>
        </Link>
      </div>

      {/* Center: Working Global Command Search */}
      <div ref={searchRef} style={{ position: "relative", flex: 1, maxWidth: 420 }}>
        <Search
          size={15}
          color="var(--text-muted)"
          style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}
        />
        <input
          type="text"
          value={query}
          onFocus={() => setSearchOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setSearchOpen(true);
          }}
          placeholder="Search projects, agents, pages... (Ctrl+K)"
          className="input-field"
          style={{
            paddingLeft: 34,
            paddingRight: 12,
            height: 36,
            background: "var(--bg-main)",
            fontSize: 13,
          }}
        />
        {searchOpen && (
          <div
            className="card fade-in"
            style={{
              position: "absolute",
              top: "calc(100% + 6px)",
              left: 0,
              right: 0,
              padding: 8,
              zIndex: 60,
              boxShadow: "var(--shadow-lg)",
              maxHeight: 360,
              overflowY: "auto",
            }}
          >
            {matchedProjects.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", padding: "4px 8px" }}>PROJECTS</div>
                {matchedProjects.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setQuery("");
                      navigate(`/app/projects/${p.id}`);
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "7px 8px",
                      borderRadius: 7,
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: 13,
                    }}
                  >
                    <span style={{ display: "flex", alignItems: "center", gap: 8, fontWeight: 500 }}>
                      <FolderKanban size={14} color="var(--primary-accent)" />
                      {p.name}
                    </span>
                    <span className="badge badge-neutral" style={{ fontSize: 10 }}>{p.status}</span>
                  </button>
                ))}
              </div>
            )}

            {matchedAgents.length > 0 && (
              <div style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", padding: "4px 8px" }}>AGENTS</div>
                {matchedAgents.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => {
                      setSearchOpen(false);
                      setQuery("");
                      navigate("/app/agents");
                    }}
                    style={{
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "7px 8px",
                      borderRadius: 7,
                      border: "none",
                      background: "transparent",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: 13,
                    }}
                  >
                    <Users size={14} color="var(--indigo-accent)" />
                    <span style={{ fontWeight: 500 }}>{a.name}</span>
                    <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{a.display_name}</span>
                  </button>
                ))}
              </div>
            )}

            <div>
              <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--text-muted)", padding: "4px 8px" }}>QUICK NAVIGATION</div>
              {matchedPages.map((pg) => (
                <button
                  key={pg.path}
                  type="button"
                  onClick={() => {
                    setSearchOpen(false);
                    setQuery("");
                    navigate(pg.path);
                  }}
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    padding: "7px 8px",
                    borderRadius: 7,
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    textAlign: "left",
                    fontSize: 13,
                    color: "var(--text-secondary)",
                  }}
                >
                  {pg.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Live Sync, Notifications Popover, Profile Menu */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div
          className="hide-mobile"
          title={isConnected ? "Real-time WebSocket Connected" : "WebSocket Offline / Reconnecting"}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 10px",
            borderRadius: 999,
            background: isConnected ? "var(--success-light)" : "var(--warning-light)",
            color: isConnected ? "var(--success)" : "var(--warning)",
            fontSize: 11.5,
            fontWeight: 600,
          }}
        >
          {isConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{isConnected ? "Live Sync" : "Reconnecting"}</span>
        </div>

        {/* Notifications Bell */}
        <div ref={notifRef} style={{ position: "relative" }}>
          <button
            type="button"
            onClick={() => setNotifOpen((v) => !v)}
            aria-label="Notifications"
            style={{
              width: 36,
              height: 36,
              borderRadius: 9,
              border: "1px solid var(--border-color)",
              background: "rgba(30, 41, 59, 0.7)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              color: "var(--text-secondary)",
              position: "relative",
            }}
          >
            <Bell size={16} />
            {pendingApprovals.length > 0 && (
              <span
                style={{
                  position: "absolute",
                  top: 6,
                  right: 6,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: "var(--warning)",
                  border: "1.5px solid #0F172A",
                }}
              />
            )}
          </button>

          {notifOpen && (
            <div
              className="card fade-in"
              style={{
                position: "absolute",
                right: 0,
                top: "calc(100% + 8px)",
                width: 320,
                padding: 14,
                zIndex: 60,
                boxShadow: "var(--shadow-lg)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
                <span style={{ fontSize: 13, fontWeight: 700 }}>Notifications</span>
                <span className="badge badge-neutral">{pendingApprovals.length} pending</span>
              </div>
              {pendingApprovals.length === 0 ? (
                <div style={{ fontSize: 12.5, color: "var(--text-muted)", padding: "14px 4px", textAlign: "center" }}>
                  All clear! No pending human approval gates.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {pendingApprovals.slice(0, 4).map((ap) => (
                    <button
                      key={ap.id}
                      type="button"
                      onClick={() => {
                        setNotifOpen(false);
                        navigate("/app/approvals");
                      }}
                      style={{
                        textAlign: "left",
                        padding: 10,
                        borderRadius: 8,
                        border: "1px solid var(--border-color)",
                        background: "var(--bg-main)",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600 }}>
                        <FileCheck2 size={14} color="var(--warning)" />
                        <span>{ap.title}</span>
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 3 }}>
                        Requested by {ap.requested_by}
                      </div>
                    </button>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 10, paddingTop: 8, borderTop: "1px solid var(--border-color)", textAlign: "right" }}>
                <Link
                  to="/app/approvals"
                  onClick={() => setNotifOpen(false)}
                  style={{ fontSize: 12, fontWeight: 600, color: "var(--primary-accent)", textDecoration: "none" }}
                >
                  Open Approvals Center →
                </Link>
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown */}
        {isAuthenticated ? (
          <div ref={profileRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setProfileOpen((v) => !v)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 9,
                padding: "4px 8px 4px 4px",
                borderRadius: 10,
                border: "1px solid var(--border-color)",
                background: "rgba(30, 41, 59, 0.7)",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: "var(--primary-light)",
                  color: "var(--primary-accent)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 11.5,
                  fontWeight: 700,
                }}
              >
                {initials}
              </div>
              <div className="hide-mobile" style={{ textAlign: "left", lineHeight: 1.2 }}>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>{user?.full_name}</div>
                <div style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{user?.role || "Admin"}</div>
              </div>
              <ChevronDown size={14} color="var(--text-muted)" className="hide-mobile" />
            </button>

            {profileOpen && (
              <div
                className="card fade-in"
                style={{
                  position: "absolute",
                  right: 0,
                  top: "calc(100% + 8px)",
                  width: 230,
                  padding: 8,
                  zIndex: 60,
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--border-color)", marginBottom: 6 }}>
                  <div style={{ fontSize: 13, fontWeight: 700 }}>{user?.full_name}</div>
                  <div style={{ fontSize: 11.5, color: "var(--text-muted)", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {user?.email}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/app/settings");
                  }}
                  className="btn-ghost"
                  style={{ width: "100%", justifyContent: "flex-start" }}
                >
                  <Settings size={14} /> Workspace Settings
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate("/pricing");
                  }}
                  className="btn-ghost"
                  style={{ width: "100%", justifyContent: "flex-start" }}
                >
                  <CreditCard size={14} /> Plan & Billing
                </button>
                <div style={{ height: 1, background: "var(--border-color)", margin: "6px 0" }} />
                <button
                  type="button"
                  onClick={() => {
                    setProfileOpen(false);
                    logout();
                    navigate("/login");
                  }}
                  className="btn-ghost"
                  style={{ width: "100%", justifyContent: "flex-start", color: "var(--error)" }}
                >
                  <LogOut size={14} /> Sign Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <Link to="/login" className="btn-primary btn-sm">
            <LogIn size={13} /> Sign In
          </Link>
        )}
      </div>
    </header>
  );
};
