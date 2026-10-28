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
    {
      name: "kanban.activeWorkspace",

      /**
       * v2 drops any selection persisted by older builds.
       *
       * Those builds auto-selected `workspaces[0]` for everyone, so every
       * existing browser has an `activeWorkspaceId` in localStorage that the
       * user never chose. Because the store rehydrates it, `RequireWorkspace`
       * saw a selection and never asked. Bumping the version clears the stale
       * value once, after which a choice is only ever something the user made.
       */
      version: 2,

      migrate: (persisted, version) => {
        if (version < 2) {
          return {
            activeWorkspaceId: null,
            activeWorkspaceName: null,
            lastWorkspaceByUser: {},
          };
        }

        return persisted as ActiveWorkspaceState;
      },

      // Only data is worth persisting; the setters are recreated on load.
      partialize: (state) => ({
        activeWorkspaceId: state.activeWorkspaceId,
        activeWorkspaceName: state.activeWorkspaceName,
        lastWorkspaceByUser: state.lastWorkspaceByUser,
      }),
    },
  ),
);
