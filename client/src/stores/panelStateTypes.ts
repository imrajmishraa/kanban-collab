import type { PanelLevel } from "@/components/layout/panelMetrics";
import type { PanelSection, RightPanelMode } from "@/stores/rightPanelTypes";
import type { SidebarMode, VisibleMode } from "@/lib/sidebarMode";

/**
 * The three panes, and what each one is allowed to remember.
 *
 * One store, three slices. The reason is the thing that went wrong twice while
 * the shell was being built: the rail's width and the column's width were written
 * by two stores and read back by a third, and a drag on one pane could land in a
 * state the other had already moved past. A single store with one `set` per
 * gesture is what makes "who writes what" answerable in one place.
 *
 * `notificationPanel` is the shape a fourth pane will take; it is named here so
 * the next slice lands beside its siblings rather than in a store of its own.
 */

/** The rail. `hidden` is off the page; `collapsed` is the 72px strip. */
export interface LeftPanelState {
  mode: SidebarMode;
  /** Stored open width in px. Clamped on read and on write. */
  width: number;
  /** What the toggle restores: the last mode that showed the rail. */
  lastVisible: VisibleMode;
  /** A preview is a glance, not a mode — runtime only, never persisted. */
  hovering: boolean;
  /** True while a divider is dragging, so nothing animates mid-gesture. */
  resizing: boolean;
  /** The rail's boards list, open or folded away. */
  boardsOpen: boolean;

  setMode: (mode: SidebarMode) => void;
  setWidth: (width: number) => void;
  setHovering: (hovering: boolean) => void;
  setResizing: (resizing: boolean) => void;

  toggleCollapsed: () => void;
  collapse: () => void;
  expand: () => void;
  hide: () => void;
  /** The navbar toggle: hidden → whatever was visible, otherwise → collapsed. */
  toggleHidden: () => void;
  /** A click inside a preview pins what the reader is looking at. */
  openFromPreview: () => void;
  /** ⌘B: open ↔ hidden, nothing in between. */
  toggleOpenHidden: () => void;
  peek: () => void;
  unpeek: () => void;

  toggleBoards: () => void;
  openBoards: () => void;
  closeBoards: () => void;
}

/**
 * The board's column.
 *
 * It has no width to choose: `100 − rail − column` is the answer, computed in
 * `lib/shellLayout.ts`. What it does own is where it was left — the scroll
 * position of the page it carries — which is why the routed `children` stay a
 * prop of `CentrePanelLayout` and not a field here.
 */
export interface MainPanelState {
  scrollTop: number;
  setScrollTop: (scrollTop: number) => void;
}

/** The column on the right. `level` is the gesture; `width` is the preference. */
export interface RightPanelState {
  mode: RightPanelMode;
  width: number;
  level: PanelLevel;
  section: PanelSection;

  setMode: (mode: RightPanelMode) => void;
  setWidth: (width: number) => void;
  setLevel: (level: PanelLevel) => void;
  setSection: (section: PanelSection) => void;
  /** Take the remaining width, or go back to the stored width. Never moves the rail. */
  toggleLevel: () => void;
  /** ⌘J and the navbar toggle: closed ↔ open, from either side. */
  toggle: () => void;
}

export interface PanelState {
  leftPanel: LeftPanelState;
  centrePanel: MainPanelState;
  rightPanel: RightPanelState;
  // notificationPanel: NotificationPanelState;   — the fourth pane, when it lands
}

/** The shape a reload is allowed to restore. Nothing derived, nothing transient. */
export type PersistedPanelState = {
  leftPanel: Pick<
    LeftPanelState,
    "mode" | "width" | "lastVisible" | "boardsOpen"
  >;
  rightPanel: Pick<RightPanelState, "mode" | "width" | "section">;
};
