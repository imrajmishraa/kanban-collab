import { describe, expect, it } from "vitest";

import {
  PANEL,
  clampPanelWidth,
  computePanel,
  panelCeiling,
  panelStops,
} from "./panelMetrics";

/**
 * The right column's numbers — deliberately not the app rail's. These decide how wide
 * the column may go, where a drag rests, and whether the board survives, so a mistake
 * here eats the page.
 */
describe("clampPanelWidth", () => {
  it("holds MIN", () => {
    expect(clampPanelWidth(4, 900)).toBe(PANEL.MIN);
    expect(clampPanelWidth(PANEL.DEFAULT, 900)).toBe(PANEL.DEFAULT);
  });

  it("holds the ceiling", () => {
    expect(clampPanelWidth(900, 700)).toBe(700);
  });

  it("still returns MIN when the ceiling is under MIN", () => {
    expect(clampPanelWidth(400, 100)).toBe(PANEL.MIN);
  });
});

describe("panelCeiling", () => {
  it("leaves the board its minimum", () => {
    /* 1440 - 288 app rail - 420 board = 732. */
    expect(panelCeiling(1440, 288)).toBe(732);
  });

  it("never returns less than MIN", () => {
    expect(panelCeiling(500, 288)).toBe(PANEL.MIN);
  });
});

describe("panelStops", () => {
  it("is MIN, DEFAULT, MAX and the ceiling", () => {
    expect(panelStops(792)).toEqual([PANEL.MIN, PANEL.DEFAULT, PANEL.MAX, 792]);
  });

  it("drops a stop the ceiling cannot reach", () => {
    expect(panelStops(450)).toEqual([PANEL.MIN, PANEL.DEFAULT, 450]);
  });
});

describe("computePanel", () => {
  const at = (overrides: Partial<Parameters<typeof computePanel>[0]> = {}) =>
    computePanel({
      mode: "panel",
      level: "normal",
      width: PANEL.DEFAULT,
      viewport: 1440,
      appRailWidth: 288,
      ...overrides,
    });

  it("open reserves its width and keeps the board", () => {
    const layout = at();

    expect(layout.reserved).toBe(PANEL.DEFAULT);
    expect(layout.pageVisible).toBe(true);
  });

  it("off reserves nothing, and the page is still rendered", () => {
    const layout = at({ mode: "off" });

    expect(layout.reserved).toBe(0);
    /* The bug this test exists for: `pageVisible` was `!hidden && …`, so closing the
       panel unmounted `<main>` and the whole app rendered nothing. */
    expect(layout.pageVisible).toBe(true);
  });

  it("off renders the page even with a stored 'remaining' level", () => {
    expect(at({ mode: "off", level: "remaining" }).pageVisible).toBe(true);
  });

  it("remaining is everything the rail leaves, and it is not the whole window", () => {
    /* 1440 - 288 = 1152: the rail keeps its 288. */
    const layout = at({ level: "remaining" });

    expect(layout.reserved).toBe(1152);
    expect(layout.fullscreen).toBe(false);
    expect(layout.pageVisible).toBe(false);
  });

  it("remaining IS fullscreen once the rail is hidden", () => {
    /* The whole point of two levels instead of three: no extra state to enter. */
    const layout = at({ level: "remaining", appRailWidth: 0 });

    expect(layout.reserved).toBe(1440);
    expect(layout.fullscreen).toBe(true);
  });

  it("never squeezes the board away at the ceiling", () => {
    const layout = at({ width: 900 });

    expect(layout.reserved).toBe(layout.ceiling);
    expect(1440 - 288 - layout.reserved).toBe(PANEL.PAGE_MIN);
  });
});
