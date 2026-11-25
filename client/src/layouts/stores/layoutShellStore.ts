import { create } from "zustand";
import { persist } from "zustand/middleware";

import type { PanelLevel } from "@/components/layout/panelMetrics";
import { useSidebarState } from "@/features/dashboard/stores/sidebarState";
import { useRightPanel } from "@/stores/rightPanel";
import type { PanelDevice } from "@/lib/panelConfig";
import { panelConfigByDevice, percentOf } from "@/lib/panelConfig";

/** Alias of PanelLevel so the shell never drifts from rightPanel / panelMetrics. */
export type ShellLevel = PanelLevel;

export interface ShellSizes {
  left: number;
  centre: number;
  right: number;
}

interface LayoutShellState {
  /** Last measured pixel sizes (spike readout / debug). Runtime only. */
  sizes: ShellSizes;
  /** True while a sash is dragging — kill CSS transitions on the shell. */
  resizing: boolean;
  /** Device band used for defaults / floors. */
  device: PanelDevice;

  setSizes: (sizes: ShellSizes) => void;
  setResizing: (resizing: boolean) => void;
  setDevice: (device: PanelDevice) => void;

  railVisible: () => boolean;
  panelOpen: () => boolean;
  level: () => PanelLevel;

  toggleRail: () => void;
  togglePanel: () => void;
  setLevel: (level: PanelLevel) => void;
  toggleLevel: () => void;

  /**
   * Called from Group.onLayoutChanged with percentage layout + group width.
   * Writes pixel widths back into sidebar / rightPanel stores when settled.
   */
  applyLayout: (layout: Record<string, number>, groupWidth: number) => void;

  /** Percentage layout for the group's first paint. */
  defaultLayoutFor: (
    device: PanelDevice,
    panelOpen: boolean,
  ) => {
    leftPanel: number;
    centreLayout: number;
    rightPanel: number;
  };
}

export const useLayoutShellStore = create<LayoutShellState>()(
  persist(
    (set, get) => ({
      sizes: { left: 0, centre: 0, right: 0 },
      resizing: false,
      device: "desktop",

      setSizes: (sizes) => set({ sizes }),
      setResizing: (resizing) => set({ resizing }),
      setDevice: (device) => set({ device }),

      railVisible: () => useSidebarState.getState().mode !== "hidden",
      panelOpen: () => useRightPanel.getState().mode !== "off",
      level: () => useRightPanel.getState().level,

      toggleRail: () => {
        const { mode, setMode } = useSidebarState.getState();
        setMode(mode === "hidden" ? "open" : "hidden");
      },

      togglePanel: () => {
        useRightPanel.getState().toggle();
      },

      setLevel: (level) => {
        useRightPanel.getState().setLevel(level);
      },

      toggleLevel: () => {
        const panel = useRightPanel.getState();
        if (panel.mode === "off") panel.setMode("panel");
        panel.toggleLevel();
      },

      applyLayout: (layout, groupWidth) => {
        if (!groupWidth) return;

        const px = (id: string) =>
          Math.round(((layout[id] ?? 0) / 100) * groupWidth);

        const left = px("leftPanel");
        const centre = px("centreLayout");
        const right = px("rightPanel");

        set({ sizes: { left, centre, right } });

        const { resizing } = get();
        // Avoid store thrash mid-drag; AppLayout / shell use widths for labels.
        if (resizing) return;

        const railVisible = get().railVisible();
        const panelOpen = get().panelOpen();

        if (railVisible && left > 0) {
          useSidebarState.getState().setWidth(left);
        }
        if (panelOpen && right > 0) {
          useRightPanel.getState().setWidth(right);
        }

        // Drag past configured max → "remaining" (column takes the rest).
        const { device } = get();
        const config = panelConfigByDevice[device];
        const level = useRightPanel.getState().level;
        if (level !== "normal" || !panelOpen) return;

        const rightShare = layout.rightPanel ?? 0;
        const leftShare = layout.leftPanel ?? 0;
        const pastRight =
          rightShare > percentOf(config.rightPanel.maxSize) + 0.5;
        const pastLeft =
          device === "tablet" &&
          leftShare > percentOf(config.leftPanel.maxSize) + 0.5;

        if (pastRight || pastLeft) {
          useRightPanel.getState().setLevel("remaining");
        }
      },

      defaultLayoutFor: (device, panelOpen) => {
        const config = panelConfigByDevice[device];
        const left = percentOf(config.leftPanel.defaultSize);
        const right = percentOf(config.rightPanel.defaultSize);
        return {
          leftPanel: left,
          centreLayout: Math.max(0, 100 - left - (panelOpen ? right : 0)),
          rightPanel: panelOpen ? right : 0,
        };
      },
    }),
    {
      name: "kanban.layout-shell",
      version: 1,
      // Widths live in sidebar / rightPanel stores; only device preference here.
      partialize: (state) => ({ device: state.device }),
    },
  ),
);
