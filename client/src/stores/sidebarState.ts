import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  collapsed: boolean;
  boardsOpen: boolean;

  toggleCollapsed: () => void;
  collapse: () => void;
  expand: () => void;

  toggleBoards: () => void;
  openBoards: () => void;
  closeBoards: () => void;
}

export const useSidebarState = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      boardsOpen: true,

      toggleCollapsed: () => set((s) => ({ collapsed: !s.collapsed })),
      collapse: () => set({ collapsed: true }),
      expand: () => set({ collapsed: false }),

      toggleBoards: () => set((s) => ({ boardsOpen: !s.boardsOpen })),
      openBoards: () => set({ boardsOpen: true }),
      closeBoards: () => set({ boardsOpen: false }),
    }),
    {
      name: "kanban.sidebar",
      // Only the preferences survive reloads — actions are re-created
      // fresh on every load and must never be persisted.
      partialize: (state) => ({
        collapsed: state.collapsed,
        boardsOpen: state.boardsOpen,
      }),
    },
  ),
);
