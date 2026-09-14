import { useState } from "react";

import SidebarHeader from "./SidebarHeader";
import SidebarNewWorkspace from "../workspace/create/SidebarNewWorkspace";
import SidebarNavigation from "./SidebarNavigation";
import SidebarBoards from "./SidebarBoards";
import SidebarFooter from "./SidebarFooter";
import { SidebarSelectMode } from "./SidebarSelectMode";

import MobileSidebar from "../mobile/MobileSidebar";
import SidebarMobileHeader from "../mobile/SidebarMobileHeader";

import { useWorkspaces } from "@/hooks/dashboard/useWorkspaces";
import { useBoards } from "@/hooks/dashboard/useBoards";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useSidebarState } from "@/stores/sidebarState";
import { useAuth } from "@/hooks/auth/useAuth";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function DashboardSidebar({
  collapsed,
  onToggle,
}: DashboardSidebarProps) {
  const { user, logout } = useAuth();
  const { boardsOpen, toggleBoards, setBoardsOpen } = useSidebarState();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedBoards, setSelectedBoards] = useState<Set<string>>(new Set());
  const [pinnedBoardIds, setPinnedBoardIds] = useState<string[]>(() => {
    try {
      return JSON.parse(localStorage.getItem("kanban.pinnedBoards") ?? "[]");
    } catch {
      return [];
    }
  });

  const boardsLimit = 6;

  const { data: workspaces = [] } = useWorkspaces();

  const { activeWorkspaceId, setActiveWorkspace } = useActiveWorkspace();

  const {
    data: boardsData,
    isLoading: isBoardsLoading,
    isError: isBoardsError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useBoards(boardsLimit);

  const boards = boardsData?.pages.flatMap((page) => page.boards) ?? [];

  const handleWorkspaceChange = (workspaceId: string) => {
    const workspace = workspaces.find((w) => w.id === workspaceId);
    setActiveWorkspace(workspaceId, workspace?.name ?? "");
    setBoardsOpen(true);
  };

  const handleLoadMoreBoards = () => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  const toggleBoardSelection = (id: string) => {
    setSelectedBoards((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const closeSelectMode = () => {
    setSelectMode(false);
    setSelectedBoards(new Set());
  };

  const handleBulkPin = (ids: string[]) => {
    const merged = [...new Set([...pinnedBoardIds, ...ids])];
    setPinnedBoardIds(merged);
    localStorage.setItem("kanban.pinnedBoards", JSON.stringify(merged));
    closeSelectMode();
  };

  const handleBulkDelete = (ids: string[]) => {
    console.log("Delete boards:", ids);
    closeSelectMode();
  };

  const handlePinBoard = (boardId: string, pinned: boolean) => {
    const next = pinned
      ? [...new Set([...pinnedBoardIds, boardId])]
      : pinnedBoardIds.filter((id) => id !== boardId);
    setPinnedBoardIds(next);
    localStorage.setItem("kanban.pinnedBoards", JSON.stringify(next));
  };

  return (
    <>
      <aside
        onClick={collapsed && !selectMode ? onToggle : undefined}
        className={[
          "fixed left-0 top-0 z-40 hidden h-screen flex-col",
          "bg-(--bg-surface)",
          "transition-[width] duration-200 ease-out",
          "md:flex",
          collapsed ? "w-18 cursor-e-resize" : "w-64",
        ].join(" ")}
      >
        <div className="shrink-0">
          <SidebarHeader
            collapsed={collapsed}
            onToggle={onToggle}
            toggleLabel={collapsed ? "Expand" : "Collapse"}
          />
        </div>

        {selectMode && !collapsed ? (
          <SidebarSelectMode
            boards={boards}
            selected={selectedBoards}
            onToggle={toggleBoardSelection}
            onClose={closeSelectMode}
            onPin={handleBulkPin}
            onDelete={handleBulkDelete}
            pinnedBoardIds={pinnedBoardIds}
            onPinBoard={(id) => {
              const isPinned = pinnedBoardIds.includes(id);
              handlePinBoard(id, !isPinned);
            }}
            onRenameBoard={(id) => console.log("Rename:", id)}
            onShareBoard={(id) => console.log("Share:", id)}
            onDeleteBoard={(id) => console.log("Delete:", id)}
          />
        ) : (
          <>
            <SidebarNewWorkspace collapsed={collapsed} />

            <div className="relative min-h-0 flex-1">
              <div className="h-full overflow-y-auto">
                <SidebarNavigation collapsed={collapsed} />
                <SidebarBoards
                  key={activeWorkspaceId ?? "none"}
                  collapsed={collapsed}
                  open={boardsOpen}
                  onToggle={toggleBoards}
                  boards={boards}
                  isLoading={isBoardsLoading}
                  isError={isBoardsError}
                  hasNextPage={hasNextPage ?? false}
                  isFetchingNextPage={isFetchingNextPage}
                  onLoadMore={handleLoadMoreBoards}
                  pinnedBoardIds={pinnedBoardIds}
                  onPin={handlePinBoard}
                  onRename={(id) => console.log("Rename:", id)}
                  onShare={(id) => console.log("Share:", id)}
                  onDelete={(id) => console.log("Delete:", id)}
                  onEnterSelectMode={() => setSelectMode(true)}
                />
              </div>

              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-(--bg-surface)"
                style={{
                  maskImage:
                    "linear-gradient(to top, black 40%, transparent 100%)",
                  WebkitMaskImage:
                    "linear-gradient(to top, black 40%, transparent 100%)",
                }}
              />
            </div>

            <div className="shrink-0">
              <SidebarFooter
                collapsed={collapsed}
                user={user}
                onLogout={handleLogout}
              />
            </div>
          </>
        )}
      </aside>

      <SidebarMobileHeader onMenuClick={() => setMobileMenuOpen(true)} />

      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        user={user}
        workspaces={workspaces}
        activeWorkspaceId={activeWorkspaceId ?? null}
        onWorkspaceChange={handleWorkspaceChange}
        boards={boards}
        isBoardsLoading={isBoardsLoading}
        isBoardsError={isBoardsError}
        boardsOpen={boardsOpen}
        onBoardsToggle={toggleBoards}
        hasNextPage={hasNextPage ?? false}
        isFetchingNextPage={isFetchingNextPage}
        onLoadMoreBoards={handleLoadMoreBoards}
        onLogout={handleLogout}
      />
    </>
  );
}
