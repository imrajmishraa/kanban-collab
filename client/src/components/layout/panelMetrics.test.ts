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
      width: PANEL.DEFAULT,
      maximized: false,
      viewport: 1440,
      appRailWidth: 288,
      ...overrides,
    });

  it("open reserves its width and keeps the board", () => {
    const layout = at();

    expect(layout.reserved).toBe(PANEL.DEFAULT);
    expect(layout.pageVisible).toBe(true);
  });

  it("off reserves nothing", () => {
    expect(at({ mode: "off" }).reserved).toBe(0);
  });

  it("full width is everything the app rail leaves", () => {
    /* 1440 - 288 rail = 1152, and the board is not rendered under it. */
    const layout = at({ maximized: true });

    expect(layout.maximized).toBe(true);
    expect(layout.fullWidth).toBe(1152);
    expect(layout.reserved).toBe(1152);
    expect(layout.pageVisible).toBe(false);
  });

  it("subtracts whatever the app rail is rendering at", () => {
    /* The rail's own scale: 72 collapsed, 240…420 expanded, 0 hidden. */
    expect(at({ maximized: true, appRailWidth: 0 }).reserved).toBe(1440);
    expect(at({ maximized: true, appRailWidth: 72 }).reserved).toBe(1368);
    expect(at({ maximized: true, appRailWidth: 420 }).reserved).toBe(1020);
  });

  it("an off panel ignores a stored full-width flag", () => {
    expect(at({ mode: "off", maximized: true }).maximized).toBe(false);
  });

  it("always leaves the board PAGE_MIN at the ceiling", () => {
    /* The ceiling is worked out as `viewport - appRail - PAGE_MIN`, so a drag can
       never squeeze the board away — only full width can, and it does so on
       purpose. */
    const layout = at({ width: 900 });

    expect(layout.width).toBe(layout.ceiling);
    expect(1440 - 288 - layout.reserved).toBe(PANEL.PAGE_MIN);
    expect(layout.pageVisible).toBe(true);
  });
});
