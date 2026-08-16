import { useState } from "react";
import { Outlet } from "react-router-dom";

import DashboardSidebar from "#components/layout/dashboard/DashboardSidebar";

export default function AppLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const handleSidebarToggle = () => {
    setSidebarCollapsed((previous) => !previous);
  };

  return (
    <div className="min-h-screen bg-(--bg-root) text-(--text-primary)">
      <DashboardSidebar
        collapsed={sidebarCollapsed}
        onToggle={handleSidebarToggle}
      />

      <main
        className={[
          "min-h-screen overflow-y-auto",
          "transition-[margin-left] duration-200 ease-out",
          sidebarCollapsed ? "ml-18" : "ml-64",
        ].join(" ")}
      >
        <Outlet />
      </main>
    </div>
  );
}
