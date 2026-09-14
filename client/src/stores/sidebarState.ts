import { create } from "zustand";
import { persist } from "zustand/middleware";

interface SidebarState {
  collapsed: boolean;
  boardsOpen: boolean;
  toggle: () => void;
  setCollapsed: (collapsed: boolean) => void;

  toggleBoards: () => void;
  setBoardsOpen: (open: boolean) => void;
}

export const useSidebarState = create<SidebarState>()(
  persist(
    (set) => ({
      collapsed: false,
      boardsOpen: true,

      
      toggle: () => set((state) => ({ collapsed: !state.collapsed })),
      setCollapsed: (collapsed) => set({ collapsed }),

      toggleBoards: () => set((s) => ({ boardsOpen: !s.boardsOpen })),
      setBoardsOpen: (boardsOpen) => set({ boardsOpen }),
    }),
    {
      name: "kanban.sidebar",
      // Partialize to only persist what should survive reloads
      partialize: (state) => ({
        collapsed: state.collapsed,
        boardsOpen: state.boardsOpen,
      }),
    },
  ),
);
