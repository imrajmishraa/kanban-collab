/**
 * Every panel's numbers, in one typed table — percentage-first.
 *
 * The shape is the layout brief's:
 *
 *     DashboardLayout
 *     ├── LeftPanel   (rail / MainSidebar)   → Separator
 *     ├── WorkspaceLayout (board / page)
 *     └── RightPanel                         → Separator
 *
 * Sizing follows `react-resizable-panels` v4, whose own type docs settle it:
 * a **number is pixels**, a **unitless string is a percentage**, and an explicit
 * `"22%"` / `"240px"` is always clearer. So:
 *
 *   - `defaultSize` is a percentage — a side panel that is 22% of a laptop is
 *     still a side panel on a 4K monitor;
 *   - `minSize` is pixels — the floor must not shrink with the window;
 *   - `maxSize` is a percentage — a ceiling that keeps a panel from eating a
 *     large screen;
 *   - the centre carries no `defaultSize`: it takes what the two edges leave.
 *
 * ⚠️ The numbers are the brief's starting points, not a decision. `Layout.md`
 * is the source of truth for what the app runs today; this module is what the
 * shell will run once the numbers are signed off.
 */

export interface PanelConfig {
  /** Percentage of the group, e.g. `"22%"`. A bare number here would be pixels. */
  defaultSize?: `${number}%`;
  /** Pixels: a floor that does not shrink with the window. */
  minSize: number;
  /** Percentage: a ceiling so a panel cannot eat a large screen. */
  maxSize: `${number}%`;
  collapsible: boolean;
}

export type PanelId = "leftPanel" | "workspaceLayout" | "rightPanel";

export type PanelDevice = "desktop" | "tablet" | "mobile";

/**
 * Desktop.
 *
 * The two edges are 18–28% with a 200/260px floor, and the centre holds the
 * board's own 420px floor. The percentages sum to 100 so the first paint has no
 * slack to distribute.
 */
export const panelConfig = {
  leftPanel: {
    defaultSize: "20%",
    minSize: 200,
    maxSize: "28%",
    collapsible: true,
  },
  workspaceLayout: { minSize: 420, maxSize: "70%", collapsible: false },
  rightPanel: {
    defaultSize: "22%",
    minSize: 320,
    maxSize: "55%",
    collapsible: true,
  },
} satisfies Record<PanelId, PanelConfig>;

/**
 * Tablet keeps its own set: the same floors, tighter ceilings, because 200px is
 * a much larger share of 1023 than of 1440.
 */
export const panelConfigByDevice = {
  desktop: panelConfig,
  tablet: {
    leftPanel: {
      defaultSize: "20%",
      minSize: 200,
      maxSize: "30%",
      collapsible: true,
    },
    workspaceLayout: { minSize: 420, maxSize: "65%", collapsible: false },
    rightPanel: {
      defaultSize: "27%",
      minSize: 320,
      maxSize: "35%",
      collapsible: true,
    },
  },
  mobile: {
    /* Zeros, not omissions: every device's record keeps the same shape, so the
       shell can read a config without asking which device it came from. */
    leftPanel: {
      defaultSize: "0%",
      minSize: 0,
      maxSize: "0%",
      collapsible: false,
    },
    workspaceLayout: {
      defaultSize: "100%",
      minSize: 0,
      maxSize: "100%",
      collapsible: false,
    },
    rightPanel: {
      defaultSize: "0%",
      minSize: 0,
      maxSize: "0%",
      collapsible: false,
    },
  },
} satisfies Record<PanelDevice, Record<PanelId, PanelConfig>>;

/** A panel with no maximum has nowhere to be drawn — that is how mobile says "off". */
export const isPanelRenderable = (config: PanelConfig): boolean =>
  Number.parseFloat(config.maxSize) > 0;

/** Percentage as a number, for the arithmetic below. */
export const percentOf = (size: `${number}%` | undefined): number =>
  size ? Number.parseFloat(size) : 0;

/**
 * The percentages a device's defaults add up to.
 *
 * Not a hard rule — the centre has no default and takes the remainder — but a
 * total that is nowhere near 100 means a panel was given the wrong kind of size
 * (a pixel number where a percentage belongs, or the reverse).
 */
export const totalDefaultPercent = (device: PanelDevice): number =>
  Object.values(panelConfigByDevice[device]).reduce(
    (sum, config) => sum + percentOf(config.defaultSize),
    0,
  );
