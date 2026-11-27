import { create } from "zustand";
import { persist } from "zustand/middleware";

import { RAIL, clampWidth } from "../lib/railMetrics";
import { sidebarPersist } from "./sidebarPersist";
import {
  isVisibleMode,
  type SidebarMode,
  type VisibleMode,
} from "./sidebarMode";

export type { SidebarMode };

export interface SidebarState {
  mode: SidebarMode;
  /** Stored width. Always clamped on read and on write. */
  width: number;
  /** What the toggle restores: the last mode that showed the rail. */
  lastVisible: VisibleMode;
  /** What the layout reserves: true for anything narrower than the open rail. */
  collapsed: boolean;
  /** True while the pointer is over a hover-mode rail. Runtime only. */
  hovering: boolean;
  /**
   * True while the divider is being dragged. Runtime only, and the reason it
   * exists: the rail, the page and the navbar all animate their width for
   * 200ms, so mid-drag they lag behind the pointer and catch up afterwards.
   * While this is set nothing animates and the three move as one.
   */
  resizing: boolean;
  boardsOpen: boolean;

  setMode: (mode: SidebarMode) => void;
  setHovering: (hovering: boolean) => void;
  setWidth: (width: number) => void;
  setResizing: (resizing: boolean) => void;

  toggleCollapsed: () => void;
  collapse: () => void;
  expand: () => void;
  hide: () => void;
  /** The navbar toggle: hidden → whatever was visible, otherwise → collapsed. */
  toggleHidden: () => void;
  /**
   * B5: a click while the preview is open pins it. Today the click ran `toggleHidden`, which
   * in hover mode collapsed the rail — the opposite of what a click on something you are
   * looking at should do.
   */
  openFromPreview: () => void;
  /** ⌘B: open ↔ hidden, nothing in between. */
  toggleOpenHidden: () => void;
  /**
   * A preview of a hidden rail: hovering its icon shows it as the hover overlay, and
   * leaving puts it back. A click still opens it properly, so the icon is never a dead end.
   */
  peek: () => void;
  unpeek: () => void;

  toggleBoards: () => void;
  openBoards: () => void;
  closeBoards: () => void;
}

export const useSidebarState = create<SidebarState>()(
  persist(
    (set, get) => ({
      mode: "expanded",
      width: RAIL.DEFAULT,
      lastVisible: "expanded",
      collapsed: false,
      hovering: false,
      resizing: false,
      boardsOpen: true,

      /*
       * Asking for the mode it already has is not a change, and must not carry a
       * change's side effects: `hovering` is the preview, and a command that
       * re-asserts "hidden" (the shell commits its layout after every drag and
       * every resize) would otherwise end a preview the pointer is still in.
       */
      setMode: (mode) => {
        if (get().mode === mode) return;

        set({
          mode,
          collapsed: mode !== "expanded",
          hovering: false,
          ...(isVisibleMode(mode) ? { lastVisible: mode } : {}),
        });
      },

      setHovering: (hovering) => set({ hovering }),
      setResizing: (resizing) => set({ resizing }),

      /* Clamped here as well as on read: a drag that overshoots must not store
         900, and a double-click reset must not store 0. */
      setWidth: (width) => set({ width: clampWidth(width) }),

      toggleCollapsed: () => {
        const state = get();
        const mode: SidebarMode =
          state.mode === "expanded" ? "collapsed" : "expanded";

        set({
          mode,
          collapsed: mode !== "expanded",
          hovering: false,
          ...(isVisibleMode(mode) ? { lastVisible: mode } : {}),
        });
      },

      collapse: () =>
        set({ mode: "collapsed", collapsed: true, hovering: false }),
      expand: () =>
        set({
          mode: "expanded",
          collapsed: false,
          hovering: false,
          lastVisible: "expanded",
        }),

      hide: () => set({ mode: "hidden", collapsed: true, hovering: false }),

      /*
       * The one toggle: ⌘B, and the navbar button while the rail is hidden.
       *
       * It has to mean the same thing everywhere — "the sidebar is in the way, or
       * it is not". Pressing it with the rail collapsed used to be a no-op, which
       * reads as a broken shortcut, so collapsed now opens: the three states a
       * reader can be in all answer sensibly, and it is never a dead key.
       */
      /* Only from hidden: a rail that is already open or collapsed has its own hover
         behaviour and must not be switched to preview behind the reader's back. */
      peek: () => {
        /* Only a rail that is off the page previews; the mode does not change. */
        if (get().mode !== "hidden") return;
        set({ hovering: true });
      },

      unpeek: () => set({ hovering: false }),

      /* A click inside a preview pins what the reader is looking at. */
      openFromPreview: () =>
        set({
          mode: "expanded",
          collapsed: false,
          hovering: false,
          lastVisible: "expanded",
        }),

      toggleOpenHidden: () => {
        const { mode, lastVisible } = get();

        if (mode === "hidden") {
          set({ mode: lastVisible, collapsed: false, hovering: false });
          return;
        }

        set({ mode: "hidden", collapsed: true, hovering: false });
      },

      toggleHidden: () => {
        const { mode, lastVisible } = get();

        if (mode === "hidden") {
          set({
            mode: lastVisible,
            collapsed: lastVisible !== "expanded",
            hovering: false,
          });
          return;
        }

        if (mode === "collapsed") {
          set({
            mode: "expanded",
            collapsed: false,
            hovering: false,
            lastVisible: "expanded",
          });
          return;
        }

        set({ mode: "collapsed", collapsed: true, hovering: false });
      },

      toggleBoards: () => set((state) => ({ boardsOpen: !state.boardsOpen })),
      openBoards: () => set({ boardsOpen: true }),
      closeBoards: () => set({ boardsOpen: false }),
    }),
    {
      name: "kanban.sidebar",
      /*
       * v2 adds `width` and `lastVisible`, and the `hidden` mode. Only
       * preferences survive a reload: `hovering` is runtime, and `collapsed` is
       * derived from `mode`.
       */
      version: 3,
      ...sidebarPersist,
    },
  ),
);
