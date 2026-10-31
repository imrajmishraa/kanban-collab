import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useQuery } from "@tanstack/react-query";

import { WorkspaceSelector } from "@/features/dashboard";
import { notificationKeys } from "@/features/dashboard";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useSidebarState } from "@/features/dashboard";
import { notificationsApi } from "@/features/dashboard";
import { NavbarSearchIcon, NotificationsButton } from "@/features/dashboard";
import { NotificationsPanel } from "@/features/dashboard";

export default function DashboardNavbar() {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();

  /* The overview is not scoped to one workspace, so the switcher reads
     "All Workspaces" there and reverts to the active name elsewhere. */
  const onOverview = location.pathname === "/workspaces";

  /* The workspace page itself. Used for the page title, and for deciding
     whether closing the workspace has to leave the page. */
  const onWorkspaceRoute = location.pathname.startsWith("/workspaces/");

  const [scrolled, setScrolled] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  /* Store reads come before the effects that close over them, so nothing is
     referenced above its declaration. */
  const {
    activeWorkspaceId,
    activeWorkspaceName,
    setActiveWorkspace,
    clearActiveWorkspace,
  } = useActiveWorkspace();

  const sidebarCollapsed = useSidebarState((s) => s.collapsed);

  /*
   * With nothing selected there is no workspace to scope the breadcrumb to, so
   * the switcher collapses to the same "All Workspaces" pill the overview uses
   * — on every route, not just /dashboard. Without this, a gated page such as
   * /boards rendered an empty breadcrumb while it asked you to pick one.
   */
  const showAllWorkspaces = onOverview || !activeWorkspaceId;

  /* `N` opens notifications from anywhere on the page, the way `F` opens Find
     in the sidebar. Skipped while the caret is in a field, and when a modifier
     is held, so typing a name never pops the panel. */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "n") return;
      if (event.metaKey || event.ctrlKey || event.altKey || event.shiftKey) {
        return;
      }

      const target = event.target as HTMLElement | null;
      const tag = target?.tagName.toLowerCase();

      if (
        tag === "input" ||
        tag === "textarea" ||
        tag === "select" ||
        target?.isContentEditable
      ) {
        return;
      }

      event.preventDefault();
      setNotificationsOpen(true);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

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

  /* What the centred title says. The workspace route shows the workspace
     itself, so the header reads as "you are in this workspace". */
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
          sidebarCollapsed ? "left-18" : "left-64",
          scrolled ? "bg-(--bg-root)/85 backdrop-blur-md" : "bg-transparent",
        ].join(" ")}
      >
        <nav
          aria-label="Breadcrumb"
          className="flex min-w-0 items-center gap-0.5"
        >
          <WorkspaceSelector
            activeWorkspaceId={
              showAllWorkspaces ? null : (activeWorkspaceId ?? null)
            }
            activeWorkspaceName={
              showAllWorkspaces
                ? "All Workspaces"
                : (activeWorkspaceName ?? null)
            }
            onWorkspaceChange={(id, name) => {
              setActiveWorkspace(id, name);
              // Picking a workspace takes you to its page.
              navigate(`/workspaces/${id}`);
            }}
            // One pill that opens the list, no close button.
            unified={showAllWorkspaces}
            // Workspace: the name opens it, the close button leaves it.
            onOpenActive={
              showAllWorkspaces
                ? undefined
                : () => navigate(`/workspaces/${activeWorkspaceId}`)
            }

            onClose={
              !showAllWorkspaces && activeWorkspaceId
                ? () => {
                    clearActiveWorkspace();

                    if (onWorkspaceRoute) {
                      navigate("/workspaces", { replace: true });
                    }
                  }
                : undefined
            }
          />
        </nav>

        {/* Centred page title: the workspace name inside a workspace, and a
            plain label everywhere else. */}
        {pageTitle && (
          <span className="pointer-events-none absolute left-1/2 max-w-[40%] -translate-x-1/2 truncate text-[12.5px] font-medium tracking-tight text-(--text-soft)">
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
