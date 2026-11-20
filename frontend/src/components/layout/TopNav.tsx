import React, { useState, useEffect, useRef } from "react";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Search,
  Bell,
  Menu,
  X,
  LogOut,
  Settings,
  CreditCard,
  LogIn,
  ArrowUpRight,
} from "lucide-react";
import { useWebSocket } from "../../hooks/useWebSocket";
import { useAuth } from "../../context/AuthContext";
import { api } from "../../services/api";
import { SynapseLogo } from "../ui/SynapseLogo";

const PRIMARY_NAV = [
  { name: "Overview", path: "/app", end: true },
  { name: "Projects", path: "/app/projects" },
  { name: "Agents", path: "/app/agents" },
  { name: "Workflows", path: "/app/workflows" },
];

const SECONDARY_RAIL = [
  { name: "New Project", path: "/app/projects/new" },
  { name: "Tasks", path: "/app/tasks" },
  { name: "Code", path: "/app/code" },
  { name: "QA & Tests", path: "/app/testing" },
  { name: "Security", path: "/app/security" },
  { name: "Approvals", path: "/app/approvals" },
  { name: "Architecture", path: "/app/architecture" },
  { name: "Git & PRs", path: "/app/git" },
  { name: "Reports", path: "/app/reports" },
  { name: "Analytics", path: "/app/analytics" },
  { name: "Audit Log", path: "/app/audit" },
  { name: "Settings", path: "/app/settings" },
];

