import { Outlet } from "react-router-dom";

import DashboardSidebar from "@components/layout/dashboard/sidebar/DashboardSidebar";
import DashboardNavbar from "@components/layout/dashboard/workspace/create/DashboardNavbar";
import { NewWorkspaceDialogProvider } from "@components/layout/dashboard/workspace/create/NewWorkspaceDialogProvider";
import { SearchModal } from "@components/layout/dashboard/search/SearchModal";
import { useSidebarState } from "@/stores/sidebarState";

export default function AppLayout() {
  const { collapsed, toggle: toggleSidebar } = useSidebarState();

  return (
    <NewWorkspaceDialogProvider>
      <div className="min-h-screen bg-(--bg-root) text-(--text-primary)">
        <DashboardSidebar collapsed={collapsed} onToggle={toggleSidebar} />

        <main
          className={[
            "flex h-screen flex-col overflow-y-auto",
            "transition-[margin-left] duration-200 ease-out",
            "ml-0 pt-14 md:pt-0",
            collapsed ? "md:ml-18" : "md:ml-64",
          ].join(" ")}
        >
          <DashboardNavbar />
          <div className="flex-1">
            <Outlet />
          </div>
        </main>

        <SearchModal />
      </div>
    </NewWorkspaceDialogProvider>
  );
}
