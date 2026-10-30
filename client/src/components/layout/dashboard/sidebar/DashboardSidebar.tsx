import { useCallback, useMemo, useState } from "react";

import SidebarHeader from "./SidebarHeader";
import SidebarNavigation from "./SidebarNavigation";
import SidebarSearch from "./SidebarSearch";
import SidebarFooter from "./SidebarFooter";

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
import ConfirmDialog from "@components/ui/dialog/ConfirmDialog";

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
  const [shareBoardId, setShareBoardId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    ids: string[];
    label: string;
  } | null>(null);
  // const [pinnedBoardIds, setPinnedBoardIds] = useState<string[]>(() => {
  //   try {
  //     return JSON.parse(localStorage.getItem("kanban.pinnedBoards") ?? "[]");
  //   } catch {
  //     return [];
  //   }
  // });

  // Same limit as every other boards consumer so the list shares one query
  // (and one request) across the sidebar, navbar and dashboard.
  const boardsLimit = BOARDS_LIST_LIMIT;

  // useWorkspaces returns { ...query, workspaces } , so take the flat array.
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

  const handleLogout = async () => {
    try {
      await logout();
    } catch {
      // Logout failures are non-fatal: the session is cleared locally by
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

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    const { ids } = pendingDelete;
    setPendingDelete(null);
    await Promise.all(
      ids.map((id) => handleDeleteBoard(id).catch(() => undefined)),
    );
  };

  return (
    <>
      <aside
        onClick={collapsed ? onToggle : undefined}
        className={[
          "fixed left-0 top-0 z-40 hidden h-screen flex-col",
          /* Same colour as the page it sits beside. The hairline is what
             separates them now that the fill no longer does. */
          "bg-(--bg-root) border-r border-orange-50/10",
          "transition-[width] duration-200 ease-out",
          "md:flex",
          collapsed ? "w-16" : "w-64",
        ].join(" ")}
      >
        <div className="shrink-0">
          <SidebarHeader
            collapsed={collapsed}
            onToggle={onToggle}
            toggleLabel={collapsed ? "Expand" : "Collapse"}
          />
        </div>

        <SidebarSearch collapsed={collapsed} />

        <div className="relative min-h-0 flex-1">
          <div className="h-full overflow-y-auto">
            <SidebarNavigation collapsed={collapsed} />
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-10 bg-(--bg-root)"
            style={{
              maskImage: "linear-gradient(to top, black 40%, transparent 100%)",
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

      {pendingDelete && (
        <ConfirmDialog
          open
          title="Delete board"
          message={pendingDelete.label}
          confirmLabel="Delete"
          destructive
          onConfirm={() => {
            void confirmDelete();
          }}
          onCancel={() => setPendingDelete(null)}
        />
      )}
    </>
  );
}
