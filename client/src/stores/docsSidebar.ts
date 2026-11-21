import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * Whether the docs column is collapsed.
 *
 * The app's rail has had a persisted store since it was built (`kanban.sidebar`);
 * the docs layout kept its state in a `useState`, so collapsing the docs column
 * survived navigation but not a reload — it came back open every time. Same
 * preference, so it gets the same treatment.
 *
 * Deliberately separate from `useSidebarState`: the two rails are independent
 * surfaces with different modes (the app rail also has `hover`), and tying them
 * together would make collapsing one collapse the other.
 */
interface DocsSidebarState {
  collapsed: boolean;
  toggleCollapsed: () => void;
  setCollapsed: (collapsed: boolean) => void;
}

export const useDocsSidebarState = create<DocsSidebarState>()(
  persist(
    (set) => ({
      collapsed: false,

      toggleCollapsed: () => set((state) => ({ collapsed: !state.collapsed })),

      setCollapsed: (collapsed) => set({ collapsed }),
    }),
    {
      name: "kanban.docs-sidebar",
      version: 1,
      /* Only the preference is stored; the actions come from the store itself. */
      partialize: (state) => ({ collapsed: state.collapsed }),
    },
  ),
);
