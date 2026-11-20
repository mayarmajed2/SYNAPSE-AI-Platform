import React from "react";
import { Outlet } from "react-router-dom";
import { TopNav } from "./TopNav";

export const AppLayout: React.FC = () => {
  return (
    <div className="app-shell-editorial">
      <TopNav />
      <main className="app-content">
        <Outlet />
      </main>
    </div>
  );
};
