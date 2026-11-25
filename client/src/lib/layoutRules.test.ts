import { describe, expect, it } from "vitest";

import {
  DRAG_DAMPING,
  DRAG_SLOP,
  KEY_STEP,
  MOBILE_MAX_VIEWPORT,
  RAIL_EDGE_ZONE,
  SNAP_TOLERANCE,
  SPIKE,
  SPIKE_DELTAS,
  TABLET_MAX_VIEWPORT,
  deviceFor,
  panelCeilingFor,
  panelRemainingFor,
} from "./layoutRules";

/**
 * The spike's numbers are a contract, not a scratchpad.
 *
 * Every value here was settled in the rules form on 25/11 and then typed into
 * `layoutRules.ts` by hand — the exact place where a digit goes missing and
 * nobody notices until the rail is 20px wrong on a tablet. The tests pin the
 * settled numbers, the boundaries where the device switches, and the two
 * formulas the readout draws its verdicts from.
 */

describe("deviceFor", () => {
  it("puts 700 in tablet, not mobile", () => {
    expect(deviceFor(699)).toBe("mobile");
    expect(deviceFor(700)).toBe("tablet");
  });

  it("puts 1024 in desktop, not tablet", () => {
    expect(deviceFor(1023)).toBe("tablet");
    expect(deviceFor(1024)).toBe("desktop");
  });

  it("agrees with the breakpoints the form published", () => {
    expect(MOBILE_MAX_VIEWPORT).toBe(700);
    expect(TABLET_MAX_VIEWPORT).toBe(1023);
    expect(deviceFor(360)).toBe("mobile");
    expect(deviceFor(1920)).toBe("desktop");
  });
});

describe("SPIKE.desktop", () => {
  it("keeps the rail at 72 / 200 / 288 / 420", () => {
    expect(SPIKE.desktop.rail).toEqual({
      collapsed: 72,
      min: 200,
      default: 288,
      max: 420,
      preview: 288,
    });
  });

  it("keeps the column at 320 / 420 / 660", () => {
    expect(SPIKE.desktop.panel).toEqual({
      min: 320,
      default: 420,
      max: 660,
    });
  });

  it("keeps the board floor at 420", () => {
    expect(SPIKE.desktop.boardMin).toBe(420);
  });
});

describe("SPIKE.tablet", () => {
  it("opens the rail at 200 and lets it reach 420 (E6)", () => {
    expect(SPIKE.tablet.rail.min).toBe(200);
    expect(SPIKE.tablet.rail.default).toBe(200);
    expect(SPIKE.tablet.rail.max).toBe(420);
  });

  it("previews at 288 like the desktop, not at 240 (B3)", () => {
    expect(SPIKE.tablet.rail.preview).toBe(288);
    expect(SPIKE.tablet.rail.preview).toBe(SPIKE.desktop.rail.preview);
  });

  it("gives the column 280 and caps it at 420", () => {
    expect(SPIKE.tablet.panel.min).toBe(280);
    expect(SPIKE.tablet.panel.max).toBe(420);
  });

  it("still holds the board at 420", () => {
    expect(SPIKE.tablet.boardMin).toBe(420);
  });
});

describe("SPIKE invariants", () => {
  const devices = ["desktop", "tablet"] as const;

  it.each(devices)("%s: rail min <= default <= max", (device) => {
    const { rail } = SPIKE[device];

    expect(rail.min).toBeLessThanOrEqual(rail.default);
    expect(rail.default).toBeLessThanOrEqual(rail.max);
  });

  it.each(devices)(
    "%s: the icon rail is narrower than the open rail",
    (device) => {
      expect(SPIKE[device].rail.collapsed).toBeLessThan(SPIKE[device].rail.min);
    },
  );

  it.each(devices)(
    "%s: a preview is never wider than the drag allows",
    (device) => {
      const { rail } = SPIKE[device];

      expect(rail.preview).toBeGreaterThanOrEqual(rail.min);
      expect(rail.preview).toBeLessThanOrEqual(rail.max);
    },
  );

  it.each(devices)("%s: panel min <= default <= max", (device) => {
    const { panel } = SPIKE[device];

    expect(panel.min).toBeLessThanOrEqual(panel.default);
    expect(panel.default).toBeLessThanOrEqual(panel.max);
  });

  it.each(devices)("%s: the board floor is 420", (device) => {
    expect(SPIKE[device].boardMin).toBe(420);
  });
});

describe("panelCeilingFor", () => {
  it("is viewport - rail - board floor", () => {
    expect(panelCeilingFor(1440, 288, 420)).toBe(732);
    expect(panelCeilingFor(1440, 0, 420)).toBe(1020);
    expect(panelCeilingFor(700, 200, 420)).toBe(80);
  });

  it("never goes negative when the rail has eaten the window", () => {
    expect(panelCeilingFor(500, 400, 420)).toBe(0);
    expect(panelCeilingFor(420, 420, 420)).toBe(0);
  });

  it("leaves the board exactly its floor whenever there is any room", () => {
    const viewports = [1024, 1280, 1440, 1920];
    const rails = [0, 200, 288, 420];

    for (const viewport of viewports) {
      for (const rail of rails) {
        const ceiling = panelCeilingFor(viewport, rail, 420);

        if (ceiling > 0) {
          expect(viewport - rail - ceiling).toBe(420);
        }
      }
    }
  });
});

describe("panelRemainingFor", () => {
  it("is everything the rail is not using", () => {
    expect(panelRemainingFor(1440, 288)).toBe(1152);
    expect(panelRemainingFor(1440, 0)).toBe(1440);
    expect(panelRemainingFor(700, 200)).toBe(500);
  });

  it("never goes negative", () => {
    expect(panelRemainingFor(300, 400)).toBe(0);
  });
});

describe("SPIKE_DELTAS", () => {
  it("names the four rules the app has not adopted yet", () => {
    expect(SPIKE_DELTAS.map((delta) => delta.rule)).toEqual([
      "C1",
      "B3",
      "E6",
      "E7",
    ]);
  });

  it("states both sides of every delta, so the readout can print it", () => {
    for (const delta of SPIKE_DELTAS) {
      expect(delta.what.length).toBeGreaterThan(0);
      expect(delta.spike.length).toBeGreaterThan(0);
      expect(delta.app.length).toBeGreaterThan(0);
    }
  });

  it("carries the values the form settled", () => {
    const byRule = Object.fromEntries(
      SPIKE_DELTAS.map((delta) => [delta.rule, delta]),
    );

    expect(byRule.C1.spike).toBe("200");
    expect(byRule.B3.spike).toBe("288");
    expect(byRule.E6.spike).toBe("420");
    expect(byRule.E7.spike).toContain("1024");
  });
});

describe("shared gesture numbers", () => {
  it("snaps within 10px and damps to 0.6 on both edges", () => {
    expect(SNAP_TOLERANCE).toBe(10);
    expect(DRAG_DAMPING).toBe(0.6);
  });

  it("needs 3px on the rail and 6px on the panel before a press is a drag", () => {
    expect(DRAG_SLOP).toEqual({ rail: 3, panel: 6 });
  });

  it("steps a sash by 8px, or 32px with Shift", () => {
    expect(KEY_STEP).toEqual({ base: 8, shift: 32 });
  });

  it("reaches a hidden rail from an 8px window edge", () => {
    expect(RAIL_EDGE_ZONE).toBe(8);
  });
});
