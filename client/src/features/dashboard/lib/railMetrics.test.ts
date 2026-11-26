import { describe, expect, it } from "vitest";

import {
  RAIL,
  RAIL_STOPS,
  clampWidth,
  computeRail,
  requiredViewport,
  snapWidth,
  snapZone,
} from "./railMetrics";

/**
 * The app rail's numbers and its state machine.
 *
 * Three surfaces depend on them — the rail's own width, what the page reserves, and
 * what a drag may reach — so they are pure and tested here rather than inlined in
 * three components.
 *
 * The scale, and the whole journey a drag can take:
 *
 *   320 (MAX) → 240 (MIN) → 72 (COLLAPSED) → 0 (hidden)
 */
describe("clampWidth", () => {
  it("holds the expanded range", () => {
    expect(clampWidth(4)).toBe(RAIL.MIN);
    expect(clampWidth(9_000)).toBe(RAIL.MAX);
    expect(clampWidth(280)).toBe(280);
  });

  it("never returns the collapsed width: 72 is a mode, not a width", () => {
    expect(clampWidth(RAIL.MIN)).toBe(RAIL.MIN);
  });

  it("rounds, so a drag cannot store a fraction", () => {
    expect(clampWidth(287.6)).toBe(288);
  });
});

describe("snapZone", () => {
  it("is expanded from MIN up", () => {
    expect(snapZone(RAIL.MIN)).toBe("expanded");
    expect(snapZone(RAIL.DEFAULT)).toBe("expanded");
    expect(snapZone(RAIL.MAX)).toBe("expanded");
  });

  it("collapses below MIN", () => {
    expect(snapZone(RAIL.MIN - 1)).toBe("collapsed");
    expect(snapZone(RAIL.MIN - RAIL.HIDE_SLOP + 1)).toBe("collapsed");
  });

  it("hides a HIDE_SLOP past MIN", () => {
    expect(snapZone(RAIL.MIN - RAIL.HIDE_SLOP)).toBe("collapsed");
    expect(snapZone(RAIL.MIN - RAIL.HIDE_SLOP - 1)).toBe("hidden");
  });
});

describe("snapWidth", () => {
  it("has three stops", () => {
    expect(RAIL_STOPS).toEqual([RAIL.MIN, RAIL.DEFAULT, RAIL.MAX]);
  });

  it("rests on each stop", () => {
    expect(snapWidth(RAIL.MIN + 4)).toBe(RAIL.MIN);
    expect(snapWidth(RAIL.MAX - 6)).toBe(RAIL.MAX);
  });

  it("moves on once the pointer clears the magnet", () => {
    expect(snapWidth(RAIL.MIN + RAIL.SNAP_TOLERANCE + 1)).toBe(
      RAIL.MIN + RAIL.SNAP_TOLERANCE + 1,
    );
  });

  it("clamps between and beyond the stops", () => {
    expect(snapWidth(1_000)).toBe(RAIL.MAX);
    /* Far enough from every stop to stay where the pointer put it. */
    expect(snapWidth(RAIL.MIN + 60)).toBe(RAIL.MIN + 60);
  });
});

describe("requiredViewport", () => {
  it("never drops below the 700 floor", () => {
    /* 240 + 329 = 569 is under the floor; 420 + 329 = 749 is over it. */
    expect(requiredViewport(RAIL.MIN)).toBe(RAIL.MIN_VIEWPORT);
    expect(requiredViewport(RAIL.DEFAULT)).toBe(RAIL.MIN_VIEWPORT);
    expect(requiredViewport(RAIL.MAX)).toBe(RAIL.MAX + RAIL.GUTTER);
  });

  it("is width plus the gutter once that clears the floor", () => {
    expect(requiredViewport(400)).toBe(400 + RAIL.GUTTER);
  });
});

describe("computeRail", () => {
  const at = (overrides: Partial<Parameters<typeof computeRail>[0]> = {}) =>
    computeRail({
      mode: "open",
      width: RAIL.DEFAULT,
      hovering: false,
      viewportWidth: 1440,
      ...overrides,
    });

  it("expanded reserves the stored width", () => {
    const layout = at();

    expect(layout.railWidth).toBe(RAIL.DEFAULT);
    expect(layout.reserved).toBe(RAIL.DEFAULT);
  });

  it("collapsed reserves the 72px icon rail", () => {
    const layout = at({ mode: "collapsed" });

    expect(layout.railWidth).toBe(RAIL.COLLAPSED);
    expect(layout.reserved).toBe(RAIL.COLLAPSED);
  });

  it("hover opens at the default width, and reserves nothing", () => {
    /* The pinned rail was dragged to 300; the preview still arrives at DEFAULT — a preview
       that changes width with the pinned rail is a surprise, not a shortcut. And it reserves
       nothing: at rest hover mode is off the page entirely (B1). */
    const open = at({ mode: "hover", hovering: true, width: 300 });

    expect(open.hoverOpen).toBe(true);
    expect(open.railWidth).toBe(RAIL.DEFAULT);
    expect(open.reserved).toBe(0);
  });

  it("hover is 288 even when the rail is dragged wide", () => {
    const open = at({ mode: "hover", hovering: true, width: RAIL.MAX });

    expect(open.railWidth).toBe(288);
  });

  /*
   * The mode is the owner now, so "hover at rest" is no longer a state the app can
   * be in: `mode: "hover"` means a preview is open, and the shell closes it by
   * leaving that mode. The old assertion encoded the second owner — the sidebar
   * clearing `hovering` while the overlay was still on screen, which is exactly the
   * collapse-to-nothing the shell was showing.
   */
  it("a preview stays 288 for as long as the mode says hover", () => {
    const rest = at({ mode: "hover", hovering: false });

    expect(rest.railWidth).toBe(RAIL.DEFAULT);
    /* Still nothing reserved: the preview is an overlay, not a column. */
    expect(rest.reserved).toBe(0);
  });

  it("hidden is off the page entirely", () => {
    const layout = at({ mode: "hidden" });

    expect(layout.railWidth).toBe(0);
    expect(layout.reserved).toBe(0);
  });

  it("a drag overrides the mode: the width follows the pointer", () => {
    const layout = at({ mode: "hover", hovering: false, resizing: true });

    expect(layout.railWidth).toBe(RAIL.DEFAULT);
    expect(layout.reserved).toBe(RAIL.DEFAULT);
  });

  it("clamps a hostile stored width", () => {
    expect(at({ width: 900 }).railWidth).toBe(RAIL.MAX);
    expect(at({ width: 4 }).railWidth).toBe(RAIL.MIN);
  });

  /*
   * The shell sets `mode: "hover"` for the whole preview, so the mode already says
   * "the reader is looking at the rail". Requiring `hovering` as well gave the same
   * fact a second owner — the sidebar cleared it 140ms after the pointer left the
   * aside, and the rail collapsed to 0 inside a still-open overlay.
   */
  it("keeps the preview width while the mode says hover, even with hovering off", () => {
    const layout = computeRail({
      mode: "hover",
      width: 280,
      hovering: false,
      viewportWidth: 1440,
    });

    expect(layout.hoverOpen).toBe(true);
    expect(layout.railWidth).toBe(RAIL.DEFAULT);
  });
});
