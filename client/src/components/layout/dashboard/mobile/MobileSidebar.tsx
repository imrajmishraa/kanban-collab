import { useEffect } from "react";

import MobileSidebarHeader from "./MobileSidebarHeader";

import { WorkspaceSelector } from "../workspace/selector/WorkspaceSelector";
import SidebarNewWorkspace from "../workspace/create/SidebarNewWorkspace";
import SidebarNavigation from "../sidebar/SidebarNavigation";
import SidebarBoards from "../sidebar/SidebarBoards";
import SidebarFooter from "../sidebar/SidebarFooter";

import type { MobileSidebarProps } from "@/types/dashboard/mobileSidebar";

export default function MobileSidebar({
  open,
  onClose,
  user,
  workspaces,
  activeWorkspaceId,
  onWorkspaceChange,
  boards,
  isBoardsLoading,
  isBoardsError,
  boardsOpen,
  onBoardsToggle,
  hasNextPage,
  isFetchingNextPage,
  onLoadMoreBoards,
  onLogout,
}: MobileSidebarProps) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  // Name is needed for the trigger label; the hook inside WorkspaceSelector
  // only knows the ID.
  const activeWorkspaceName =
    workspaces.find((w) => w.id === activeWorkspaceId)?.name ?? null;

  return (
    <>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={[
          "fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden",
          "transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        ].join(" ")}
      />

      <aside
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        onClick={(event) => event.stopPropagation()}
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col md:hidden",
          "border-r border-white/8 bg-(--bg-surface)",
          "shadow-[12px_0_40px_rgba(0,0,0,0.45)]",
          "transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        {/* Header */}
        <div className="shrink-0">
          <MobileSidebarHeader onClose={onClose} />
        </div>

        {/* Workspace dropdown — same component as desktop navbar */}
        <div className="shrink-0 px-3 pt-2.5">
          <WorkspaceSelector
            activeWorkspaceId={activeWorkspaceId}
            activeWorkspaceName={activeWorkspaceName}
            onWorkspaceChange={onWorkspaceChange}
            triggerClassName="w-full justify-between"
            dropdownClassName="w-[calc(100vw-3rem)] max-w-[280px]"
          />
        </div>
        {/* New workspace */}
        <SidebarNewWorkspace collapsed={false} />

        {/* Scrollable nav + boards */}
        <div className="relative min-h-0 flex-1">
          <div className="h-full overflow-y-auto">
            <SidebarNavigation collapsed={false} />

            <SidebarBoards
              collapsed={false}
              open={boardsOpen}
              onToggle={onBoardsToggle}
              boards={boards}
              isLoading={isBoardsLoading}
              isError={isBoardsError}
              hasNextPage={hasNextPage}
              isFetchingNextPage={isFetchingNextPage}
              onLoadMore={onLoadMoreBoards}
            />
          </div>

          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-linear-to-t from-(--bg-surface) via-(--bg-surface)/85 to-transparent backdrop-blur-[3px]"
            style={{
              maskImage: "linear-gradient(to top, black 40%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to top, black 40%, transparent)",
            }}
          />
        </div>

        <div className="shrink-0 border-t border-white/8">
          <SidebarFooter collapsed={false} user={user} onLogout={onLogout} />
        </div>
      </aside>
    </>
  );
}
