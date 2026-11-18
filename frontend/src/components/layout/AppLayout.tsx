import React from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { TopNav } from "./TopNav";

export const AppLayout: React.FC = () => {
  return (
    <div style={{ display: "flex", minHeight: "100vh", backgroundColor: "var(--bg-main)" }}>
      {/* Persistent Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        <TopNav />
        <main style={{ flex: 1, padding: "28px 32px", overflowY: "auto" }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

