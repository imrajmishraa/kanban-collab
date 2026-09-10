import type { AuthUser } from "@/types/api/auth/auth";
import type { Workspace } from "@/types/api/dashboard/workspace";
import type { Board } from "@/types/api/dashboard/board";

export interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;

  user: AuthUser | null;

  // Workspaces
  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onWorkspaceChange: (workspaceId: string) => void;
  isWorkspacesLoading: boolean;
  isWorkspacesError: boolean;

  // Boards
  boards: Board[];
  isBoardsLoading: boolean;
  isBoardsError: boolean;

  // Board section
  boardsOpen: boolean;
  onBoardsToggle: () => void;

  // Infinite scrolling
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMoreBoards: () => void;

  // Actions
  onSearch: () => void;
  onLogout: () => Promise<void>;
}
