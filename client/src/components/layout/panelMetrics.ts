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
 * | default | 288 | **420** |
 * | max | 560 | |
 * | beyond max | stops | **takes the remaining width** |
 * | collapsed | 72 icon rail | **none** |
 */
export const PANEL = {
  /** Narrower than this and the rows wrap into unreadable strips. */
  MIN: 320,
  /** First run, and what the toggle opens at. */
  DEFAULT: 420,
  /** Widest a drag can go before it means "take the rest". */
  MAX: 560,
  /** Past the ceiling by this much the column takes the rest of the width. */
  FULL_SLOP: 32,
  /** Where the column gives up and the left rail's rules take over. */
  CLOSE_SLOP: 48,
  /** The board keeps this much at the drag's ceiling, however wide the window. */
  PAGE_MIN: 420,
} as const;

/**
 * Two levels. There is no third one, and no "fullscreen".
 *
 * `remaining` is *everything the rail is not using*, so it becomes the whole window by
 * itself once the rail is hidden — `viewport - 0`. That is the whole trick: fullscreen is
 * not a state that has to be entered and left, it is what `remaining` means when there
 * is no rail, and nothing has to close the rail to get there.
 */
/**
 * The column's levels. `closed` is the store's resting state and `full` covers the whole
 * window — both are stored, not derived.
 */
export type PanelLevel = "closed" | "normal" | "remaining" | "full";

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
 * The column's own drag limit: the board keeps `PAGE_MIN`. Below that the column has run
 * out of room, which is where the left rail's rules begin.
 */
export const panelCeiling = (viewport: number, appRailWidth: number): number =>
  Math.max(PANEL.MIN, Math.round(viewport - appRailWidth - PANEL.PAGE_MIN));

/** Everything the rail is not using. The whole window when the rail is hidden. */
export const panelRemaining = (
  viewport: number,
  appRailWidth: number,
): number => Math.max(PANEL.MIN, Math.round(viewport - appRailWidth));

export interface PanelLayoutInput {
  mode: "off" | "panel";
  level: PanelLevel;
  width: number;
  viewport: number;
  appRailWidth: number;
}

export interface PanelLayout {
  ceiling: number;
  /** What `remaining` means right now: `viewport - appRailWidth`. */
  remaining: number;
  /** The width the column should render at, and what the page gives up. */
  reserved: number;
  hidden: boolean;
  /** `remaining` with no rail to leave room for — the whole window. */
  fullscreen: boolean;
  /** False when the board would be a sliver: it is not rendered at all. */
  pageVisible: boolean;
}

/**
 * Open or closed, at one of two levels.
 *
 * `reserved` is the single number everything reads: the column's own width, the page's
 * margin, and the navbar's right edge. Returning a width *and* a separate "reserved"
 * value is how the column once rendered 420px while the page made room for 1152.
 */
export function computePanel({
  mode,
  level,
  width,
  viewport,
  appRailWidth,
}: PanelLayoutInput): PanelLayout {
  const ceiling = panelCeiling(viewport, appRailWidth);
  const remaining = panelRemaining(viewport, appRailWidth);

  const hidden = mode === "off";

  const reserved = hidden
    ? 0
    : level === "remaining"
      ? remaining
      : clampPanelWidth(width, ceiling);

  return {
    ceiling,
    remaining,
    reserved,
    hidden,
    fullscreen: !hidden && reserved >= Math.round(viewport),
    /* The board is hidden only when the column is *using* the space, never because the
       column is closed: `hidden` means the page has all of it. Getting this wrong is a
       white screen — the layout stops rendering `<main>` altogether. */
    pageVisible: viewport - appRailWidth - reserved >= PANEL.PAGE_MIN,
  };
}
