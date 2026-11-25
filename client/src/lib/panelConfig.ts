/**
 * Panel numbers for the group shell — aligned with Layout.md §3 (Grok-style).
 *
 * - Numbers (no unit) = pixels for min
 * - Strings with % = percentage shares for default / max
 */

export interface PanelConfig {
  defaultSize?: `${number}%`;
  minSize: number;
  maxSize: `${number}%`;
  collapsible: boolean;
  collapsedSize?: number | `${number}%`;
}

export type PanelId = "leftPanel" | "centreLayout" | "rightPanel";
export type PanelDevice = "desktop" | "tablet" | "mobile";

/**
 * Desktop (≥1024)
 * Left:  min 200 · default ~280 (≈18%) · max share 28%
 * Main:  min 400
 * Right: min 320 · default ~400 (≈26%) · max share 55%
 */
export const panelConfig = {
  leftPanel: {
    defaultSize: "18%",
    minSize: 200,
    maxSize: "28%",
    collapsible: true,
    collapsedSize: 0,
  },
  centreLayout: {
    minSize: 400,
    maxSize: "70%",
    collapsible: false,
  },
  rightPanel: {
    defaultSize: "26%",
    minSize: 320,
    maxSize: "55%",
    collapsible: true,
    collapsedSize: 0,
  },
} satisfies Record<PanelId, PanelConfig>;

export const panelConfigByDevice = {
  desktop: panelConfig,
  tablet: {
    leftPanel: {
      defaultSize: "20%",
      minSize: 200,
      maxSize: "30%",
      collapsible: true,
      collapsedSize: 0,
    },
    centreLayout: {
      minSize: 400,
      maxSize: "65%",
      collapsible: false,
    },
    rightPanel: {
      defaultSize: "28%",
      minSize: 280,
      maxSize: "35%",
      collapsible: true,
      collapsedSize: 0,
    },
  },
  mobile: {
    leftPanel: {
      defaultSize: "0%",
      minSize: 0,
      maxSize: "0%",
      collapsible: false,
      collapsedSize: 0,
    },
    centreLayout: {
      defaultSize: "100%",
      minSize: 0,
      maxSize: "100%",
      collapsible: false,
      collapsedSize: 0,
    },
    rightPanel: {
      defaultSize: "0%",
      minSize: 0,
      maxSize: "0%",
      collapsible: false,
      collapsedSize: 0,
    },
  },
} satisfies Record<PanelDevice, Record<PanelId, PanelConfig>>;

export const isPanelRenderable = (config: PanelConfig): boolean =>
  Number.parseFloat(config.maxSize) > 0;

export const percentOf = (size: `${number}%` | undefined): number =>
  size ? Number.parseFloat(size) : 0;

export const totalDefaultPercent = (device: PanelDevice): number =>
  Object.values(panelConfigByDevice[device]).reduce(
    (sum, config) => sum + percentOf(config.defaultSize),
    0,
  );

/** Layout.md collapsed icon-rail width. */
export const RAIL_COLLAPSED_PX = 64;

/** Layout.md defaults (px) when expanding without a stored width. */
export const LAYOUT_DEFAULTS_PX = {
  left: 280,
  right: 400,
} as const;
