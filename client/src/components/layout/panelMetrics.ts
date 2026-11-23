/**
 * The right column's numbers — deliberately *not* the app rail's.
 *
 * The two edges look alike and are not. The left rail is navigation: narrow, always
 * there, and a 72px icon form makes sense because labels are optional there. The right
 * column is a work surface — it holds rows, cards, a feed, whatever a section puts in
 * it — so it starts wider, can go wider still, and has no icon-only form: a content
 * panel with nothing but icons is a panel with nothing in it.
 *
 * | | left rail | right column |
 * |---|---|---|
 * | min | 240 | **320** |
 * | default | 288 | **400** |
 * | max | 420 | **560** |
 * | beyond max | stops | **full width** |
 * | collapsed | 72 icon rail | **none** |
 */
export const PANEL = {
  /** Narrower than this and the rows wrap into unreadable strips. */
  MIN: 320,
  /** First run, and what the toggle opens at. */
  DEFAULT: 420,
  /** Widest a drag can go before it means "full width". */
  MAX: 560,
  /** Past MAX by this much the column takes the window instead. */
  FULL_SLOP: 32,
  /** Past MIN by this much a drag closes the panel. */
  CLOSE_SLOP: 48,
  /** The board is not rendered under this, however wide the window. */
  PAGE_MIN: 420,
} as const;

/** Magnetic stops, narrowest first. `ceiling` moves with the window. */
export const panelStops = (ceiling: number): number[] =>
  [...new Set([PANEL.MIN, PANEL.DEFAULT, PANEL.MAX, ceiling])]
    .filter((stop) => stop <= ceiling)
    .sort((a, b) => a - b);

/** Clamped to the window, never below MIN. */
export const clampPanelWidth = (width: number, ceiling: number): number =>
  Math.min(
    Math.max(PANEL.MIN, Math.round(ceiling)),
    Math.max(PANEL.MIN, Math.round(width)),
  );

/**
 * The widest the column may be: everything except the app rail and the board's own
 * minimum. Dragging past it is what "full width" is for.
 */
export const panelCeiling = (viewport: number, appRailWidth: number): number =>
  Math.max(PANEL.MIN, Math.round(viewport - appRailWidth - PANEL.PAGE_MIN));

export interface PanelLayoutInput {
  mode: "off" | "panel";
  width: number;
  maximized: boolean;
  /** Everything the rail leaves, rail untouched. */
  expanded?: boolean;
  viewport: number;
  appRailWidth: number;
}

export interface PanelLayout {
  ceiling: number;
  /**
   * How wide the column is when it takes everything the app rail leaves.
   *
   * Not the whole viewport: the rail is never covered. Whatever it is rendering at —
   * 0 hidden, 72 collapsed, or its stored width — the panel gets the rest.
   */
  fullWidth: number;
  width: number;
  hidden: boolean;
  maximized: boolean;
  expanded: boolean;
  /** What the page gives up on the right. */
  reserved: number;
  /** False when the board would be a sliver: it is not rendered at all. */
  pageVisible: boolean;
}

/**
 * Open or closed, plus full width. There is no third state, and no icon form.
 *
 * `maximized` is a mode rather than a width: at the window's width the pixel value is
 * meaningless and the next resize would change it, so restoring returns to the stored
 * width instead.
 */
export function computePanel({
  mode,
  width,
  maximized,
  expanded = false,
  viewport,
  appRailWidth,
}: PanelLayoutInput): PanelLayout {
  const ceiling = panelCeiling(viewport, appRailWidth);
  const clamped = clampPanelWidth(width, ceiling);

  const hidden = mode === "off";
  const isMaximized = !hidden && maximized;

  /* Full width is "everything except the app rail": 72px of icons leaves 72px less, a
     closed rail leaves all of it. */
  const fullWidth = Math.max(PANEL.MIN, Math.round(viewport - appRailWidth));

  /* Three levels, narrowest first: the stored width, everything the rail leaves, the
     whole viewport. Fullscreen is the only one that covers the rail. */
  const isExpanded = !hidden && !isMaximized && expanded;

  const reserved = hidden
    ? 0
    : isMaximized
      ? Math.round(viewport)
      : isExpanded
        ? fullWidth
        : clamped;

  return {
    ceiling,
    fullWidth,
    width: clamped,
    hidden,
    maximized: isMaximized,
    expanded: isExpanded,
    reserved,
    pageVisible:
      !isMaximized && viewport - appRailWidth - reserved >= PANEL.PAGE_MIN,
  };
}
