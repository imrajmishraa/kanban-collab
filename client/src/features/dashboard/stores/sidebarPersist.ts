import { RAIL, clampWidth } from "../lib/railMetrics";
import {
  isMode,
  isVisibleMode,
  type SidebarMode,
  type VisibleMode,
} from "./sidebarMode";
import type { SidebarState } from "./sidebarState";

/**
 * What survives a reload, and how an older payload is read.
 *
 * Apart from the store because it answers a different question: the store is what
 * the rail does now, this is what it did last time. Keeping them together pushed
 * the store past the 300-line budget, and the migration is the part that has to
 * be read carefully — a hand-edited `kanban.sidebar` must not be able to render an
 * unknown mode.
 */
export const sidebarPersist = {
  partialize: (state: SidebarState) => ({
    mode: state.mode,
    width: state.width,
    lastVisible: state.lastVisible,
    boardsOpen: state.boardsOpen,
  }),
  migrate: (persisted: unknown, version: number) => {
    const old = persisted as
      | {
          collapsed?: boolean;
          boardsOpen?: boolean;
          mode?: SidebarMode;
          width?: number;
          lastVisible?: VisibleMode;
        }
      | undefined;

    /* v0 stored a bare `collapsed` boolean; v2 had four modes. `open` became
       `expanded`, and `hover` — a preview, never a state worth restoring —
       becomes `hidden`. */
    const legacy = old?.mode as string | undefined;
    const carried: SidebarMode | undefined =
      legacy === "open"
        ? "expanded"
        : legacy === "hover"
          ? "hidden"
          : isMode(legacy)
            ? legacy
            : undefined;

    const mode: SidebarMode =
      version === 0
        ? old?.collapsed
          ? "collapsed"
          : "expanded"
        : (carried ?? "expanded");

    return {
      mode,
      boardsOpen: old?.boardsOpen ?? true,
      width:
        typeof old?.width === "number" ? clampWidth(old.width) : RAIL.DEFAULT,
      lastVisible: isVisibleMode(old?.lastVisible)
        ? old.lastVisible
        : "expanded",
    };
  },
  /*
   * `collapsed` is derived, never persisted, and a stored value from an
   * older build is validated rather than trusted: a hand-edited
   * `kanban.sidebar` must not be able to render a 4px rail or an unknown
   * mode.
   */
  merge: (persisted: unknown, current: SidebarState) => {
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
      collapsed: mode !== "expanded",
      hovering: false,
    };
  },
} as const;
