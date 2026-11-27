import { lazy, Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";

const DashboardSidebar = lazy(
  () => import("@components/sidebar/DashboardSidebar"),
);
const DashboardNavbar = lazy(
  () => import("@components/sidebar/DashboardNavbar"),
);
const RightPanel = lazy(() => import("@components/layout/RightPanel"));

import { NewWorkspaceDialogProvider } from "@/components/dashboard/workspace/create/NewWorkspaceDialogProvider";

import { useSidebarState } from "@/features/dashboard";
import { useRailLayout } from "@/features/dashboard";
import { useRightPanel } from "@/stores/rightPanel";
import { computePanel } from "@/components/layout/panelMetrics";
import { useSearchStore } from "@/features/search";
import { MOBILE_MAX_VIEWPORT } from "@/components/layout/panelMetrics";
import ShellLayout from "@/layouts/ShellLayout";
import { useShellFlag } from "@/layouts/useShellFlag";
import { useEnsureActiveWorkspace } from "@/hooks/useEnsureActiveWorkspace";
import { useSyncSavedBoards } from "@/hooks/useSyncSavedBoards";

const SearchModal = lazy(() =>
  import("@/components/dashboard/search/SearchModal").then((m) => ({
    default: m.SearchModal,
  })),
);

function warmSearchModal() {
  void import("@/components/dashboard/search/SearchModal");
}

export default function AppLayout() {
  /* The resizable shell, behind a flag until it has run in the wild. The rail and
     the column become panes of a group, and the layout is written once per change
     by \`useShellLayout\` instead of by CSS variables on three elements. */
  const shellOn = useShellFlag();
  const shellActive =
    shellOn &&
    typeof window !== "undefined" &&
    window.innerWidth >= MOBILE_MAX_VIEWPORT;

  const toggleSidebar = useSidebarState((s) => s.toggleCollapsed);
  const toggleOpenHidden = useSidebarState((s) => s.toggleOpenHidden);
  const collapse = useSidebarState((s) => s.collapse);

  /*
   * The rail's width is data now, not two Tailwind classes. One computation
   * (`useRailLayout`) decides it, and this layout reserves exactly what the
   * rail takes via `--rail-width` — the same value the rail renders at, so the
   * two cannot drift.
   */
  const rail = useRailLayout();
  const resizing = useSidebarState((s) => s.resizing);
  const setResizing = useSidebarState((s) => s.setResizing);

  /* Off by default (`stores/rightPanel.ts`), so an existing reader's layout is
     unchanged until they choose a column in Settings → Appearance. The panel
     itself only exists from `lg:` up; below that it renders nothing. */
  const rightPanelMode = useRightPanel((s) => s.mode);
  const rightPanelWidth = useRightPanel((s) => s.width);
  const rightPanelLevel = useRightPanel((s) => s.level);
  const rightPanelOpen = rightPanelMode !== "off";

  const toggleRightPanel = useRightPanel((s) => s.toggle);

  const panelLayout = computePanel({
    mode: rightPanelMode,
    level: rightPanelLevel,
    width: rightPanelWidth,
    viewport: typeof window === "undefined" ? 1440 : window.innerWidth,
    appRailWidth: rail.reserved,
  });

  const searchOpen = useSearchStore((s) => s.open);
  const openSearch = useSearchStore((s) => s.openSearch);

  // Restore the last-used workspace (no navigation), and keep the persisted
  // boards store warm for the navbar.
  useEnsureActiveWorkspace();
  useSyncSavedBoards();

  /**
   * The ⌘K / Ctrl+K shortcut lives here, not in SearchModal.
   *
   * SearchModal is mounted only while `searchOpen` is true, so a listener
   * inside it could never fire the first time: the component that owns the
   * shortcut did not exist until the shortcut had already been used.
   */
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;

      if (!mod || event.shiftKey || event.key.toLowerCase() !== "k") return;

      /* On a board, ⌘K belongs to the card palette in BoardView. Both listen
         on window, and this handler is registered first, so it has to stand
         down here or the search palette would open on top of the card one. */
      if (window.location.pathname.startsWith("/boards/")) return;

      event.preventDefault();
      openSearch();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [openSearch]);

  /*
   * ⌘J / Ctrl+J — the right column, from anywhere.
   * ⌘⇧J / Ctrl+Shift+J — full width. One modifier apart on purpose: the plain one is
   * used constantly, the shifted one changes the whole layout.
   */
  useEffect(() => {
    if (shellActive) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;

      if (!mod || event.key.toLowerCase() !== "j") return;

      event.preventDefault();

      if (!event.shiftKey) {
        toggleRightPanel();
        return;
      }

      /* Taking the remaining width implies the panel is open. It never touches the
         rail: the rail keeps its width, and the column takes what is left. */
      const panel = useRightPanel.getState();

      if (panel.mode === "off") panel.setMode("panel");
      panel.toggleLevel();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [shellActive, toggleRightPanel]);

  /*
   * ⌘B / Ctrl+B — open ↔ hidden, and nothing else.
   * ⌘⇧B / Ctrl+Shift+B — the icon rail.
   *
   * Two gestures, two states: the plain one is used constantly and should never land on a
   * third state the reader did not ask for; the shifted one is the "just the icons" version.
   */
  useEffect(() => {
    if (shellActive) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const mod = event.metaKey || event.ctrlKey;

      if (!mod || event.key.toLowerCase() !== "b") return;

      event.preventDefault();

      if (event.shiftKey) collapse();
      else toggleOpenHidden();
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [collapse, shellActive, toggleOpenHidden]);

  // Prefetch the search chunk during idle time.
  // Fallback to a 2s timeout on browsers without requestIdleCallback.
  useEffect(() => {
    if (typeof requestIdleCallback === "function") {
      const id = requestIdleCallback(warmSearchModal, { timeout: 3000 });
      return () => cancelIdleCallback(id);
    }
    const id = window.setTimeout(warmSearchModal, 2000);
    return () => window.clearTimeout(id);
  }, []);

  if (shellActive) {
    return (
      <NewWorkspaceDialogProvider>
        <ShellLayout>
          <Outlet />
        </ShellLayout>

        {searchOpen && (
          <Suspense fallback={null}>
            <SearchModal />
          </Suspense>
        )}
      </NewWorkspaceDialogProvider>
    );
  }

  return (
    <NewWorkspaceDialogProvider>
      {/* One column for the whole app, centred and capped like the marketing
          pages. The rail and the navbar are `fixed`, so they still measure
          against the viewport — see the note in the reply. */}
      <div
        className="mx-auto min-h-screen w-full max-w-384 bg-(--bg-root) text-(--text-primary)"
        style={
          {
            "--rail-width": `${panelLayout.railReserve ?? rail.reserved}px`,
            /* The right column, from the same computation it renders with. */
            "--panel-width": `${panelLayout.reserved}px`,
          } as React.CSSProperties
        }
        /* Mid-drag, nothing animates: the rail, the page and the navbar have to
           move together at pointer speed instead of easing behind it. */
        data-resizing={resizing ? "true" : undefined}
      >
        {/* The phone bar lives inside DashboardSidebar now, next to the panel it
            opens — one component owns both, so the flag never has to travel. */}
        <DashboardSidebar
          onToggle={toggleSidebar}
          stripped={panelLayout.railStrip === true}
        />

        {/* The window's left edge no longer previews the rail: the strip that did it
            was covered by the rail the moment it opened, so its `mouseleave` closed
            what it had just opened. The navbar's icon is the one trigger. */}

        {/* Full width takes the window: the board is not rendered, so its
            subscriptions and sockets go with it. */}
        {panelLayout.pageVisible && (
          <main
            className={[
              /* `main` is the app's scroller, not the document, so smooth
               scrolling has to be declared here for anything that calls
               scrollTo / scrollIntoView inside the shell. */
              "flex h-dvh flex-col overflow-y-auto scroll-smooth",
              "transition-[margin-left,margin-right,padding] duration-200 ease-out",
              "ml-0 pt-12 md:pt-0",
              /* What the rail reserves, in one variable — the navbar offsets
               against the same one. */
              "md:ml-(--rail-width)",
              /* Same 360px the panel reserves (`w-90`), so the board is never
               half-covered. Below `lg` the panel is not rendered and this
               class does nothing. */
              /* What the column reserves on the right, from the same computation it
               renders with. Below `lg` it is not rendered and this does nothing. */
              "lg:mr-(--panel-width)",
            ].join(" ")}
          >
            <DashboardNavbar />
            <div className="flex-1 mt-12">
              <Outlet />
            </div>
          </main>
        )}

        {rightPanelOpen && (
          <Suspense fallback={null}>
            <RightPanel
              appRailWidth={rail.reserved}
              sheet={panelLayout.sheet === true}
              onResizeStart={() => setResizing(true)}
              onResizeEnd={() => setResizing(false)}
            />
          </Suspense>
        )}

        {/* Mounted only while open — lazy() downloads the chunk on
            first open; after that it is cached in memory. */}
        {searchOpen && (
          <Suspense fallback={null}>
            <SearchModal />
          </Suspense>
        )}
      </div>
    </NewWorkspaceDialogProvider>
  );
}
