import { create } from "zustand";

import { useSidebarState } from "@/features/dashboard";
import { useRightPanel } from "@/stores/rightPanel";
import {
  collapseRail as collapseRailCommand,
  toggleColumn as toggleColumnCommand,
  toggleFullWidth as toggleFullWidthCommand,
  toggleRail as toggleRailCommand,
  type ShellState,
} from "@/lib/shellLayout";

/**
 * The shell's runtime state: what the reader chose lives in `sidebarState` and
 * `rightPanel`, and this store holds only what neither of them can know —
 * the group's measured width, and whether a sash is being dragged.
 *
 * It is deliberately not persisted: a measured width is not a choice.
 */

interface LayoutShellState {
  /** The group's measured width in px, 0 until it is measured. */
  groupPx: number;
  /** True while a sash is dragging — the shell uses it to kill transitions. */
  resizing: boolean;

  setGroupPx: (groupPx: number) => void;
  setResizing: (resizing: boolean) => void;
  /** The one writer: `settleDrag` and every command land here. */
  commit: (patch: Partial<ShellState>) => void;

  /** ⌘B — open ↔ hidden, and close the column when both cannot fit. */
  toggleRail: () => void;
  /** ⌘⇧B — the icon strip. */
  collapseRail: () => void;
  /** ⌘J — the column open ↔ closed. */
  togglePanel: () => void;
  /** ⌘⇧J — full width ↔ normal. */
  toggleLevel: () => void;
}

/** What the reader chose, read out of the two stores that own it. */
export function readShellState(): ShellState {
  const rail = useSidebarState.getState();
  const panel = useRightPanel.getState();

  return {
    railOpen: rail.mode !== "hidden",
    railCollapsed: rail.mode === "collapsed",
    railPx: rail.width,
    columnOpen: panel.mode !== "off",
    columnPx: panel.width,
    fullWidth: panel.level === "remaining",
  };
}

/**
 * The only place a model change reaches the stores.
 *
 * Nothing is inferred from a measurement: a patch says what the reader chose, and
 * this writes exactly that.
 */
export function commitShell(patch: Partial<ShellState>): void {
  const rail = useSidebarState.getState();
  const panel = useRightPanel.getState();

  if (patch.railOpen === false) rail.setMode("hidden");
  else if (patch.railCollapsed === true) rail.setMode("collapsed");
  else if (patch.railOpen === true) rail.setMode("open");

  if (typeof patch.railPx === "number") rail.setWidth(patch.railPx);

  if (patch.columnOpen === false) panel.setMode("off");
  else if (patch.columnOpen === true && panel.mode === "off") {
    panel.setMode("panel");
  }

  if (typeof patch.columnPx === "number") panel.setWidth(patch.columnPx);

  if (typeof patch.fullWidth === "boolean") {
    panel.setLevel(patch.fullWidth ? "remaining" : "normal");
  }
}

export const useLayoutShellStore = create<LayoutShellState>()((set, get) => ({
  groupPx: 0,
  resizing: false,

  setGroupPx: (groupPx) => set({ groupPx }),
  setResizing: (resizing) => set({ resizing }),
  commit: (patch) => commitShell(patch),

  toggleRail: () => {
    commitShell(toggleRailCommand(get().groupPx, readShellState()));
  },
  collapseRail: () => {
    commitShell(collapseRailCommand());
  },
  togglePanel: () => {
    commitShell(toggleColumnCommand(get().groupPx, readShellState()));
  },
  toggleLevel: () => {
    commitShell(toggleFullWidthCommand(get().groupPx, readShellState()));
  },
}));
