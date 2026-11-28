import { PANEL } from "@/components/layout/panelMetrics";
import { RAIL, clampWidth } from "@/lib/railMetrics";
import { isMode, isVisibleMode } from "@/lib/sidebarMode";
import {
  RIGHT_PANEL_DEFAULT,
  isMode as isPanelMode,
} from "@/stores/rightPanelTypes";
import type { PanelState, PersistedPanelState } from "@/stores/panelStateTypes";

/**
 * What survives a reload, and how the payload written by the two stores this one
 * replaces is read.
 *
 * Two keys held the choices before: `kanban.sidebar` (v3) and
 * `kanban.right-panel` (v2). Both are read here and neither is deleted — a
 * rollback to the previous build has to find its own state where it left it.
 * Everything derived stays out: `hovering` is a glance, `level` is a gesture,
 * `resizing` is a moment, and the centre's scroll is where the page happened to
 * be, not a preference.
 */

const SIDEBAR_KEY = "kanban.sidebar";
const RIGHT_PANEL_KEY = "kanban.right-panel";

type Stored<T> = { state?: T } | T | undefined;

/** localStorage, or nothing — a private window and a first paint both land here. */
function read<T>(key: string): Stored<T> {
  if (typeof window === "undefined") return undefined;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as Stored<T>) : undefined;
  } catch {
    return undefined;
  }
}

const unwrap = <T>(stored: Stored<T>): Partial<T> | undefined => {
  if (!stored) return undefined;
  const wrapped = (stored as { state?: T }).state;
  return (wrapped ?? (stored as T)) as Partial<T>;
};

/**
 * The first paint's state, read from the keys the old stores wrote.
 *
 * A hand-edited entry must not be able to render an unknown mode or a 4px rail,
 * so every field is validated rather than trusted — the same rule the two
 * migrations it replaces followed.
 */
export function readLegacyPanels(): PersistedPanelState {
  const sidebar = unwrap(
    read<{
      mode?: unknown;
      width?: unknown;
      lastVisible?: unknown;
      boardsOpen?: unknown;
    }>(SIDEBAR_KEY),
  );

  const panel = unwrap(
    read<{ mode?: unknown; width?: unknown; section?: unknown }>(
      RIGHT_PANEL_KEY,
    ),
  );

  const mode = isMode(sidebar?.mode) ? sidebar.mode : undefined;
  const panelMode = isPanelMode(panel?.mode) ? panel.mode : undefined;

  return {
    leftPanel: {
      mode: mode ?? "expanded",
      width:
        typeof sidebar?.width === "number"
          ? clampWidth(sidebar.width)
          : RAIL.DEFAULT,
      lastVisible: isVisibleMode(sidebar?.lastVisible)
        ? sidebar.lastVisible
        : "expanded",
      boardsOpen:
        typeof sidebar?.boardsOpen === "boolean" ? sidebar.boardsOpen : true,
    },
    rightPanel: {
      mode: panelMode ?? RIGHT_PANEL_DEFAULT,
      width:
        typeof panel?.width === "number" && Number.isFinite(panel.width)
          ? Math.min(Math.max(PANEL.MIN, Math.round(panel.width)), PANEL.MAX)
          : PANEL.DEFAULT,
      section:
        panel?.section === "tips" || panel?.section === "empty"
          ? panel.section
          : "empty",
    },
  };
}

/**
 * The payload this store writes, and the guard that reads it back.
 *
 * `version: 1` is this shape's first version: the two stores it replaces had
 * their own, and their entries are read by `readLegacyPanels` instead of being
 * migrated, because a migration only ever sees the key it is stored under.
 */
export const panelStatePersist = {
  partialize: (state: PanelState): PersistedPanelState => ({
    leftPanel: {
      mode: state.leftPanel.mode,
      width: state.leftPanel.width,
      lastVisible: state.leftPanel.lastVisible,
      boardsOpen: state.leftPanel.boardsOpen,
    },
    rightPanel: {
      mode: state.rightPanel.mode,
      width: state.rightPanel.width,
      section: state.rightPanel.section,
    },
  }),

  /**
   * A stored payload is validated field by field. Anything unrecognised falls back
   * to the current value rather than to a default, so a payload from a newer build
   * loses only what it cannot describe.
   */
  merge: (persisted: unknown, current: PanelState): PanelState => {
    const saved = (persisted ?? {}) as Partial<PersistedPanelState>;
    const left: Partial<PersistedPanelState["leftPanel"]> =
      saved.leftPanel ?? {};
    const right: Partial<PersistedPanelState["rightPanel"]> =
      saved.rightPanel ?? {};

    const mode = isMode(left.mode) ? left.mode : current.leftPanel.mode;
    const panelMode = isPanelMode(right.mode)
      ? right.mode
      : current.rightPanel.mode;

    return {
      ...current,
      leftPanel: {
        ...current.leftPanel,
        mode,
        width:
          typeof left.width === "number"
            ? clampWidth(left.width)
            : current.leftPanel.width,
        lastVisible: isVisibleMode(left.lastVisible)
          ? left.lastVisible
          : current.leftPanel.lastVisible,
        boardsOpen:
          typeof left.boardsOpen === "boolean"
            ? left.boardsOpen
            : current.leftPanel.boardsOpen,
        hovering: false,
        resizing: false,
      },
      rightPanel: {
        ...current.rightPanel,
        mode: panelMode,
        width:
          typeof right.width === "number" && Number.isFinite(right.width)
            ? Math.min(Math.max(PANEL.MIN, Math.round(right.width)), PANEL.MAX)
            : current.rightPanel.width,
        section:
          right.section === "tips" || right.section === "empty"
            ? right.section
            : current.rightPanel.section,
        /* A reopened column never comes back over the whole board. */
        level: panelMode === "off" ? "normal" : current.rightPanel.level,
      },
    };
  },
} as const;
