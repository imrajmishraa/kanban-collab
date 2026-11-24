import { create } from "zustand";
import { persist } from "zustand/middleware";

import { PANEL, type PanelLevel } from "@/components/layout/panelMetrics";

/**
 * What the right column shows — if anything.
 *
 * Off by default, deliberately. The bell in the navbar is the notification
 * surface this app already has, and a column nobody asked for takes width away
 * from the board on every screen. The choice belongs to the reader, and it is
 * stored per browser (like the rail's mode), not per workspace: a layout
 * preference is not something an admin should be able to set for other people.
 *
 * `RIGHT_PANEL_MODES` is the one table the settings screen renders from, so a
 * new mode is a single entry here and cannot drift from the store's own type.
 * That is the "default rule" for this surface: add a mode in one place, and the
 * settings UI, the labels and the guard in `merge` all follow.
 */
export type RightPanelMode = "off" | "panel";

/** The panel's body. `empty` is the resting state; sections add themselves here. */
export type PanelSection = "empty" | "tips";

export interface RightPanelOption {
  mode: RightPanelMode;
  label: string;
  /** Shown under the label — what the reader gets, in one line. */
  description: string;
}

export const RIGHT_PANEL_MODES: readonly RightPanelOption[] = [
  {
    mode: "off",
    label: "Off",
    description:
      "The bell in the navbar opens the inbox, as it does today. Nothing is added to the layout.",
  },
  {
    mode: "panel",
    label: "Panel",
    description:
      "A column on the right for whatever you are working on, from 1024px up. It starts empty; sections land here as they are built.",
  },
];

/** Off is the default: no existing reader's layout changes on upgrade. */
/**
 * E2: the column is on for everyone, and the settings toggle turns it off. It used to be
 * opt-in; the board is designed around it now.
 */
export const RIGHT_PANEL_DEFAULT: RightPanelMode = "panel";

/**
 * A stored value can be anything — a mode from a newer build, a hand-edited
 * localStorage entry, or a stale string from before a rename. Anything that is
 * not in the table above falls back to the default instead of rendering an
 * empty column.
 */
function isMode(value: unknown): value is RightPanelMode {
  return RIGHT_PANEL_MODES.some((option) => option.mode === value);
}

interface RightPanelState {
  mode: RightPanelMode;
  /** Persisted. Clamped on read and again at layout time. */
  width: number;
  /**
   * `normal` is the stored width; `remaining` is everything the rail leaves.
   *
   * One flag, not two: "fullscreen" is `remaining` with the rail hidden, so there is
   * nothing extra to enter or leave.
   */
  level: PanelLevel;
  /** What the panel is showing. Sections land here as they are built. */
  section: PanelSection;

  setMode: (mode: RightPanelMode) => void;
  setWidth: (width: number) => void;
  setLevel: (level: PanelLevel) => void;
  setSection: (section: PanelSection) => void;
  /** Take the remaining width, or go back to the stored width. Never touches the rail. */
  toggleLevel: () => void;
  /** ⌘J and the navbar toggle: closed ↔ open, from either side. */
  toggle: () => void;
}

export const useRightPanel = create<RightPanelState>()(
  persist(
    (set) => ({
      mode: RIGHT_PANEL_DEFAULT,
      width: PANEL.DEFAULT,
      level: "normal",
      section: "empty",

      setMode: (mode) =>
        set((state) => ({
          mode,
          /* Closing drops the level, or the next open would come back over the whole
             board. */
          level: mode === "off" ? "normal" : state.level,
        })),
      setWidth: (width) => set({ width: Math.round(width) }),
      setLevel: (level) => set({ level }),
      setSection: (section) => set({ section }),
      toggleLevel: () =>
        set((state) => ({
          level: state.level === "remaining" ? "normal" : "remaining",
        })),

      /* One toggle, two states. "off" is the only closed state. */
      toggle: () =>
        set((state) => ({
          mode: state.mode === "off" ? "panel" : "off",
          /* Closing drops the level too — a reopened panel should not come back over
             the whole board. */
          level: "normal",
        })),
    }),
    {
      name: "kanban.right-panel",
      /* Versioned from the first write: a width (the resize handle) and an
         activity mode are planned, so the persisted shape will change and old
         entries need a migration path. */
      /* v2 adds the width and full width. The `migrate` below is what keeps an
         entry written by v1 from warning on every load and being thrown away. */
      version: 2,
      partialize: (state) => ({
        mode: state.mode,
        width: state.width,
        section: state.section,
      }),
      /*
       * Same reason as `docsSidebar`: a `version` without a `migrate` makes zustand
       * warn on every load and drop the stored value. It also has to survive an
       * entry written by a newer build (the right-column work bumps this to 2), so
       * anything it does not recognise falls back to the default instead of
       * throwing.
       */
      migrate: (persisted) => {
        const old = persisted as
          { mode?: unknown; width?: unknown; section?: unknown } | undefined;

        return {
          mode: isMode(old?.mode) ? old.mode : RIGHT_PANEL_DEFAULT,
          width:
            typeof old?.width === "number" && Number.isFinite(old.width)
              ? Math.round(old.width)
              : PANEL.DEFAULT,
          /* The level never survives a reload: it is a gesture, not a preference. */
          level: "normal" as PanelLevel,
          section: old?.section === "tips" ? ("tips" as PanelSection) : "empty",
        };
      },
      merge: (persisted, current) => {
        const saved = persisted as
          { mode?: unknown; width?: unknown; section?: unknown } | undefined;

        return {
          ...current,
          mode: isMode(saved?.mode) ? saved.mode : current.mode,
          width:
            typeof saved?.width === "number" && Number.isFinite(saved.width)
              ? Math.round(saved.width)
              : current.width,
          level: "normal" as PanelLevel,
          section:
            saved?.section === "tips" ? ("tips" as PanelSection) : "empty",
        };
      },
    },
  ),
);
