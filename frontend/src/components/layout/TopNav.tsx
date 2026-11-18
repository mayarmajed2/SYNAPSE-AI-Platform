import React from "react";
import { Search, Bell, Building2, Wifi, WifiOff } from "lucide-react";
import { useWebSocket } from "../../hooks/useWebSocket";

export const TopNav: React.FC = () => {
  const { isConnected } = useWebSocket();

  return (
    <header
      style={{
        height: "64px",
        backgroundColor: "var(--bg-card)",
        borderBottom: "1px solid var(--border-color)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 28px",
        position: "sticky",
        top: 0,
        zIndex: 20,
      }}
    >
      {/* Workspace Selector */}
      <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            padding: "6px 12px",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            backgroundColor: "#FAFAFA",
            fontSize: "13px",
            fontWeight: 600,
            color: "var(--text-primary)",
          }}
        >
          <Building2 size={16} color="var(--primary-accent)" />
          <span>SYNAPSE HQ</span>
          <span style={{ fontSize: "10px", color: "var(--text-secondary)", fontWeight: 500 }}>v1.0</span>
        </div>
      </div>

      {/* Global Search Bar */}
      <div style={{ display: "flex", alignItems: "center", width: "380px", position: "relative" }}>
        <Search
          size={16}
          style={{ position: "absolute", left: "12px", color: "var(--text-secondary)", pointerEvents: "none" }}
        />
        <input
          type="text"
          placeholder="Search projects, agent tasks, artifacts..."
          className="input-field"
          style={{ paddingLeft: "36px", height: "36px" }}
        />
      </div>

      {/* System Status, Notifications & Profile */}
      <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {/* Live WebSocket Status */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "6px",
            fontSize: "12px",
            padding: "4px 10px",
            borderRadius: "20px",
            backgroundColor: isConnected ? "var(--success-light)" : "var(--warning-light)",
            color: isConnected ? "var(--success)" : "var(--warning)",
            fontWeight: 500,
          }}
          title={isConnected ? "Real-time WebSocket streaming active" : "Attempting reconnect..."}
        >
          {isConnected ? <Wifi size={13} /> : <WifiOff size={13} />}
          <span>{isConnected ? "Live Sync" : "Reconnecting"}</span>
        </div>

        {/* Notifications Icon */}
        <button
          style={{
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            border: "1px solid var(--border-color)",
            backgroundColor: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            color: "var(--text-secondary)",
          }}
        >
          <Bell size={17} />
        </button>

        {/* User Profile */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
          <div
            style={{
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              backgroundColor: "#E2E8F0",
              color: "#334155",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontWeight: 600,
              fontSize: "12px",
            }}
          >
            PE
          </div>
          <div style={{ fontSize: "12px", lineHeight: "1.2" }}>
            <div style={{ fontWeight: 600, color: "var(--text-primary)" }}>Principal Eng</div>
            <div style={{ color: "var(--text-secondary)", fontSize: "11px" }}>Workspace Owner</div>
          </div>
        </div>
      </div>
    </header>
  );
};

