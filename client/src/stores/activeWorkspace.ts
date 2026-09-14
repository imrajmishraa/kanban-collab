import { create } from "zustand";
import { persist } from "zustand/middleware";

interface ActiveWorkspaceState {
  activeWorkspaceId: string | null;
  activeWorkspaceName: string | null;
  setActiveWorkspace: (id: string, name: string) => void;
}

export const useActiveWorkspace = create<ActiveWorkspaceState>()(
  persist(
    (set) => ({
      activeWorkspaceId: null,
      activeWorkspaceName: null,
      setActiveWorkspace: (id, name) =>
        set({ activeWorkspaceId: id, activeWorkspaceName: name }),
    }),
    { name: "kanban.activeWorkspace" },
  ),
);
