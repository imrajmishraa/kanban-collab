import { describe, expect, it } from "vitest";

import { estimateMenuHeight, placeMenu } from "./menuPlacement";

/**
 * The placement arithmetic, without a DOM.
 *
 * These are the cases that made the old heuristic wrong: a row low in a short
 * panel, a row near the top, and a menu wider than the space left of the trigger.
 */

const MENU = { width: 168, height: 120 };
const VIEWPORT = { width: 1280, height: 800 };

function triggerAt(
  top: number,
  bottom: number,
): {
  top: number;
  bottom: number;
  left: number;
  right: number;
} {
  return { top, bottom, left: 900, right: 1068 };
}

describe("placeMenu — side", () => {
  it("opens below when there is room", () => {
    const placement = placeMenu({
      trigger: triggerAt(100, 130),
      menu: MENU,
      viewport: VIEWPORT,
    });

    expect(placement.side).toBe("bottom");
    expect(placement.top).toBe(134);
  });

  it("flips above when the bottom is crowded", () => {
    const placement = placeMenu({
      trigger: triggerAt(700, 730),
      menu: MENU,
      viewport: VIEWPORT,
    });

    expect(placement.side).toBe("top");
    expect(placement.top).toBe(576);
  });

  it("stays below when neither side fits but below has more room", () => {
    /* 118px of room below, 28px above: neither fits a 300px menu, so the side
       with more room wins. */
    const short = { width: 1280, height: 200 };

    const placement = placeMenu({
      trigger: triggerAt(40, 70),
      menu: { width: 168, height: 300 },
      viewport: short,
    });

    expect(placement.side).toBe("bottom");
    expect(placement.clamped).toBe(true);
  });

  it("does not use a fraction of the viewport to decide", () => {
    /* The old rule was `bottom > innerHeight * 0.6`. A row at 45% of a short
       panel is already out of room; a row at 65% of a tall one is not. */
    /* 300px tall panel: 88px below the row, 158px above — it flips, although
       the row is only at 67% of the panel, where a fraction-based rule would
       have said "plenty of room". */
    const shortPanel = { width: 1280, height: 300 };

    const crowded = placeMenu({
      trigger: triggerAt(170, 200),
      menu: MENU,
      viewport: shortPanel,
    });

    expect(crowded.side).toBe("top");

    const tallPanel = placeMenu({
      trigger: triggerAt(520, 550),
      menu: MENU,
      viewport: VIEWPORT,
    });

    expect(tallPanel.side).toBe("bottom");
  });
});

describe("placeMenu — clamping", () => {
  it("keeps the menu on screen when the viewport is too short for it", () => {
    const placement = placeMenu({
      trigger: triggerAt(2, 32),
      menu: MENU,
      viewport: { width: 1280, height: 100 },
    });

    expect(placement.top).toBeGreaterThanOrEqual(8);
    expect(placement.clamped).toBe(true);
  });

  it("right-aligns with the trigger", () => {
    const placement = placeMenu({
      trigger: triggerAt(100, 130),
      menu: MENU,
      viewport: VIEWPORT,
    });

    expect(placement.left).toBe(1068 - 168);
  });

  it("pulls the menu inside when the trigger is near the left edge", () => {
    const placement = placeMenu({
      trigger: { top: 100, bottom: 130, left: 4, right: 40 },
      menu: MENU,
      viewport: VIEWPORT,
    });

    expect(placement.left).toBe(8);
    expect(placement.clamped).toBe(true);
  });

  it("never returns a negative position", () => {
    const placement = placeMenu({
      trigger: { top: 0, bottom: 10, left: 0, right: 10 },
      menu: { width: 300, height: 300 },
      viewport: { width: 200, height: 200 },
    });

    expect(placement.top).toBeGreaterThanOrEqual(0);
    expect(placement.left).toBeGreaterThanOrEqual(0);
  });
});

describe("estimateMenuHeight", () => {
  it("grows with the item count", () => {
    expect(estimateMenuHeight(3)).toBe(120);
    expect(estimateMenuHeight(4)).toBe(156);
  });
});
