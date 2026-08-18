import { Outlet } from "react-router-dom";

import DashboardSidebar from "@components/layout/dashboard/sidebar/DashboardSidebar";
import { useSidebarState } from "@/hooks/dashboard/useSidebarState";

export default function AppLayout() {
  const { collapsed: sidebarCollapsed, toggle: toggleSidebar } =
    useSidebarState();

  return (
    <div className="min-h-screen bg-(--bg-root) text-(--text-primary)">
      <DashboardSidebar collapsed={sidebarCollapsed} onToggle={toggleSidebar} />

      <main
        className={[
          "min-h-screen overflow-y-auto",
          "transition-[margin-left] duration-200 ease-out",
          "ml-0",
          sidebarCollapsed ? "md:ml-18" : "md:ml-64",
        ].join(" ")}
      >
        <Outlet />
      </main>
    </div>
  );
}
  