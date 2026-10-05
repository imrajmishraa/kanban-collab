import { create } from "zustand";
import { persist } from "zustand/middleware";

import { useAuthStore } from "./useAuthStore";

/** A workspace the user has used before, with when they last used it. */
export interface WorkspaceMemory {
  id: string;
  name: string;
  lastUsed: number;
}

interface ActiveWorkspaceState {
  activeWorkspaceId: string | null;
  activeWorkspaceName: string | null;

  /** Per-user last-used workspace (newest wins). */
  lastWorkspaceByUser: Record<string, WorkspaceMemory>;

  setActiveWorkspace: (id: string, name: string) => void;
  clearActiveWorkspace: () => void;
}

function currentUserId(): string | null {
  return useAuthStore.getState().user?.id ?? null;
}

export const useActiveWorkspace = create<ActiveWorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      activeWorkspaceName: null,
      lastWorkspaceByUser: {},

      setActiveWorkspace: (id, name) =>
        set((state) => {
          const userId = currentUserId();
          return {
            activeWorkspaceId: id,
            activeWorkspaceName: name,
            lastWorkspaceByUser: userId
              ? {
                  ...state.lastWorkspaceByUser,
                  [userId]: { id, name, lastUsed: Date.now() },
                }
              : state.lastWorkspaceByUser,
          };
        }),

      clearActiveWorkspace: () =>
        set({ activeWorkspaceId: null, activeWorkspaceName: null }),
    }),
    { name: "kanban.activeWorkspace" },
  ),
);
