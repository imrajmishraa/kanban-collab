import { describe, expect, it } from "vitest";

import {
  RAIL,
  clampWidth,
  computeRail,
  requiredViewport,
  snapZone,
} from "./railMetrics";

/**
 * The rail's arithmetic, which three surfaces depend on: the rail's own width,
 * what the layout reserves, and when the expanded rail has to give up and fall
 * back to icons.
 */
describe("clampWidth", () => {
  it("holds both ends of the *expanded* range", () => {
    /* A stored width is never collapsed: below MID the rail is a mode, not a
       width. */
    expect(clampWidth(4)).toBe(RAIL.MID);
    expect(clampWidth(900)).toBe(RAIL.MAX);
    expect(clampWidth(RAIL.DEFAULT)).toBe(RAIL.DEFAULT);
  });

  it("rounds, so a drag cannot store a fraction", () => {
    expect(clampWidth(287.6)).toBe(288);
  });
});

describe("snapZone", () => {
  it("stays expanded from MID up", () => {
    expect(snapZone(RAIL.MID)).toBe("expanded");
    expect(snapZone(RAIL.DEFAULT)).toBe("expanded");
    expect(snapZone(RAIL.MAX)).toBe("expanded");
  });

  it("snaps to collapsed anywhere below MID", () => {
    expect(snapZone(RAIL.MID - 1)).toBe("collapsed");
    expect(snapZone(RAIL.MIN)).toBe("collapsed");
    expect(snapZone(RAIL.HIDE_BELOW)).toBe("collapsed");
  });

  it("hides only when the pull goes past the collapsed rail", () => {
    expect(snapZone(RAIL.HIDE_BELOW - 1)).toBe("hidden");
    expect(snapZone(0)).toBe("hidden");
  });
});

describe("requiredViewport", () => {
  it("is width plus the gutter once that clears the floor", () => {
    expect(requiredViewport(RAIL.MAX)).toBe(RAIL.MAX + RAIL.GUTTER);
  });

  it("never drops below the 700 floor", () => {
    expect(requiredViewport(RAIL.MIN)).toBe(RAIL.MIN_VIEWPORT);

    /* At the default width the rail plus gutter is 617, so the floor still
       applies — which is what makes the `required === 700` short-circuit fire
       for every width up to 371. */
    expect(requiredViewport(RAIL.DEFAULT)).toBe(RAIL.MIN_VIEWPORT);
    expect(requiredViewport(371)).toBe(RAIL.MIN_VIEWPORT);
    expect(requiredViewport(372)).toBe(372 + RAIL.GUTTER);
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
    expect(layout.autoRail).toBe(false);
  });

  it("collapsed reserves the icon rail", () => {
    const layout = at({ mode: "collapsed" });

    expect(layout.railWidth).toBe(RAIL.MIN);
    expect(layout.reserved).toBe(RAIL.MIN);
  });

  it("hover opens to the stored width", () => {
    const layout = at({ mode: "hover", hovering: true, width: RAIL.MAX });

    expect(layout.hoverOpen).toBe(true);
    expect(layout.railWidth).toBe(RAIL.MAX);
  });

  it("hover never reflows the page: the layout stays pinned to the icon rail", () => {
    const rest = at({ mode: "hover", hovering: false });
    const open = at({ mode: "hover", hovering: true });

    expect(rest.reserved).toBe(RAIL.MIN);
    expect(open.reserved).toBe(RAIL.MIN);
    expect(open.reserved).toBe(rest.reserved);
  });

  it("hover at rest is the icon rail", () => {
    expect(at({ mode: "hover", hovering: false }).railWidth).toBe(RAIL.MIN);
  });

  it("only a drag reaches MIN — expanding never does", () => {
    /* Collapsed → open goes to the stored width, not to the minimum. */
    expect(at({ mode: "open", width: RAIL.DEFAULT }).railWidth).toBe(
      RAIL.DEFAULT,
    );
    expect(
      at({ mode: "hover", hovering: true, width: RAIL.DEFAULT }).railWidth,
    ).toBe(RAIL.DEFAULT);
  });

  it("hidden is off the page entirely", () => {
    const layout = at({ mode: "hidden" });

    expect(layout.railWidth).toBe(0);
    expect(layout.reserved).toBe(0);
    expect(layout.hidden).toBe(true);
  });

  it("falls back to icons when the viewport cannot afford the width", () => {
    /* MAX needs 749px; at 748 the rail has to give up its labels. */
    const layout = at({
      width: RAIL.MAX,
      viewportWidth: RAIL.MAX + RAIL.GUTTER - 1,
    });

    expect(layout.autoRail).toBe(true);
    expect(layout.railWidth).toBe(RAIL.MIN);
  });

  it("never hides the rail at the default width, however narrow the viewport", () => {
    /* `required === 700` short-circuits: a 288px rail is always affordable. */
    expect(at({ viewportWidth: 400 }).autoRail).toBe(false);
    expect(at({ viewportWidth: 400 }).railWidth).toBe(RAIL.DEFAULT);
  });

  it("autoRail wins over hover too", () => {
    const layout = at({
      mode: "hover",
      hovering: true,
      width: RAIL.MAX,
      viewportWidth: RAIL.MAX + RAIL.GUTTER - 1,
    });

    expect(layout.hoverOpen).toBe(false);
    expect(layout.railWidth).toBe(RAIL.MIN);
  });

  it("clamps a hostile stored width before using it", () => {
    expect(at({ width: 900 }).railWidth).toBe(RAIL.MAX);
    /* A stored 4 is an expanded width, so it clamps to MID — the rail never
       renders narrower than the icon rail while it is open. */
    expect(at({ width: 4 }).railWidth).toBe(RAIL.MID);
  });
});
