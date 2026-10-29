import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import { WorkspaceSelector } from "../workspace/selector/WorkspaceSelector";
import { BoardSelector } from "../board/selector/BoardSelector";
import { notificationKeys } from "../notifications/index";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useBoardsStore } from "@/stores/boards";
import { useSidebarState } from "@/stores/sidebarState";
import { notificationsApi } from "@/api/dashboard/notificationsApi";
import {
  Chevron,
  DashIcon,
  NavbarSearchIcon,
  NotificationsButton,
} from "../workspace/create/NavbarIcons";
import NotificationsPanel from "../notifications/NotificationsPanel";

export default function DashboardNavbar() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  /* The boards menu is a "where am I" control: it belongs to a board route.
     On the dashboard it listed an arbitrary subset of the active workspace's
     boards, which read as stale, so it is only rendered inside a board. */
  const onBoardRoute = location.pathname.startsWith("/boards/");

  /* The overview is not scoped to one workspace, so the switcher reads
     "All Workspaces" there and reverts to the active name elsewhere. */
  const onOverview = location.pathname === "/dashboard";

  /* The close button only makes sense while a workspace page is open: there it
     means "leave this workspace". Anywhere else it would have nothing to
     close, so it is not rendered at all. */
  const onWorkspaceRoute = location.pathname.startsWith("/workspaces/");

  const currentBoardId = onBoardRoute
    ? (location.pathname.split("/")[2] ?? null)
    : null;

  const setLastBoard = useBoardsStore((s) => s.setLastBoard);
  const [scrolled, setScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      ([entry]) => setScrolled(!entry.isIntersecting),
      { threshold: 0 },
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const {
    activeWorkspaceId,
    activeWorkspaceName,
    setActiveWorkspace,
    clearActiveWorkspace,
  } = useActiveWorkspace();

  /* What the centred title says. The workspace route shows the workspace
     itself, so the header reads as "you are in this workspace".
     Declared after the store hook, which is where the name comes from. */
  const pageTitle = onOverview
    ? "Projects Overview"
    : onWorkspaceRoute
      ? "Workspaces"
      : location.pathname.startsWith("/boards")
        ? "Boards"
        : location.pathname.startsWith("/members")
          ? "Members"
          : location.pathname.startsWith("/notes")
            ? "Notes"
            : null;

  const sidebarCollapsed = useSidebarState((s) => s.collapsed);

  // Lightweight poll for the unread badge. The panel reuses the same key.
  const { data: notificationsData } = useQuery({
    queryKey: notificationKeys.all,
    queryFn: () => notificationsApi.listNotifications(),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />

      <header
        className={[
          "fixed top-0 right-0 z-50 hidden h-14 md:flex",
          "items-center gap-2 px-5 ",
          "transition-[left,background-color] duration-200",
          sidebarCollapsed ? "left-16" : "left-54",
          scrolled ? "bg-(--bg-root)/85 backdrop-blur-md" : "bg-transparent",
        ].join(" ")}
      >
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-0.5"
        >
          <DashIcon />

          <Chevron />

          <WorkspaceSelector
            activeWorkspaceId={onOverview ? null : (activeWorkspaceId ?? null)}
            activeWorkspaceName={
              onOverview ? "All Workspaces" : (activeWorkspaceName ?? null)
            }
            onWorkspaceChange={(id, name) => {
              setActiveWorkspace(id, name);
              // Picking a workspace takes you to its page.
              navigate(`/workspaces/${id}`);
            }}
            // Overview: one pill that opens the list, no close button.
            unified={onOverview}
            // Workspace: the name opens it, the close button (hover only)
            // leaves it for the overview.
            onOpenActive={
              onOverview
                ? undefined
                : () => navigate(`/workspaces/${activeWorkspaceId}`)
            }
            onClose={
              onWorkspaceRoute
                ? () => {
                    // Leaving the workspace clears it, so the next gated page
                    // asks which workspace to use instead of silently reusing
                    // the one that was just closed.
                    clearActiveWorkspace();
                    navigate("/dashboard");
                  }
                : undefined
            }
          />

          {onBoardRoute && (
            <>
              <Chevron />

              {/* Mirrors the workspace switcher. Remounts on workspace change,
                  which also closes its menu. */}
              <BoardSelector
                key={activeWorkspaceId ?? "none"}
                activeBoardId={currentBoardId}
                onSelect={(boardId) => {
                  setLastBoard(boardId);
                  navigate(`/boards/${boardId}`);
                }}
              />
            </>
          )}
        </nav>

        {/* Centred page title: the workspace name inside a workspace, and a
            plain label everywhere else. */}
        {pageTitle && (
          <span className="pointer-events-none absolute left-1/2 max-w-[40%] -translate-x-1/2 truncate text-[12.5px] font-medium tracking-tight text-neutral-300">
            {pageTitle}
          </span>
        )}

        <div className="ml-auto flex items-center justify-end gap-1">
          {/* Always rendered, and always immediately before notifications.
              It used to appear only when the sidebar was collapsed, so the
              button moved around as the rail was toggled. */}
          <NavbarSearchIcon />

          <div ref={bellRef} className="relative">
            <NotificationsButton
              unreadCount={notificationsData?.unreadCount ?? 0}
              onClick={() => setNotificationsOpen((open) => !open)}
            />
            <NotificationsPanel
              open={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
              ignoreRef={bellRef}
            />
          </div>
        </div>
      </header>
    </>
  );
}
