import { describe, expect, it } from "vitest";

import { PANEL } from "@/components/layout/panelMetrics";
import { besideMax, couple, panelDragLevel } from "./panelCouple";

/**
 * The desktop rules: the two rails share one window and the board keeps its 420.
 *
 * Both directions are the same function — the dragged side keeps its wish and the other
 * gives up the overflow — so these tests cover the rail drag, the panel drag and the case
 * where the column is already at its floor.
 */
describe("couple", () => {
  it("takes the rail's growth out of the column", () => {
    const pair = couple({
      active: "rail",
      railWanted: 420,
      panelWanted: 560,
      viewport: 1280,
    });

    expect(pair.rail).toBe(420);
    expect(pair.panel).toBe(440);
    expect(pair.rail + pair.panel).toBe(1280 - PANEL.PAGE_MIN);
  });

  it("takes the column's growth out of the rail, down to 240", () => {
    const pair = couple({
      active: "panel",
      railWanted: 288,
      panelWanted: 620,
      viewport: 1280,
    });

    expect(pair.panel).toBe(620);
    expect(pair.rail).toBe(240);
  });

  it("takes the overflow in two steps when the column is at its floor", () => {
    /* 1024 - 420 = 604 of budget; 288 + 320 = 608 is over, and the column cannot go
       lower, so the rail gives the 4px. One step left the board at 416. */
    const pair = couple({ railWanted: 288, panelWanted: 320, viewport: 1024 });

    expect(pair.rail + pair.panel).toBeLessThanOrEqual(1024 - PANEL.PAGE_MIN);
  });

  it("leaves the column alone when it is closed", () => {
    const pair = couple({
      active: "rail",
      railWanted: 300,
      panelWanted: 500,
      viewport: 1280,
      panelOpen: false,
    });

    expect(pair.panel).toBe(0);
    expect(pair.rail).toBe(300);
  });

  it("respects a collapsed rail's floor", () => {
    const pair = couple({
      active: "panel",
      railWanted: 72,
      panelWanted: 900,
      viewport: 1280,
      railFloor: 72,
    });

    expect(pair.rail).toBe(72);
  });
});

describe("panelDragLevel", () => {
  it("presses the rail first: still normal at 620, with the rail at its 240", () => {
    /* beside = 1280 - 240 - 420 = 620, measured against the rail's floor. */
    expect(panelDragLevel(620, 1280, 240)).toBe("normal");
    expect(besideMax(1280, 240)).toBe(620);
  });

  it("only takes `remaining` once the rail can give no more", () => {
    /* 620 + 32 = 652. */
    expect(panelDragLevel(651, 1280, 240)).toBe("normal");
    expect(panelDragLevel(653, 1280, 240)).toBe("remaining");
  });

  it("is full past everything the rail leaves", () => {
    /* remaining = 1280 - 240 = 1040; +32 = 1072. */
    expect(panelDragLevel(1073, 1280, 240)).toBe("full");
  });

  it("never goes straight from normal to full", () => {
    for (const raw of [600, 700, 800, 900, 1000]) {
      expect(panelDragLevel(raw, 1280, 240)).not.toBe("full");
    }
  });

  it("does not flip to remaining while the rail still has room to give", () => {
    /* The bug: measured against the rail's *current* width (420), 592 was already
       `remaining` — while the rail was still at 300-odd. */
    for (const raw of [560, 600, 620, 640]) {
      expect(panelDragLevel(raw, 1280, 240)).toBe("normal");
    }
  });
});

describe("besideMax", () => {
  it("is what the rail's floor leaves, not the column's magnetic stop", () => {
    /* 1280 - 240 - 420 = 620 — past PANEL.MAX (560), because the rail gives ground. */
    expect(besideMax(1280, 240)).toBe(620);
    expect(1280 - 240 - besideMax(1280, 240)).toBe(PANEL.PAGE_MIN);
  });

  it("leaves the board its 420 when the window is the binding limit", () => {
    /* 1024 - 288 - 420 = 316, under MIN, so the ceiling is MIN. */
    expect(besideMax(1024, 288)).toBe(PANEL.MIN);
  });
});

describe("the panel pushing the rail", () => {
  it("shrinks the rail from wherever it is down to its own minimum", () => {
    /* Left full at 420, column dragged from 420 to 620 on a 1280 window. */
    const pair = couple({
      active: "panel",
      railWanted: 420,
      panelWanted: 620,
      viewport: 1280,
      railFloor: 240,
    });

    expect(pair.panel).toBe(620);
    expect(pair.rail).toBe(240);
  });

  it("does not shrink the rail when the column is being narrowed", () => {
    const pair = couple({
      active: "panel",
      railWanted: 420,
      panelWanted: 320,
      viewport: 1280,
      railFloor: 240,
    });

    expect(pair.rail).toBe(420);
    expect(pair.panel).toBe(320);
  });

  it("is immovable when its own width is passed as the floor — the bug", () => {
    /* Kept as a regression note: this is what made the rail impossible to push. */
    const pair = couple({
      active: "panel",
      railWanted: 420,
      panelWanted: 620,
      viewport: 1280,
      railFloor: 420,
    });

    expect(pair.rail).toBe(420);
    expect(pair.panel).toBeLessThan(620);
  });
});
