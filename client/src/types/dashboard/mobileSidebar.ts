import type { AuthUser } from "@/types/api/auth/auth";
import type { Workspace } from "@/types/api/dashboard/workspace";
import type { Board } from "@/types/api/dashboard/board";

export interface MobileSidebarProps {
  open: boolean;
  onClose: () => void;

  user: AuthUser | null;

  workspaces: Workspace[];
  activeWorkspaceId: string | null;
  onWorkspaceChange: (workspaceId: string) => void;
  isWorkspacesLoading: boolean;
  isWorkspacesError: boolean;

  boards: Board[];
  isBoardsLoading: boolean;
  isBoardsError: boolean;

  onSearch: () => void;
  onLogout: () => Promise<void>;
}
