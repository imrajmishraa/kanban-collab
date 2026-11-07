import { lazy, Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";

const DashboardSidebar = lazy(
  () => import("@components/sidebar/DashboardSidebar"),
);
const DashboardNavbar = lazy(
  () => import("@components/sidebar/DashboardNavbar"),
);

import { NewWorkspaceDialogProvider } from "@/components/dashboard/workspace/create/NewWorkspaceDialogProvider";

import { useSidebarState } from "@/features/dashboard/stores/sidebarState";
import { useSearchStore } from "@/features/search/stores/searchStore";
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
  const { collapsed, toggleCollapsed: toggleSidebar } = useSidebarState();
  /* Hover mode opens the rail *over* the page instead of pushing it, so while
     the pointer is on the rail the outlet gets a little breathing room back. */
  const sidebarMode = useSidebarState((s) => s.mode);
  const sidebarHovering = useSidebarState((s) => s.hovering);
  const railOverPage = sidebarMode === "hover" && sidebarHovering;

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

  return (
    <NewWorkspaceDialogProvider>
      {/* One column for the whole app, centred and capped like the marketing
          pages. The rail and the navbar are `fixed`, so they still measure
          against the viewport — see the note in the reply. */}
      <div className="mx-auto min-h-screen w-full max-w-384 bg-(--bg-root) text-(--text-primary)">
        {/* The phone bar lives inside DashboardSidebar now, next to the panel it
            opens — one component owns both, so the flag never has to travel. */}
        <DashboardSidebar collapsed={collapsed} onToggle={toggleSidebar} />

        <main
          className={[
            /* `main` is the app's scroller, not the document, so smooth
               scrolling has to be declared here for anything that calls
               scrollTo / scrollIntoView inside the shell. */
            "flex h-screen flex-col overflow-y-auto scroll-smooth",
            "transition-[margin-left,padding] duration-200 ease-out",
            "ml-0 pt-14 md:pt-0",
            collapsed ? "md:ml-18" : "md:ml-64",
            /* Same 200ms as the rail's own slide, so the two move together. */
            railOverPage && "md:px-6",
          ].join(" ")}
        >
          <DashboardNavbar />
          <div className="flex-1 mt-12">
            <Outlet />
          </div>
        </main>

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
