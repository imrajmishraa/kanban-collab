import MobileSidebarHeader from "./MobileSidebarHeader";

import SidebarWorkspace from "../sidebar/SidebarWorkspace";
import SidebarNavigation from "../sidebar/SidebarNavigation";
import SidebarBoards from "../sidebar/SidebarBoards";


import type { MobileSidebarProps } from "@/types/dashboard/mobileSidebar";
import SidebarFooter from "../sidebar/SidebarFooter";

export default function MobileSidebar({
  open,
  onClose,
  user,
  workspaces,
  activeWorkspaceId,
  onWorkspaceChange,
  isWorkspacesLoading,
  isWorkspacesError,
  boards,
  isBoardsLoading,
  isBoardsError,
  boardsOpen,
  onBoardsToggle,
  hasNextPage,
  isFetchingNextPage,
  onLoadMoreBoards,
  onSearch,
  onLogout,
}: MobileSidebarProps) {
  if (!open) {
    return null;
  }

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/60 md:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Mobile Sidebar */}
      <aside
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col",
          "border-r border-neutral-800 bg-[#080808]",
          "shadow-[12px_0_40px_rgba(0,0,0,0.45)]",
          "md:hidden",
        ].join(" ")}
        aria-label="Mobile navigation"
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        {/* Fixed Header */}
        <div className="shrink-0">
          <MobileSidebarHeader onClose={onClose} onSearch={onSearch} />
        </div>

        {/* Fixed Workspace */}
        <div className="shrink-0">
          <SidebarWorkspace
            collapsed={false}
            mobile
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            onWorkspaceChange={(workspaceId) => {
              onWorkspaceChange(workspaceId);
              onClose();
            }}
            isLoading={isWorkspacesLoading}
            isError={isWorkspacesError}
          />
        </div>

        {/* Flexible Content */}
        <div className="flex min-h-0 flex-1 flex-col">
          {/* Navigation - independently scrollable */}
          <div className="max-h-40 shrink-0 overflow-y-auto">
            <SidebarNavigation collapsed={false} />
          </div>

          {/* Boards - independently scrollable */}
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

        {/* Fixed More */}
        <div className="shrink-0">
          <SidebarFooter collapsed={false} user={user} onLogout={onLogout} />
        </div>
      </aside>
    </>
  );
}
