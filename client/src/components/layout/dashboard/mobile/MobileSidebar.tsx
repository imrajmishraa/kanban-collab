import MobileSidebarHeader from "./MobileSidebarHeader";
import SidebarWorkspace from "../sidebar/SidebarWorkspace";
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
  isWorkspacesLoading,
  isWorkspacesError,
  boards,
  isBoardsLoading,
  isBoardsError,
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

      {/* Mobile sidebar */}
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
        <MobileSidebarHeader onClose={onClose} onSearch={onSearch} />

        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <SidebarWorkspace
            collapsed={false}
            workspaces={workspaces}
            activeWorkspaceId={activeWorkspaceId}
            onWorkspaceChange={(workspaceId) => {
              onWorkspaceChange(workspaceId);
              onClose();
            }}
            isLoading={isWorkspacesLoading}
            isError={isWorkspacesError}
          />

          <SidebarNavigation collapsed={false} />

          <SidebarBoards
            collapsed={false}
            boards={boards}
            isLoading={isBoardsLoading}
            isError={isBoardsError}
          />

          <SidebarFooter collapsed={false} user={user} onLogout={onLogout} />
        </div>
      </aside>
    </>
  );
}
