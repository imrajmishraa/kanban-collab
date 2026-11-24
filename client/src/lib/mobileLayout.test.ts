import { describe, expect, it } from "vitest";

import {
  MOBILE_MAX_VIEWPORT,
  computePanel,
} from "@/components/layout/panelMetrics";

/**
 * Below 700 the panel is a sheet, not a column: it covers the window and reserves nothing,
 * so the board keeps every pixel. The rail does not exist there — the app's own menu owns
 * the left on a phone.
 */
describe("mobile", () => {
  const at = (
    viewport: number,
    level: "normal" | "remaining" | "full" = "normal",
  ) =>
    computePanel({
      mode: "panel",
      level,
      width: 420,
      viewport,
      appRailWidth: 288,
    });

  it("starts below 700", () => {
    expect(MOBILE_MAX_VIEWPORT).toBe(700);
    expect(at(699).sheet).toBe(true);
  });

  it("reserves nothing at any level", () => {
    for (const viewport of [320, 393, 430, 540, 699]) {
      for (const level of ["normal", "remaining", "full"] as const) {
        expect(at(viewport, level).reserved).toBe(0);
      }
    }
  });

  it("always renders the board", () => {
    for (const viewport of [320, 393, 699]) {
      expect(at(viewport).pageVisible).toBe(true);
    }
  });

  it("is closed when the mode is off, and reserves nothing either way", () => {
    const closed = computePanel({
      mode: "off",
      level: "normal",
      width: 420,
      viewport: 393,
      appRailWidth: 288,
    });

    expect(closed.hidden).toBe(true);
    expect(closed.reserved).toBe(0);
    expect(closed.pageVisible).toBe(true);
  });

  it("is not a sheet at 700 — that is the tablet", () => {
    expect(at(700).sheet).toBeUndefined();
  });
});
