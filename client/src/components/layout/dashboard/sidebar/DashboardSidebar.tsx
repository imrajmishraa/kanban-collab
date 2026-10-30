import { useCallback, useEffect, useMemo, useRef, useState } from "react";

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

  /* Hover mode: the rail stays narrow and opens over the page while the
     pointer is inside it. */
  const mode = useSidebarState((state) => state.mode);
  const hovering = useSidebarState((state) => state.hovering);
  const setHovering = useSidebarState((state) => state.setHovering);

  const open = !collapsed || (mode === "hover" && hovering);

  /* Expanded over the page rather than beside it: that is the only case where
     the rail needs to read as a layer. */
  const floating = mode === "hover" && open;

  /* A pointer crossing the edge should not slam the rail shut, so the close is
     delayed just long enough to move between the rail and a panel beside it. */
  const closeTimer = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
  };

  const onRailEnter = () => {
    if (mode !== "hover") return;
    cancelClose();
    setHovering(true);
  };

  const onRailLeave = () => {
    if (mode !== "hover") return;
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setHovering(false);
    }, 140);
  };

  useEffect(() => cancelClose, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [shareBoardId, setShareBoardId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{
    ids: string[];
    label: string;
  } | null>(null);

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
        onClick={!open ? onToggle : undefined}
        onMouseEnter={onRailEnter}
        onMouseLeave={onRailLeave}
        className={[
          /* Visible, not hidden: the rail's own panels are wider than the rail
             and open beside it, over the page. The nav clips itself, so only
             those panels escape. */
          "fixed left-0 top-0 z-40 hidden h-screen flex-col overflow-visible",
          /* One fill in every state: the rail is the page's own surface, and
             what separates it is the hairline. Hovered open the edge firms up
             so it still reads as a layer over the content it covers. */
          "bg-(--bg-root) border-r",
          floating ? "border-orange-50/25" : "border-orange-50/10",
          "transition-[width,border-color] duration-200 ease-out",
          "motion-reduce:transition-none",
          "md:flex",
          open ? "w-64" : "w-16",
        ].join(" ")}
      >
        <div className="shrink-0">
          <SidebarHeader
            collapsed={!open}
            onToggle={onToggle}
            hovering={floating}
          />
        </div>

        <SidebarSearch collapsed={!open} />

        <div className="relative min-h-0 flex-1">
          <div className="h-full overflow-y-auto">
            <SidebarNavigation collapsed={!open} />
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

        {/* mt-auto keeps the strip at the bottom of the column even if a
            sibling above it refuses to shrink. */}
        <div className="shrink-0">
          <SidebarFooter
            collapsed={!open}
            user={user}
            onLogout={handleLogout}
            showSidebarMode={mode !== "collapsed"}
            hoverMode={mode === "hover"}
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
