import { useCallback, useMemo, useState } from "react";

import SidebarHeader from "./SidebarHeader";
import SidebarNewWorkspace from "../workspace/create/SidebarNewWorkspace";
import SidebarNavigation from "./SidebarNavigation";
import SidebarBoards from "./SidebarBoards";
import SidebarFooter from "./SidebarFooter";
import { SidebarSelectMode } from "./SidebarSelectMode";

import MobileSidebar from "../mobile/MobileSidebar";
import SidebarMobileHeader from "../mobile/SidebarMobileHeader";

import { useWorkspaces } from "@/hooks/dashboard/useWorkspaces";
import { useBoards, BOARDS_LIST_LIMIT } from "@/hooks/dashboard/useBoards";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useSidebarState } from "@/stores/sidebarState";
import { useAuth } from "@/hooks/auth/useAuth";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const noop = () => undefined;

export default function DashboardSidebar({
  collapsed,
  onToggle,
}: DashboardSidebarProps) {
  const { user, logout } = useAuth();
  const { boardsOpen, toggleBoards, openBoards } = useSidebarState();

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

  // Same limit as every other boards consumer so the list shares one query
  // (and one request) across the sidebar, navbar and dashboard.
  const boardsLimit = BOARDS_LIST_LIMIT;

  // useWorkspaces returns { ...query, workspaces } — take the flat array.
  // `data` here is InfiniteData (pages), NOT a Workspace[].
  const { workspaces } = useWorkspaces();

  const { activeWorkspaceId, setActiveWorkspace } = useActiveWorkspace();

  const {
    data: boardsData,
    isLoading: isBoardsLoading,
    isError: isBoardsError,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
  } = useBoards(boardsLimit);

  const boards = useMemo(
    () => boardsData?.pages.flatMap((page) => page.boards) ?? [],
    [boardsData],
  );

  const handleLoadMoreBoards = useCallback(() => {
    if (hasNextPage && !isFetchingNextPage) fetchNextPage();
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleWorkspaceChange = (workspaceId: string) => {
    const workspace = workspaces.find((w) => w.id === workspaceId);
    setActiveWorkspace(workspaceId, workspace?.name ?? "");
    openBoards();
  };

  // Single write path for pins: state + localStorage always in sync.
  const updatePinnedBoards = (next: string[]) => {
    setPinnedBoardIds(next);
    localStorage.setItem("kanban.pinnedBoards", JSON.stringify(next));
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
    updatePinnedBoards([...new Set([...pinnedBoardIds, ...ids])]);
    closeSelectMode();
  };

  const handleBulkDelete = () => {
    // Not wired to the API yet — the delete endpoints now exist
    // (DELETE /boards/:id); hook these up when the boards API is used here.
    closeSelectMode();
  };

  const handlePinBoard = (boardId: string, pinned: boolean) => {
    updatePinnedBoards(
      pinned
        ? [...new Set([...pinnedBoardIds, boardId])]
        : pinnedBoardIds.filter((id) => id !== boardId),
    );
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
          collapsed ? "w-16" : "w-54",
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
            onRenameBoard={noop}
            onShareBoard={noop}
            onDeleteBoard={noop}
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
                  onRename={noop}
                  onShare={noop}
                  onDelete={noop}
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