export const TopNav: React.FC = () => {
  const { isConnected } = useWebSocket();
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [mobileOpen, setMobileOpen] = useState(false);
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

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

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
        searchRef.current?.querySelector("input")?.focus();
      }
      if (e.key === "Escape") {
        setSearchOpen(false);
        setNotifOpen(false);
        setProfileOpen(false);
        setMobileOpen(false);
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
  const allQuickPages = [...PRIMARY_NAV, ...SECONDARY_RAIL];
  const matchedPages = q ? allQuickPages.filter((p) => p.name.toLowerCase().includes(q)).slice(0, 5) : SECONDARY_RAIL.slice(0, 4);

  const initials = (user?.full_name || "PE")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <>
      <header className="app-topnav">
        {/* Left: Sleek Modern Brand Mark + Floating Pill Nav */}
        <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
          <Link to="/" style={{ textDecoration: "none", display: "inline-flex", alignItems: "center" }}>
            <SynapseLogo size={32} showWordmark />
          </Link>

          <nav
            className="desktop-rail"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: 4,
              borderRadius: 12,
              background: "#13161E",
              border: "1px solid var(--border-color)",
            }}
          >
            {PRIMARY_NAV.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                end={Boolean(item.end)}
                style={({ isActive }) => ({
                  padding: "6px 14px",
                  fontSize: 13,
                  fontWeight: isActive ? 600 : 500,
                  textDecoration: "none",
                  borderRadius: 8,
                  color: isActive ? "#0A0B0E" : "var(--text-secondary)",
                  backgroundColor: isActive ? "#FFFFFF" : "transparent",
                  transition: "all 0.15s ease",
                })}
              >
                {item.name}
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Right: Search, Live Pill, Bell, Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div ref={searchRef} className="hide-mobile" style={{ position: "relative", width: 230 }}>
            <Search
              size={14}
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
              placeholder="Search... (Ctrl+K)"
              className="input-field"
              style={{ paddingLeft: 32, height: 34, fontSize: 12.5, borderRadius: 10 }}
            />
            {searchOpen && (
              <div
                className="card fade-in"
                style={{
                  position: "absolute",
                  top: "calc(100% + 8px)",
                  right: 0,
                  width: 320,
                  padding: 8,
                  zIndex: 70,
                  boxShadow: "var(--shadow-lg)",
                }}
              >
                {matchedProjects.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div className="mono-label" style={{ padding: "4px 10px", fontSize: 11 }}>Projects</div>
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
                          padding: "8px 10px",
                          border: "none",
                          borderRadius: 8,
                          background: "transparent",
                          color: "var(--text-primary)",
                          cursor: "pointer",
                          textAlign: "left",
                          fontSize: 13,
                        }}
                      >
                        <span>{p.name}</span>
                        <span className="badge badge-neutral">{p.status}</span>
                      </button>
                    ))}
                  </div>
                )}
                {matchedAgents.length > 0 && (
                  <div style={{ marginBottom: 8 }}>
                    <div className="mono-label" style={{ padding: "4px 10px", fontSize: 11 }}>Agents</div>
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
                          justifyContent: "space-between",
                          padding: "8px 10px",
                          border: "none",
                          borderRadius: 8,
                          background: "transparent",
                          color: "var(--text-primary)",
                          cursor: "pointer",
                          textAlign: "left",
                          fontSize: 13,
                        }}
                      >
                        <strong>{a.name}</strong>
                        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>{a.display_name}</span>
                      </button>
                    ))}
                  </div>
                )}
                <div>
                  <div className="mono-label" style={{ padding: "4px 10px", fontSize: 11 }}>Quick Jump</div>
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
                        justifyContent: "space-between",
                        padding: "7px 10px",
                        border: "none",
                        borderRadius: 8,
                        background: "transparent",
                        cursor: "pointer",
                        textAlign: "left",
                        fontSize: 13,
                        color: "var(--text-secondary)",
                      }}
                    >
                      <span>{pg.name}</span>
                      <ArrowUpRight size={13} />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div
            className="hide-mobile"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "5px 11px",
              borderRadius: 999,
              background: isConnected ? "var(--success-light)" : "var(--warning-light)",
              color: isConnected ? "var(--success)" : "#FBBF24",
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            <span className="pulse-indicator" style={{ backgroundColor: isConnected ? "var(--success)" : "#F59E0B" }} />
            {isConnected ? "Live" : "Syncing"}
          </div>

          <div ref={notifRef} style={{ position: "relative" }}>
            <button
              type="button"
              onClick={() => setNotifOpen((v) => !v)}
              aria-label="Notifications"
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: "1px solid var(--border-color)",
                background: "#161922",
                color: "var(--text-secondary)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                position: "relative",
              }}
            >
              <Bell size={15} />
              {pendingApprovals.length > 0 && (
                <span style={{ position: "absolute", top: 6, right: 6, width: 6, height: 6, borderRadius: "50%", background: "var(--primary-accent)" }} />
              )}
            </button>
            {notifOpen && (
              <div className="card fade-in" style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 310, padding: 14, zIndex: 70, boxShadow: "var(--shadow-lg)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>Notifications</span>
                  <span className="badge badge-neutral">{pendingApprovals.length} pending</span>
                </div>
                {pendingApprovals.length === 0 ? (
                  <div style={{ fontSize: 12.5, color: "var(--text-muted)", padding: "12px 0" }}>
                    You're all caught up. No pending approvals.
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
                          borderRadius: 10,
                          border: "1px solid var(--border-color)",
                          background: "#161922",
                          color: "var(--text-primary)",
                          cursor: "pointer",
                        }}
                      >
                        <div style={{ fontSize: 12.5, fontWeight: 600 }}>{ap.title}</div>
                        <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{ap.requested_by}</div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {isAuthenticated ? (
            <div ref={profileRef} style={{ position: "relative" }}>
              <button
                type="button"
                onClick={() => setProfileOpen((v) => !v)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 8,
                  height: 34,
                  padding: "0 12px 0 5px",
                  border: "1px solid var(--border-color)",
                  borderRadius: 999,
                  background: "#161922",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                  fontSize: 12.5,
                  fontWeight: 600,
                }}
              >
                <span
                  style={{
                    width: 24,
                    height: 24,
                    borderRadius: "50%",
                    background: "var(--primary-light)",
                    color: "var(--primary-accent)",
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  {initials}
                </span>
                <span className="hide-mobile">{user?.full_name?.split(" ")[0]}</span>
              </button>

              {profileOpen && (
                <div className="card fade-in" style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 225, padding: 8, zIndex: 70, boxShadow: "var(--shadow-lg)" }}>
                  <div style={{ padding: "8px 10px", borderBottom: "1px solid var(--border-color)", marginBottom: 6 }}>
                    <div style={{ fontSize: 13, fontWeight: 700 }}>{user?.full_name}</div>
                    <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>{user?.email}</div>
                  </div>
                  <button type="button" className="btn-ghost" style={{ width: "100%", justifyContent: "flex-start" }} onClick={() => { setProfileOpen(false); navigate("/app/settings"); }}>
                    <Settings size={14} /> Settings
                  </button>
                  <button type="button" className="btn-ghost" style={{ width: "100%", justifyContent: "flex-start" }} onClick={() => { setProfileOpen(false); navigate("/pricing"); }}>
                    <CreditCard size={14} /> Plan · {(user?.workspace?.plan || "pro").toUpperCase()}
                  </button>
                  <div style={{ height: 1, background: "var(--border-color)", margin: "6px 0" }} />
                  <button type="button" className="btn-ghost" style={{ width: "100%", justifyContent: "flex-start", color: "var(--error)" }} onClick={() => { setProfileOpen(false); logout(); navigate("/login"); }}>
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

          <button type="button" className="mobile-menu-btn btn-secondary btn-sm" onClick={() => setMobileOpen(true)} aria-label="Open menu" style={{ padding: 7 }}>
            <Menu size={16} />
          </button>
        </div>
      </header>

      {/* Sleek Contextual Sub-Rail */}
      <nav className="app-subrail desktop-rail" aria-label="Workspace modules">
        {SECONDARY_RAIL.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            style={({ isActive }) => ({
              padding: "6px 12px",
              fontSize: 12.5,
              fontWeight: isActive ? 600 : 500,
              borderRadius: 8,
              textDecoration: "none",
              whiteSpace: "nowrap",
              color: isActive ? "var(--primary-accent)" : "var(--text-secondary)",
              background: isActive ? "var(--primary-light)" : "transparent",
              transition: "all 0.14s ease",
            })}
          >
            {item.name}
          </NavLink>
        ))}
      </nav>

      {/* Mobile Drawer */}
      <div className={`mobile-drawer ${mobileOpen ? "open" : ""}`}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 18, borderBottom: "1px solid var(--border-color)" }}>
          <span style={{ fontSize: 18, fontWeight: 800 }}>Synapse</span>
          <button type="button" onClick={() => setMobileOpen(false)} style={{ background: "none", border: "none", color: "#FFFFFF", cursor: "pointer" }} aria-label="Close">
            <X size={22} />
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 16 }}>
          {allQuickPages.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={Boolean((item as any).end)}
              style={({ isActive }) => ({
                padding: "11px 14px",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: isActive ? 600 : 500,
                textDecoration: "none",
                color: isActive ? "var(--primary-accent)" : "var(--text-primary)",
                background: isActive ? "var(--primary-light)" : "transparent",
              })}
            >
              {item.name}
            </NavLink>
          ))}
        </div>
      </div>
    </>
  );
};
