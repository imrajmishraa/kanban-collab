/**
 * The column's vocabulary, apart from its store.
 *
 * `PanelState` (in `panelState.ts`) owns the state; this file owns the names it
 * uses, so a component that only needs "which modes exist" does not import the
 * store — and so the store can be deleted or replaced without taking the type
 * with it.
 */

/** Two states, not three: the column is either on the page or it is not. */
export type RightPanelMode = "off" | "panel";

export interface RightPanelOption {
  mode: RightPanelMode;
  label: string;
  /** Shown under the label — what the reader gets, in one line. */
  description: string;
}

/**
 * The table every entry point reads: the navbar toggle, the settings page and the
 * keyboard all walk this, so a new mode is a single entry here and cannot drift
 * from the store's own type.
 */
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

/**
 * E2: the column is on for everyone, and the settings toggle turns it off. It used
 * to be opt-in; the board is designed around it now.
 */
export const RIGHT_PANEL_DEFAULT: RightPanelMode = "panel";

/** The panel's body. `empty` is the resting state; sections add themselves here. */
export type PanelSection = "empty" | "tips";

export const isMode = (value: unknown): value is RightPanelMode =>
  RIGHT_PANEL_MODES.some((option) => option.mode === value);
