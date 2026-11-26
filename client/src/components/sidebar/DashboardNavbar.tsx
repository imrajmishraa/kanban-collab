import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { WorkspaceSelector } from "@/features/dashboard";
import { useNotifications } from "@/features/dashboard/hooks/useNotifications";
import { useActiveWorkspace } from "@/stores/activeWorkspace";
import { useSidebarState } from "@/features/dashboard";
import { useRightPanel } from "@/stores/rightPanel";
import { NavbarSearchIcon, NotificationsButton } from "@/features/dashboard";
import { NotificationsPanel } from "@/features/dashboard";
import { Tooltip } from "@/components/Tooltips/ToolTip";
import { PanelLeftIcon, PanelRightIcon } from "@hugeicons/core-free-icons";
import { HugeiconsIcon } from "@hugeicons/react";

const isMac =
  typeof navigator !== "undefined" &&
  /Mac|iPhone|iPad|iPod/.test(navigator.platform);

interface DashboardNavbarProps {
  /**
   * Rendered inside a shell that already places the rail and the column, so the
   * header stops being `fixed` and stops offsetting itself by `--rail-width` —
   * the pane next to it is the offset. Default false: `AppLayout` is unchanged.
   */
  embedded?: boolean;
}

export default function DashboardNavbar({
  embedded = false,
}: DashboardNavbarProps = {}) {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const bellRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const setMode = useSidebarState((state) => state.setMode);

  const sidebarMode = useSidebarState((s) => s.mode);

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

  /* The right column's only affordance, on screen in both states — a toggle that
     only appears while the panel is closed makes people hunt for it. */
  const rightPanelOpen = useRightPanel((state) => state.mode) !== "off";
  const toggleRightPanel = useRightPanel((state) => state.toggle);

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

  /* The badge polls, so a notification that arrives while you are on a board
     updates the bell without a reload. The panel reuses the same key. */
  const { data: notificationsData } = useNotifications();

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" className="h-px w-full" />

      <header
        className={[
          embedded
            ? /* In the shell the panes are the offsets. */
              "relative z-30 flex h-12 w-full shrink-0"
            : [
                "fixed top-0 right-0 z-50 hidden h-12 md:flex",
                /* Ends where the right column begins instead of running under it. */
                "lg:right-(--panel-width)",
                /* Same variable the layout reserves, so the navbar follows the rail
                   at any width instead of two fixed offsets. */
                "md:left-(--rail-width)",
              ].join(" "),
          "items-center gap-1.5 px-3",
          "transition-[left,background-color] duration-200",
          scrolled ? "border-b border-(--hairline)" : "",
          scrolled ? "bg-(--bg-root)/85 backdrop-blur-md" : "bg-transparent",
        ].join(" ")}
      >
        {/* hidden all the time only  visible when in hidden mode*/}
        {sidebarMode === "hidden" ? (
          <div className="flex h-12 shrink-0 items-center justify-between gap-2.5 px">
            <div className="flex shrink-0 items-center gap-1">
              <Tooltip
                label="Expand sidebar"
                highlight={isMac ? "⌘B" : "Ctrl B"}
                side="bottom"
                shape="solid"
                size="md"
              >
                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation();
                    setMode("open");
                  }}
                  aria-label="Expand sidebar"
                  className="
                    group relative flex size-8 cursor-pointer
                    items-center ml-1 justify-center
                    hover:rounded-lg
                    transition-colors
                    hover:bg-(--bg-hover)
                  "
                >
                  {/* Hover hint, hidden normally, visible on hover: a pointer when
                        the rail opens by hovering, an arrow when it opens on click. */}
                  <HugeiconsIcon
                    icon={PanelLeftIcon}
                    size={20}
                    strokeWidth={1.8}
                    className="
                      absolute
                      hover:text-(--text-hover)
                      transition-all duration-150
                      group-hover:scale-100
                      text-(--text-primary)
                    "
                  />
                </button>
              </Tooltip>

              <Tooltip label="Keep open" side="bottom" shape="solid" size="md">
                <NavbarSearchIcon />
              </Tooltip>
            </div>
          </div>
        ) : null}

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
          <span className="pointer-events-none absolute left-1/2 max-w-[40%] -translate-x-1/2 truncate text-[13px] font-bold tracking-tight text-(--text-soft)">
            {pageTitle}
          </span>
        )}

        <div className="ml-auto flex items-center justify-end gap-1">
          {/* Always rendered, and always immediately before notifications.
              It used to appear only when the sidebar was collapsed, so the
              button moved around as the rail was toggled. */}
          {sidebarMode === "collapsed" ? <NavbarSearchIcon /> : null}

          <div ref={bellRef} className="relative">
            <NotificationsButton
              isOpen={notificationsOpen}
              unreadCount={notificationsData?.unreadCount ?? 0}
              onClick={() => setNotificationsOpen((open) => !open)}
            />
            <NotificationsPanel
              open={notificationsOpen}
              onClose={() => setNotificationsOpen(false)}
              ignoreRef={bellRef}
            />
          </div>

          {/* Only while the panel is closed. Open, the panel's own header carries
              the same toggle — two of them on screen is the same control twice. */}
          {!rightPanelOpen && (
            <Tooltip
              label="Show panel"
              highlight={isMac ? "⌘J" : "Ctrl J"}
              side="bottom"
              shape="solid"
              size="md"
            >
              <button
                type="button"
                onClick={toggleRightPanel}
                aria-label="Show panel"
                aria-controls="right-panel"
                aria-keyshortcuts="Meta+J Control+J"
                className={[
                  "grid size-8 place-items-center rounded-lg",
                  "hover:bg-(--bg-active) text-(--text-primary)",
                  "focus-visible:outline-2 focus-visible:outline-(--brand)",
                ].join(" ")}
              >
                <HugeiconsIcon
                  icon={PanelRightIcon}
                  size={18}
                  strokeWidth={1.6}
                />
              </button>
            </Tooltip>
          )}
        </div>
      </header>
    </>
  );
}
