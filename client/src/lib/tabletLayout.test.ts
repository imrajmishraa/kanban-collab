import { describe, expect, it } from "vitest";

import { PANEL } from "@/components/layout/panelMetrics";
import {
  TABLET,
  isTablet,
  tabletLayout,
  tabletPanelCeiling,
  tabletRailCeiling,
  tabletStepsAside,
} from "./tabletLayout";

/**
 * Tablet: rail <= 200, column >= 280, board >= 420 — and the rail steps aside when the
 * three do not fit. Nothing here runs above 1023.
 */
describe("isTablet", () => {
  it("covers 700 to 1023 only", () => {
    expect(isTablet(699)).toBe(false);
    expect(isTablet(700)).toBe(true);
    expect(isTablet(1023)).toBe(true);
    expect(isTablet(1024)).toBe(false);
  });
});

describe("tabletPanelCeiling", () => {
  it("is what still leaves the board its 420", () => {
    expect(tabletPanelCeiling(820, 0)).toBe(400);
    expect(820 - 0 - tabletPanelCeiling(820, 0)).toBe(PANEL.PAGE_MIN);
  });

  it("never goes below the tablet's own minimum", () => {
    expect(tabletPanelCeiling(700, 200)).toBe(TABLET.PANEL_MIN);
  });
});

describe("tabletRailCeiling", () => {
  it("is 200 on a tablet with room", () => {
    expect(tabletRailCeiling(1023)).toBe(TABLET.RAIL_MAX);
  });

  it("keeps the board its 420 at the narrowest tablet", () => {
    /* 700 - 420 = 280, but the rail's own MAX is 200 — the smaller one binds. */
    expect(tabletRailCeiling(700)).toBe(TABLET.RAIL_MAX);
    expect(700 - tabletRailCeiling(700)).toBeGreaterThanOrEqual(PANEL.PAGE_MIN);
  });
});

describe("tabletStepsAside", () => {
  it("steps aside when the three do not fit", () => {
    /* 200 + 280 + 420 = 900 > 820. */
    expect(tabletStepsAside(820, 200, true)).toBe(true);
  });

  it("does not step aside when they do", () => {
    expect(tabletStepsAside(1023, 200, true)).toBe(false);
  });

  it("does not step aside with the column closed", () => {
    expect(tabletStepsAside(820, 200, false)).toBe(false);
  });
});

describe("tabletLayout", () => {
  it("hands the board its 420 with the rail out of the way", () => {
    const layout = tabletLayout({
      viewport: 820,
      railReserve: 200,
      panelOpen: true,
      panelLevel: "normal",
      panelWidth: 420,
    });

    expect(layout.railStrip).toBe(true);
    expect(layout.railReserve).toBe(0);
    expect(layout.reserved).toBe(400);
    expect(820 - layout.railReserve - layout.reserved).toBe(PANEL.PAGE_MIN);
  });

  it("keeps all three at 1023", () => {
    const layout = tabletLayout({
      viewport: 1023,
      railReserve: 200,
      panelOpen: true,
      panelLevel: "normal",
      panelWidth: 420,
    });

    expect(layout.railStrip).toBe(false);
    expect(layout.railReserve).toBe(200);
    expect(1023 - 200 - layout.reserved).toBeGreaterThanOrEqual(PANEL.PAGE_MIN);
  });

  it("gives the column everything the rail leaves at `remaining`", () => {
    const layout = tabletLayout({
      viewport: 820,
      railReserve: 0,
      panelOpen: true,
      panelLevel: "remaining",
      panelWidth: 420,
    });

    expect(layout.reserved).toBe(820);
  });

  it("never lets the column under 280", () => {
    const layout = tabletLayout({
      viewport: 700,
      railReserve: 0,
      panelOpen: true,
      panelLevel: "normal",
      panelWidth: 100,
    });

    expect(layout.reserved).toBe(TABLET.PANEL_MIN);
  });
});
