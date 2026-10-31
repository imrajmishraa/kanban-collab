import { create } from "zustand";
import { persist } from "zustand/middleware";

/**
 * How the rail behaves.
 *
 * open      the full 256px rail with labels
 * collapsed icons only, always
 * hover     icons only until the pointer is over it, then it opens over the
 *           page instead of pushing it, which is why `collapsed` stays true
 */
export type SidebarMode = "open" | "collapsed" | "hover";

interface SidebarState {
  mode: SidebarMode;
  /** What the layout reserves: true for anything narrower than the open rail. */
  collapsed: boolean;
  /** True while the pointer is over a hover-mode rail. Runtime only. */
  hovering: boolean;
  boardsOpen: boolean;

  setMode: (mode: SidebarMode) => void;
  setHovering: (hovering: boolean) => void;

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
      mode: "open",
      collapsed: false,
      hovering: false,
      boardsOpen: true,

      setMode: (mode) =>
        set({
          mode,
          collapsed: mode !== "open",
          /* Leaving hover mode should not leave the rail looking hovered. */
          hovering: mode === "hover" ? false : false,
        }),

      setHovering: (hovering) => set({ hovering }),

      toggleCollapsed: () =>
        set((state) => {
          const mode: SidebarMode =
            state.mode === "open" ? "collapsed" : "open";
          return { mode, collapsed: mode !== "open", hovering: false };
        }),

      collapse: () =>
        set({ mode: "collapsed", collapsed: true, hovering: false }),
      expand: () => set({ mode: "open", collapsed: false, hovering: false }),

      toggleBoards: () => set((state) => ({ boardsOpen: !state.boardsOpen })),
      openBoards: () => set({ boardsOpen: true }),
      closeBoards: () => set({ boardsOpen: false }),
    }),
    {
      name: "kanban.sidebar",
      /* Only preferences survive a reload. `hovering` is runtime, and
         `collapsed` is derived from `mode` on load. */
      version: 1,
      partialize: (state) => ({
        mode: state.mode,
        boardsOpen: state.boardsOpen,
      }),
      migrate: (persisted, version) => {
        if (version === 0) {
          const old = persisted as
            { collapsed?: boolean; boardsOpen?: boolean } | undefined;

          return {
            mode: old?.collapsed ? "collapsed" : "open",
            boardsOpen: old?.boardsOpen ?? true,
          } as { mode: SidebarMode; boardsOpen: boolean };
        }

        return persisted as { mode: SidebarMode; boardsOpen: boolean };
      },
      /* `collapsed` is derived, never persisted. Deriving it in `merge` means
         it is right on the very first render after a reload, instead of a
         callback that lands a tick later and leaves the rail open until it
         does. */
      merge: (persisted, current) => {
        const saved = persisted as
          { mode?: SidebarMode; boardsOpen?: boolean } | undefined;

        const mode = saved?.mode ?? current.mode;

        return {
          ...current,
          ...saved,
          mode,
          collapsed: mode !== "open",
          hovering: false,
        };
      },
    },
  ),
);
