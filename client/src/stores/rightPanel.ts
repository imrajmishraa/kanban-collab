import { create } from "zustand";
import { persist } from "zustand/middleware";

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
export type RightPanelMode = "off" | "notifications";

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
    mode: "notifications",
    label: "Notifications",
    description:
      "A fixed inbox column on the right, from 1024px up. Narrower screens keep the bell.",
  },
];

/** Off is the default: no existing reader's layout changes on upgrade. */
export const RIGHT_PANEL_DEFAULT: RightPanelMode = "off";

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
  setMode: (mode: RightPanelMode) => void;
}

export const useRightPanel = create<RightPanelState>()(
  persist(
    (set) => ({
      mode: RIGHT_PANEL_DEFAULT,

      setMode: (mode) => set({ mode }),
    }),
    {
      name: "kanban.right-panel",
      /* Versioned from the first write: a width (the resize handle) and an
         activity mode are planned, so the persisted shape will change and old
         entries need a migration path. */
      version: 1,
      partialize: (state) => ({ mode: state.mode }),
      /*
       * Same reason as `docsSidebar`: a `version` without a `migrate` makes zustand
       * warn on every load and drop the stored value. It also has to survive an
       * entry written by a newer build (the right-column work bumps this to 2), so
       * anything it does not recognise falls back to the default instead of
       * throwing.
       */
      migrate: (persisted) => {
        const old = persisted as { mode?: unknown } | undefined;

        return { mode: isMode(old?.mode) ? old.mode : RIGHT_PANEL_DEFAULT };
      },
      merge: (persisted, current) => {
        const saved = persisted as { mode?: unknown } | undefined;

        return {
          ...current,
          mode: isMode(saved?.mode) ? saved.mode : current.mode,
        };
      },
    },
  ),
);
