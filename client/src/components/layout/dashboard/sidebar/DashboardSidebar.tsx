import { useState } from "react";

import SidebarHeader from "./SidebarHeader";
import SidebarWorkspace from "./SidebarWorkspace";
import SidebarNavigation from "./SidebarNavigation";
import SidebarBoards from "./SidebarBoards";
import SidebarFooter from "./SidebarFooter";

import MobileSidebar from "../mobile/MobileSidebar";
import SidebarMobileHeader from "../mobile/SidebarMobileHeader";

import { useAuth } from "@/app/providers/AuthProvider";
import { useWorkspaces } from "@/hooks/dashboard/useWorkspaces";
import { useBoards } from "@/hooks/dashboard/useBoards";
import { useActiveWorkspace } from "@/hooks/dashboard/useActiveWorkspace";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function DashboardSidebar({
  collapsed,
  onToggle,
}: DashboardSidebarProps) {
  const { user, logout } = useAuth();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const {
    data: workspaces = [],
    isLoading: isWorkspacesLoading,
    isError: isWorkspacesError,
  } = useWorkspaces();

  const workspaceIds = workspaces.map((workspace) => workspace.id);

  const { activeWorkspaceId, setActiveWorkspaceId } =
    useActiveWorkspace(workspaceIds);

  const {
    data: boards = [],
    isLoading: isBoardsLoading,
    isError: isBoardsError,
  } = useBoards(activeWorkspaceId ?? "");

  const handleSearch = () => {
    // Search dialog will be implemented later.
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <>
      {/* ========================================
          Desktop Sidebar
          ======================================== */}
      <aside
        onClick={collapsed ? onToggle : undefined}
        className={[
          "fixed left-0 top-0 z-40 hidden h-screen flex-col",
          "border-r border-neutral-800 bg-[#080808]",
          "transition-[width] duration-200 ease-out",
          "md:flex",
          collapsed ? "w-18 cursor-e-resize" : "w-64",
        ].join(" ")}
      >
        <SidebarHeader
          collapsed={collapsed}
          onToggle={onToggle}
          onSearch={handleSearch}
        />

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <SidebarWorkspace
            collapsed={collapsed}
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId ?? null}
            onWorkspaceChange={setActiveWorkspaceId}
            isLoading={isWorkspacesLoading}
            isError={isWorkspacesError}
          />

          <SidebarNavigation collapsed={collapsed} />

          <SidebarBoards
            collapsed={collapsed}
            boards={boards}
            isLoading={isBoardsLoading}
            isError={isBoardsError}
          />

          <SidebarFooter
            collapsed={collapsed}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      </aside>

      {/* ========================================
          Mobile Header
          ======================================== */}
      <SidebarMobileHeader
        onMenuClick={() => setMobileMenuOpen(true)}
        onSearch={handleSearch}
      />

      {/* ========================================
          Mobile Sidebar
          ======================================== */}
      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId ?? null}
        onWorkspaceChange={setActiveWorkspaceId}
        isWorkspacesLoading={isWorkspacesLoading}
        isWorkspacesError={isWorkspacesError}
        boards={boards}
        isBoardsLoading={isBoardsLoading}
        isBoardsError={isBoardsError}
        onSearch={handleSearch}
        onLogout={handleLogout}
      />
    </>
  );
}
