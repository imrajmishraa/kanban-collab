import { create } from "zustand";
import { persist } from "zustand/middleware";

import { RAIL, clampWidth } from "../lib/railMetrics";

/**
 * How the rail behaves.
 *
 * open      the expanded rail at its stored width
 * collapsed icons only, always
 * hover     icons only until the pointer is over it, then it opens to MIN over
 *           the page instead of pushing it
 * hidden    not on the page at all; the navbar toggle is the way back
 */
export type SidebarMode = "open" | "collapsed" | "hover" | "hidden";

const MODES: readonly SidebarMode[] = ["open", "collapsed", "hover", "hidden"];

const isMode = (value: unknown): value is SidebarMode =>
  MODES.includes(value as SidebarMode);

/** Modes that show the rail, and so are worth restoring to. */
type VisibleMode = "open" | "hover";

const isVisibleMode = (value: unknown): value is VisibleMode =>
  value === "open" || value === "hover";

interface SidebarState {
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

  toggleBoards: () => void;
  openBoards: () => void;
  closeBoards: () => void;
}

export const useSidebarState = create<SidebarState>()(
  persist(
    (set, get) => ({
      mode: "open",
      width: RAIL.DEFAULT,
      lastVisible: "open",
      collapsed: false,
      hovering: false,
      resizing: false,
      boardsOpen: true,

      setMode: (mode) =>
        set({
          mode,
          collapsed: mode !== "open",
          /* Leaving hover mode should not leave the rail looking hovered. */
          hovering: false,
          ...(isVisibleMode(mode) ? { lastVisible: mode } : {}),
        }),

      setHovering: (hovering) => set({ hovering }),
      setResizing: (resizing) => set({ resizing }),

      /* Clamped here as well as on read: a drag that overshoots must not store
         900, and a double-click reset must not store 0. */
      setWidth: (width) => set({ width: clampWidth(width) }),

      toggleCollapsed: () => {
        const state = get();
        const mode: SidebarMode = state.mode === "open" ? "collapsed" : "open";

        set({
          mode,
          collapsed: mode !== "open",
          hovering: false,
          ...(isVisibleMode(mode) ? { lastVisible: mode } : {}),
        });
      },

      collapse: () =>
        set({ mode: "collapsed", collapsed: true, hovering: false }),
      expand: () =>
        set({
          mode: "open",
          collapsed: false,
          hovering: false,
          lastVisible: "open",
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
      toggleHidden: () => {
        const { mode, lastVisible } = get();

        if (mode === "hidden") {
          set({
            mode: lastVisible,
            collapsed: lastVisible !== "open",
            hovering: false,
          });
          return;
        }

        if (mode === "collapsed") {
          set({
            mode: "open",
            collapsed: false,
            hovering: false,
            lastVisible: "open",
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
      version: 2,
      partialize: (state) => ({
        mode: state.mode,
        width: state.width,
        lastVisible: state.lastVisible,
        boardsOpen: state.boardsOpen,
      }),
      migrate: (persisted, version) => {
        const old = persisted as
          | {
              collapsed?: boolean;
              boardsOpen?: boolean;
              mode?: SidebarMode;
              width?: number;
              lastVisible?: VisibleMode;
            }
          | undefined;

        /* v0 stored a bare `collapsed` boolean. */
        const mode: SidebarMode =
          version === 0
            ? old?.collapsed
              ? "collapsed"
              : "open"
            : isMode(old?.mode)
              ? old.mode
              : "open";

        return {
          mode,
          boardsOpen: old?.boardsOpen ?? true,
          width:
            typeof old?.width === "number"
              ? clampWidth(old.width)
              : RAIL.DEFAULT,
          lastVisible: isVisibleMode(old?.lastVisible)
            ? old.lastVisible
            : mode === "hover"
              ? "hover"
              : "open",
        };
      },
      /*
       * `collapsed` is derived, never persisted, and a stored value from an
       * older build is validated rather than trusted: a hand-edited
       * `kanban.sidebar` must not be able to render a 4px rail or an unknown
       * mode.
       */
      merge: (persisted, current) => {
        const saved = persisted as
          | {
              mode?: unknown;
              width?: unknown;
              lastVisible?: unknown;
              boardsOpen?: unknown;
            }
          | undefined;

        const mode = isMode(saved?.mode) ? saved.mode : current.mode;

        return {
          ...current,
          mode,
          width:
            typeof saved?.width === "number"
              ? clampWidth(saved.width)
              : current.width,
          lastVisible: isVisibleMode(saved?.lastVisible)
            ? saved.lastVisible
            : current.lastVisible,
          boardsOpen:
            typeof saved?.boardsOpen === "boolean"
              ? saved.boardsOpen
              : current.boardsOpen,
          collapsed: mode !== "open",
          hovering: false,
        };
      },
    },
  ),
);
