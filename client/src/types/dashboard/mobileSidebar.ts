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

  // Boards
  boards: Board[];
  isBoardsLoading: boolean;
  isBoardsError: boolean;

  // Boards section
  boardsOpen: boolean;
  onBoardsToggle: () => void;

  // Infinite scroll
  hasNextPage: boolean;
  isFetchingNextPage: boolean;
  onLoadMoreBoards: () => void;

  // Actions
  onLogout: () => Promise<void>;
  // onSearch removed — MobileSidebarHeader reads useSearchStore directly
}
