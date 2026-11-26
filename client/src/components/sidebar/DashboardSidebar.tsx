import { lazy, useCallback, useEffect, useMemo, useRef, useState } from "react";

import SidebarHeader from "./SidebarHeader";

export const SidebarNavigation = lazy(() => import("./SidebarNavigation"));
export const SidebarSearch = lazy(() => import("./SidebarSearch"));
export const SidebarFooter = lazy(() => import("./SidebarFooter"));

export const MobileSidebar = lazy(
  () => import("@/components/sidebar/mobile/MobileSidebar"),
);

import SidebarMobileHeader from "@/components/sidebar/mobile/SidebarMobileHeader";
import SidebarNotifications from "@/components/sidebar/SidebarNotifications";

import { useWorkspaces } from "@/hooks/useWorkspaces";
import { useBoards, boardKeys, BOARDS_LIST_LIMIT } from "@/hooks/useBoards";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { cn } from "@/utils/cn";
import { RAIL, useRailLayout, useSidebarState } from "@/features/dashboard";
import RailResizeHandle from "./RailResizeHandle";
import { useRightPanel } from "@/stores/rightPanel";
import { useAuth } from "@/hooks/useAuth";
import { boardApi } from "@/features/boards";
import { useQueryClient } from "@tanstack/react-query";

import { ShareBoardDialog } from "./ShareBoardDialog";
import ConfirmDialog from "@/components/dialog/ConfirmDialog";

interface DashboardSidebarProps {
  onToggle: () => void;
  /**
   * Tablet only: the rail stepped aside because the column and the board needed its width.
   * The rail is not hidden — a 72px strip stands in for it, one click away.
   */
  stripped?: boolean;
  /**
   * The layout spike only: rendered inside an `Allotment` pane, so the pane owns
   * the position and the width. `fixed` would escape the pane, and the rail's own
   * divider would fight the sash. Default false keeps `AppLayout` untouched.
   */
  embedded?: boolean;
}

