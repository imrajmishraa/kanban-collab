import { create } from "zustand";
import { persist } from "zustand/middleware";

interface StarredWorkspacesState {
  ids: string[];
  toggle: (workspaceId: string) => void;
  isStarred: (workspaceId: string) => boolean;
}

export const useStarredWorkspaces = create<StarredWorkspacesState>()(
  persist(
    (set, get) => ({
      ids: [],
      toggle: (workspaceId) =>
        set((state) => ({
          ids: state.ids.includes(workspaceId)
            ? state.ids.filter((id) => id !== workspaceId)
            : [...state.ids, workspaceId],
        })),
      isStarred: (workspaceId) => get().ids.includes(workspaceId),
    }),
    { name: "kanban:starred-workspaces" },
  ),
);
