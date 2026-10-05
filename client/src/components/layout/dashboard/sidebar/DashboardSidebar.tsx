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
import {
  useBoards,
  boardKeys,
  BOARDS_LIST_LIMIT,
} from "@/hooks/dashboard/useBoards";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useSidebarState } from "@/stores/sidebarState";
import { useAuth } from "@/hooks/auth/useAuth";
import { boardApi } from "@/api/dashboard/boardApi";
import { useQueryClient } from "@tanstack/react-query";

import { ShareBoardDialog } from "./ShareBoardDialog";

interface DashboardSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export default function DashboardSidebar({
  collapsed,
  onToggle,
}: DashboardSidebarProps) {
  const { user, logout } = useAuth();
  const { boardsOpen, toggleBoards, openBoards } = useSidebarState();
  const queryClient = useQueryClient();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedBoards, setSelectedBoards] = useState<Set<string>>(new Set());
  const [shareBoardId, setShareBoardId] = useState<string | null>(null);
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
    } catch {
      // Logout failures are non-fatal — the session is cleared locally by
      // the auth store regardless. Swallow rather than log to the console.
    }
  };

  /** Persist a board deletion, then refresh the affected lists. */
  const handleDeleteBoard = async (boardId: string) => {
    try {
      await boardApi.deleteBoard(boardId);
    } finally {
      void queryClient.invalidateQueries({ queryKey: boardKeys.all });
    }
  };

  /** Rename a board (T17), then refresh the affected lists. */
  const handleRenameBoard = async (boardId: string) => {
    const board = boards.find((b) => b.id === boardId);
    const next = window.prompt("Rename board", board?.name ?? "");

    if (!next || !next.trim()) return;

    try {
      await boardApi.updateBoard(boardId, { name: next.trim() });
      void queryClient.invalidateQueries({ queryKey: boardKeys.all });
    } catch {
      // Validation / network failures surface through the API layer; the board
      // simply stays as it was.
    }
  };

  /** Open the share dialog for a board (T14). */
  const handleShareBoard = (boardId: string) => setShareBoardId(boardId);

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

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedBoards);
    await Promise.all(
      ids.map((id) => handleDeleteBoard(id).catch(() => undefined)),
    );
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
            onRenameBoard={handleRenameBoard}
            onShareBoard={handleShareBoard}
            onDeleteBoard={handleDeleteBoard}
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
                  onRename={handleRenameBoard}
                  onShare={handleShareBoard}
                  onDelete={handleDeleteBoard}
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

      {shareBoardId && (
        <ShareBoardDialog
          boardId={shareBoardId}
          boardName={boards.find((b) => b.id === shareBoardId)?.name}
          onClose={() => setShareBoardId(null)}
        />
      )}
    </>
  );
}