export default function DashboardSidebar({
  onToggle,
  stripped = false,
  embedded = false,
}: DashboardSidebarProps) {
  const { user, logout } = useAuth();
  const { boardsOpen, toggleBoards, openBoards } = useSidebarState();
  const queryClient = useQueryClient();

  /* Hover mode: the rail stays narrow and opens over the page while the
     pointer is inside it. */
  const mode = useSidebarState((state) => state.mode);
  const setHovering = useSidebarState((state) => state.setHovering);
  const setWidth = useSidebarState((state) => state.setWidth);

  /* The column, if it is on screen: its width is what the rail's drag pays out of. */
  const panelOpen = useRightPanel((state) => state.mode !== "off");
  const panelWidth = useRightPanel((state) => state.width);
  const setPanelWidth = useRightPanel((state) => state.setWidth);
  const hide = useSidebarState((state) => state.hide);
  const setResizing = useSidebarState((state) => state.setResizing);

  /* One computation decides the width; `AppLayout` reads the same one so the
     page reserves exactly what the rail takes. */
  const layout = useRailLayout();
  const { railWidth } = layout;

  /* Labels only fit above the icon rail. */
  /*
   * "Open" is anything wider than the icon rail — never "wider than MIN".
   *
   * MIN is where the rail opens, so `railWidth > RAIL.MIN` is false at exactly 240
   * and every child was told `collapsed` while the rail itself was 240px wide:
   * labels hidden, header and footer off-centre, a gap where the labels belong.
   */
  const open = railWidth > RAIL.COLLAPSED;

  /* Expanded over the page rather than beside it: that is the only case where
     the rail needs to read as a layer. */
  const floating = layout.hoverOpen;

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
    /* Collapsed is one preview away from being readable: the pointer arriving opens
       it over the page, leaving puts the icons back. */
    if (mode !== "collapsed") return;
    cancelClose();
    setHovering(true);
  };

  const onRailLeave = () => {
    if (mode !== "collapsed") return;
    cancelClose();
    closeTimer.current = window.setTimeout(() => {
      closeTimer.current = null;
      setHovering(false);
    }, 140);
  };

  useEffect(() => cancelClose, []);

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /* The inbox sheet. Its bell is in the bar above, so the state lives here with
     both of them — and the sheet is rendered here, not in the bar, because the
     bar's `backdrop-blur` would become its containing block. */
  const [notificationsOpen, setNotificationsOpen] = useState(false);
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

  if (stripped) {
    return (
      <button
        type="button"
        onClick={onToggle}
        aria-label="Show sidebar"
        aria-controls="app-rail"
        className={cn(
          "sticky top-0 z-40 hidden h-dvh w-18 shrink-0 flex-col items-center",
          "gap-2 border-r border-(--hairline) bg-(--bg-panel) pt-3 md:flex",
          "pb-[env(safe-area-inset-bottom)]",
          "cursor-pointer hover:bg-(--bg-hover)",
        )}
      >
        <span className="grid size-6 place-items-center rounded-md bg-(--brand)" />
        <span className="font-mono text-[13px] text-(--text-muted)">›</span>
      </button>
    );
  }

  return (
    <>
      <aside
        id="app-rail"
        /* A zero-width rail is not "invisible": it needs `overflow-visible`
           for its own panels, so at width 0 it would keep painting them. Take
           it off the page instead of just narrowing it. */
        hidden={!embedded && railWidth === 0}
        /* A3: a click on the rail no longer opens it. The preview is a glance, not a
           control — and a rail that opens on any click inside it opens by accident. */
        onMouseEnter={onRailEnter}
        onMouseLeave={onRailLeave}
        /* A6: a keyboard reader gets the same preview the pointer does. Focus leaving the
           rail — not moving between its own items — is what closes it. */
        onFocus={onRailEnter}
        onBlur={(event) => {
          if (
            !event.currentTarget.contains(event.relatedTarget as Node | null)
          ) {
            onRailLeave();
          }
        }}
        /* Embedded: fill the pane, except while a preview is open — then the
           sidebar paints at its preview width over the page, which is what the
           collapsed strip is for. Filling the pane the rest of the time keeps the
           edge glued to the divider during a drag. */
        style={{ width: embedded && !floating ? "100%" : railWidth }}
        className={[
          /* Visible, not hidden: the rail's own panels are wider than the rail
             and open beside it, over the page. The nav clips itself, so only
             those panels escape. */
          embedded
            ? "relative flex h-full w-full flex-col overflow-hidden select-none"
            : "fixed left-0 top-0 hidden h-dvh flex-col overflow-visible",
          /* The navbar is z-50 and keeps its collapsed offset, so a rail that
             floats over the page has to sit above it or the two overlap. */
          floating ? "z-60" : "z-40",
          /* Embedded, the group's separator already draws the edge — a border
             here too was a second line, one pixel apart from the first. */
          embedded
            ? "bg-(--bg-root)"
            : "bg-(--bg-root) border-r border-(--hairline)",
          "transition-[width,border-color] duration-200 ease-out",
          "motion-reduce:transition-none",
          "md:flex",
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

        {/* The divider lives inside the rail so it follows the width, but sits
            on the border itself. */}
        {/* Hover mode is a preview, not a size: a drag there would fight the pointer that
            is opening it. The divider is not rendered, so there is nothing to grab. */}
        {/* A2: the divider belongs to a column, not to the icon rail. On 72px there is
            nothing to grab, so nothing is drawn — a line you cannot drag is a lie. */}
        {!embedded && railWidth > RAIL.COLLAPSED && !floating && (
          <RailResizeHandle
            renderedWidth={railWidth}
            width={layout.width}
            onWidth={setWidth}
            panelWidth={panelOpen ? panelWidth : undefined}
            onPanelWidth={setPanelWidth}
            onHide={hide}
            /* Touching the divider must change nothing: a press that never
               becomes a drag has to be a no-op, or the rail opens the moment you
               aim at the border. The rail is promoted only once the pointer
               actually moves into the expanded range. */
            onResizeStart={() => {
              setHovering(false);
              setResizing(true);

              /*
               * A drag is a deliberate resize, so hover mode has to become open
               * — otherwise the rail keeps rendering as a hover overlay, the
               * pointer leaves, and the width only ever changes while the cursor
               * is over the rail. Collapsed is *not* promoted here: a press that
               * never becomes a drag must stay a no-op.
               */
            }}
            onResizeEnd={() => {
              setHovering(false);
              setResizing(false);
            }}
          />
        )}

        {/* mt-auto keeps the strip at the bottom of the column even if a
            sibling above it refuses to shrink. */}
        <div className="shrink-0">
          <SidebarFooter
            collapsed={!open}
            user={user}
            onLogout={handleLogout}
            /* Always offered, including collapsed: that is the state you need
               it in to get back out of. */
            showSidebarMode
            hoverMode={floating}
          />
        </div>
      </aside>

      <SidebarMobileHeader
        menuOpen={mobileMenuOpen}
        onMenuClick={() => setMobileMenuOpen((value) => !value)}
        notificationsOpen={notificationsOpen}
        onToggleNotifications={() => {
          setMobileMenuOpen(false);
          setNotificationsOpen((value) => !value);
        }}
      />

      <SidebarNotifications
        open={notificationsOpen}
        onClose={() => setNotificationsOpen(false)}
      />

      <MobileSidebar
        open={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        onOpenNotifications={() => {
          setMobileMenuOpen(false);
          setNotificationsOpen(true);
        }}
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
