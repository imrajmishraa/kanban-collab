import { PANEL } from "@/components/layout/panelMetrics";
import { RAIL_MAX, RAIL_MIN } from "./layoutNumbers";

/**
 * The two rails share one window — desktop rules.
 *
 *     rail + panel + board = viewport        board >= PAGE_MIN (420)
 *
 * Whichever side is dragged keeps what it asks for; the **other** side gives up the
 * overflow. Without this the rail walked over the page when the column was already wide:
 * the pair grew past the window and nothing pushed back.
 */
/* One copy of the rail's numbers, in `railMetrics`, so a change there reaches
   the coupling too. C1 moved the floor to 200 and this file had it at 240. */
/* Typed as `number`, not as the literal: callers pass their own floor (a collapsed
   rail is 72), and a literal type would reject every value but 200. */
export { RAIL_MAX, RAIL_MIN };
/** How far past a threshold a push must go before it changes level. */
export const FULL_SLOP = 32;

export interface CoupleInput {
  /** Which side is being dragged. `null` only clamps both. */
  active?: "rail" | "panel" | null;
  railWanted: number;
  panelWanted: number;
  viewport: number;
  /** A collapsed rail is 72 — below its own minimum, so the floor is a parameter. */
  railFloor?: number;
  panelFloor?: number;
  panelOpen?: boolean;
}

export interface Pair {
  rail: number;
  panel: number;
}

export function couple({
  active = null,
  railWanted,
  panelWanted,
  viewport,
  railFloor = RAIL_MIN,
  panelFloor = PANEL.MIN,
  panelOpen = true,
}: CoupleInput): Pair {
  const budget = viewport - PANEL.PAGE_MIN;
  const panelCeiling = Math.max(panelFloor, budget - railFloor);

  let rail = Math.min(RAIL_MAX, Math.max(railFloor, Math.round(railWanted)));
  let panel = panelOpen
    ? Math.min(panelCeiling, Math.max(panelFloor, Math.round(panelWanted)))
    : 0;

  const over = rail + panel - budget;

  if (over > 0) {
    if (active === "panel") {
      rail = Math.max(railFloor, rail - over);
    } else {
      panel = panelOpen ? Math.max(panelFloor, panel - over) : 0;

      /* The column may already be at its floor, so whatever is still over comes from the
         rail. One step is not enough — a 1024px window left the board at 416. */
      const rest = rail + panel - budget;
      if (rest > 0) rail = Math.max(railFloor, rail - rest);
    }
  }

  return { rail, panel };
}

/** The widest the column may be while it sits beside the board. */
export const besideMax = (viewport: number, railFloor = RAIL_MIN): number =>
  Math.max(PANEL.MIN, viewport - railFloor - PANEL.PAGE_MIN);

/**
 * Where a panel drag lands.
 *
 * The ladder, in order: beside the board → `remaining` (board gone, rail kept) → `full`
 * (rail gone too). Pushing past the board's floor must not skip the middle step.
 */
export function panelDragLevel(
  rawWidth: number,
  viewport: number,
  railFloor = RAIL_MIN,
): "normal" | "remaining" | "full" {
  /*
   * The order matters, and it is the user's order:
   *
   *   1. the column grows and **presses the rail** — 420 down to 240 — while the board
   *      keeps its 420
   *   2. only when the rail can give no more does the column take `remaining`
   *   3. and only past everything the rail leaves does it take `full`
   *
   * So `beside` is measured against the rail's floor. Measuring it against the rail's
   * current width flipped the column to `remaining` while the rail was still at 300-odd.
   */
  const beside = besideMax(viewport, railFloor);
  const remaining = Math.max(PANEL.MIN, viewport - railFloor);

  if (rawWidth > remaining + FULL_SLOP) return "full";
  if (rawWidth > beside + FULL_SLOP) return "remaining";

  return "normal";
}
