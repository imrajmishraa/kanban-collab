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
  const [boardsOpen, setBoardsOpen] = useState(false);

  const boardsLimit = 20;

  // ---------------------------------------------------------------------------
  // Workspaces
  // ---------------------------------------------------------------------------

  const {
    data: workspaces = [],
    isLoading: isWorkspacesLoading,
    isError: isWorkspacesError,
  } = useWorkspaces();

  const workspaceIds = workspaces.map((workspace) => workspace.id);

  const { activeWorkspaceId, setActiveWorkspaceId } =
    useActiveWorkspace(workspaceIds);

  // ---------------------------------------------------------------------------
  // Boards
  // ---------------------------------------------------------------------------

  const {
    data: boardsData,
    isLoading: isBoardsLoading,
    isError: isBoardsError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useBoards(activeWorkspaceId ?? "", boardsLimit);

  // Flatten all loaded pages into one board list.
  const boards =
    boardsData?.pages.flatMap((page) => page.boards) ?? [];

  // ---------------------------------------------------------------------------
  // Handlers
  // ---------------------------------------------------------------------------

  const handleBoardsToggle = () => {
    setBoardsOpen((previous) => !previous);
  };

  const handleWorkspaceChange = (workspaceId: string) => {
    setActiveWorkspaceId(workspaceId);

    // Close boards when changing workspace.
    setBoardsOpen(false);
  };

  const handleLoadMoreBoards = () => {
    if (hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  };

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

  // Render

  return (
    <>
      {/* Desktop Sidebar */}

      <aside
        onClick={collapsed ? onToggle : undefined}
        className={[
          "fixed left-0 top-0 z-40 hidden h-screen flex-col",
          "border-r border-(--border) bg-(--bg-surface)",
          "transition-[width] duration-200 ease-out",
          "md:flex",
          collapsed
            ? "w-18 cursor-e-resize"
            : "w-64",
        ].join(" ")}
      >
        {/* Header */}
        <div className="shrink-0">
          <SidebarHeader
            collapsed={collapsed}
            onToggle={onToggle}
            onSearch={handleSearch}
          />
        </div>

        {/* Workspace */}
        <div className="shrink-0">
          <SidebarWorkspace
            collapsed={collapsed}
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId ?? null}
            onWorkspaceChange={handleWorkspaceChange}
            isLoading={isWorkspacesLoading}
            isError={isWorkspacesError}
          />
        </div>

        {/* Scrollable / flexible content */}
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Navigation */}
          <div className="max-h-40 shrink-0 overflow-y-auto">
            <SidebarNavigation collapsed={collapsed} />
          </div>

          {/* Boards */}
          <SidebarBoards
            collapsed={collapsed}
            open={boardsOpen}
            onToggle={handleBoardsToggle}
            boards={boards}
            isLoading={isBoardsLoading}
            isError={isBoardsError}
            hasNextPage={hasNextPage ?? false}
            isFetchingNextPage={isFetchingNextPage}
            onLoadMore={handleLoadMoreBoards}
          />
        </div>

        {/* ALWAYS AT BOTTOM */}
        <div className="shrink-0 border-t border-(--border)">
          <SidebarFooter
            collapsed={collapsed}
            user={user}
            onLogout={handleLogout}
          />
        </div>
      </aside>

      {/* Mobile Header */}

      <SidebarMobileHeader
        onMenuClick={() => setMobileMenuOpen(true)}
        onSearch={handleSearch}
      />

      {/* Mobile Sidebar */}

      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId ?? null}
        onWorkspaceChange={handleWorkspaceChange}
        isWorkspacesLoading={isWorkspacesLoading}
        isWorkspacesError={isWorkspacesError}
        boards={boards}
        isBoardsLoading={isBoardsLoading}
        isBoardsError={isBoardsError}
        boardsOpen={boardsOpen}
        onBoardsToggle={handleBoardsToggle}
        hasNextPage={hasNextPage ?? false}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMoreBoards={handleLoadMoreBoards}
        onSearch={handleSearch}
        onLogout={handleLogout}
      />
    </>
  );
};
