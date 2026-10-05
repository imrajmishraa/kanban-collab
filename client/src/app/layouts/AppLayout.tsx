import { lazy, Suspense, useEffect } from "react";
import { Outlet } from "react-router-dom";

import DashboardSidebar from "@components/layout/dashboard/sidebar/DashboardSidebar";
import DashboardNavbar from "#components/layout/dashboard/sidebar/DashboardNavbar";
import { NewWorkspaceDialogProvider } from "@components/layout/dashboard/workspace/create/NewWorkspaceDialogProvider";

import { useSidebarState } from "@/stores/sidebarState";
import { useSearchStore } from "@/stores/searchStore";
import { useEnsureActiveWorkspace } from "@/hooks/dashboard/useEnsureActiveWorkspace";
import { useSyncSavedBoards } from "@/hooks/dashboard/useSyncSavedBoards";

const SearchModal = lazy(() =>
  import("@components/layout/dashboard/search/SearchModal").then((m) => ({
    default: m.SearchModal,
  })),
);

function warmSearchModal() {
  void import("@components/layout/dashboard/search/SearchModal");
}

export default function AppLayout() {
  const { collapsed, toggleCollapsed: toggleSidebar } = useSidebarState();
  const searchOpen = useSearchStore((s) => s.open);

  // Restore the last-used workspace (no navigation), and keep the persisted
  // boards store warm for the navbar.
  useEnsureActiveWorkspace();
  useSyncSavedBoards();

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
      <div className="min-h-screen bg-(--bg-root) text-(--text-primary)">
        <DashboardSidebar collapsed={collapsed} onToggle={toggleSidebar} />

        <main
          className={[
            "flex h-screen flex-col overflow-y-auto",
            "transition-[margin-left] duration-200 ease-out",
            "ml-0 pt-14 md:pt-0",
            collapsed ? "md:ml-16" : "md:ml-54",
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
