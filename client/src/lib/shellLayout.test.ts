import { describe, expect, it } from "vitest";

import {
  collapseRail,
  computeLayout,
  fitsBoth,
  openColumn,
  settleDrag,
  SHELL,
  toggleColumn,
  toggleFullWidth,
  toggleRail,
  type ShellState,
} from "./shellLayout";

const open = (over: Partial<ShellState> = {}): ShellState => ({
  railOpen: true,
  railCollapsed: false,
  railPx: 280,
  columnOpen: true,
  columnPx: 400,
  fullWidth: false,
  ...over,
});

const px = (pct: number, group: number) => (pct / 100) * group;

describe("computeLayout", () => {
  it("always sums to 100 and puts the remainder in the board", () => {
    for (const w of [920, 1024, 1280, 1440, 1920, 2560]) {
      const l = computeLayout(w, open());
      expect(l.leftPanel + l.centreLayout + l.rightPanel).toBeCloseTo(100, 9);
    }
  });

  it("gives the reader's widths back when there is room (F1)", () => {
    const closed = computeLayout(1920, open({ railOpen: false, railPx: 320 }));
    expect(closed.leftPanel).toBe(0);

    const reopened = computeLayout(1920, open({ railOpen: true, railPx: 320 }));
    expect(px(reopened.leftPanel, 1920)).toBeCloseTo(320, 6);
    expect(px(reopened.rightPanel, 1920)).toBeCloseTo(400, 6);
  });

  it("a closed pane is 0, never a stored width", () => {
    const l = computeLayout(1440, open({ columnOpen: false }));
    expect(l.rightPanel).toBe(0);
    expect(px(l.centreLayout, 1440)).toBeCloseTo(1440 - 280, 6);
  });

  it("full width: the column takes group − rail and the board is 0", () => {
    const l = computeLayout(1280, open({ fullWidth: true }));
    expect(l.centreLayout).toBeCloseTo(0, 9);
    expect(px(l.leftPanel, 1280)).toBeCloseTo(280, 6);
    expect(px(l.rightPanel, 1280)).toBeCloseTo(1000, 6);
  });

  it("full width with the rail hidden gives the column the whole group", () => {
    const l = computeLayout(1280, open({ railOpen: false, fullWidth: true }));
    expect(l.rightPanel).toBeCloseTo(100, 9);
  });

  it("ignores a stale fullWidth flag while the column is closed", () => {
    const l = computeLayout(1280, open({ columnOpen: false, fullWidth: true }));
    expect(l.rightPanel).toBe(0);
    expect(l.centreLayout).toBeGreaterThan(0);
  });

  it("collapsed is the icon strip, narrower than the open floor", () => {
    const l = computeLayout(1280, open({ railCollapsed: true, railPx: 340 }));
    expect(px(l.leftPanel, 1280)).toBeCloseTo(SHELL.left.collapsed, 6);
    /* The stored width is untouched, so leaving the strip restores it. */
    expect(open({ railCollapsed: true, railPx: 340 }).railPx).toBe(340);
  });

  it("collapsed never squeezes below the strip", () => {
    const l = computeLayout(900, open({ railCollapsed: true, columnPx: 560 }));
    expect(px(l.leftPanel, 900)).toBeCloseTo(SHELL.left.collapsed, 6);
    expect(px(l.centreLayout, 900)).toBeGreaterThanOrEqual(
      SHELL.centre.min - 1e-6,
    );
  });

  it("squeezes the column first, then the rail, and never the board (F3)", () => {
    const w = 1000; // 360 + 560 + 400 = 1320 > 1000
    const l = computeLayout(w, open({ railPx: 360, columnPx: 560 }));

    expect(px(l.centreLayout, w)).toBeGreaterThanOrEqual(
      SHELL.centre.min - 1e-6,
    );
    expect(px(l.rightPanel, w)).toBeGreaterThanOrEqual(SHELL.right.min - 1e-6);
    expect(px(l.leftPanel, w)).toBeGreaterThanOrEqual(SHELL.left.min - 1e-6);
    expect(l.leftPanel + l.centreLayout + l.rightPanel).toBeCloseTo(100, 9);
  });

  it("keeps every floor at every width where both panes fit", () => {
    for (let w = 920; w <= 2560; w += 7) {
      expect(fitsBoth(w)).toBe(true);

      const l = computeLayout(w, open({ railPx: 360, columnPx: 560 }));
      expect(px(l.leftPanel, w)).toBeGreaterThanOrEqual(SHELL.left.min - 1e-6);
      expect(px(l.rightPanel, w)).toBeGreaterThanOrEqual(
        SHELL.right.min - 1e-6,
      );
      expect(px(l.centreLayout, w)).toBeGreaterThanOrEqual(
        SHELL.centre.min - 1e-6,
      );
    }
  });

  it("refuses to guess a width", () => {
    expect(() => computeLayout(0, open())).toThrow(RangeError);
  });

  it("clamps stored widths to the model's range", () => {
    const small = computeLayout(1920, open({ railPx: 40, columnPx: 40 }));
    expect(px(small.leftPanel, 1920)).toBeCloseTo(SHELL.left.min, 6);
    expect(px(small.rightPanel, 1920)).toBeCloseTo(SHELL.right.min, 6);

    const big = computeLayout(2560, open({ railPx: 900, columnPx: 900 }));
    expect(px(big.leftPanel, 2560)).toBeCloseTo(SHELL.left.max, 6);
    expect(px(big.rightPanel, 2560)).toBeCloseTo(SHELL.right.max, 6);
  });
});

describe("settleDrag", () => {
  const at = (w: number, railPx: number, columnPx: number) => ({
    leftPanel: (railPx / w) * 100,
    centreLayout: ((w - railPx - columnPx) / w) * 100,
    rightPanel: (columnPx / w) * 100,
  });

  it("changes nothing when no separator was touched", () => {
    expect(settleDrag(1280, at(1280, 280, 400), null, open())).toEqual({});
  });

  it("stores the rail's width when the left edge is dragged", () => {
    expect(settleDrag(1280, at(1280, 320, 400), "left", open())).toEqual({
      railOpen: true,
      railCollapsed: false,
      railPx: 320,
    });
  });

  it("hides the rail when it is dragged to nothing", () => {
    expect(settleDrag(1280, at(1280, 0, 400), "left", open())).toEqual({
      railOpen: false,
      railCollapsed: false,
    });
  });

  it("collapses the rail between the strip and the open floor", () => {
    expect(settleDrag(1280, at(1280, 120, 400), "left", open())).toEqual({
      railOpen: true,
      railCollapsed: true,
    });
  });

  it("stores the column's width and never the rail's (F2)", () => {
    /* The drag pushed the rail narrower; only the grabbed edge is stored. */
    const settled = settleDrag(1280, at(1280, 210, 460), "right", open());
    expect(settled).toEqual({
      columnOpen: true,
      fullWidth: false,
      columnPx: 460,
    });
    expect("railPx" in settled).toBe(false);
  });

  /*
   * The drag's slop.
   *
   * Every pane's `minSize` is 0, so the library never stops a drag — the model is
   * the only thing that decides "this gesture meant something else". Without a
   * tolerance, a board released a few pixels under its floor flipped the column to
   * full width, and a column released just under 320 closed itself: two big
   * consequences for a 5px overshoot.
   */
  it("a rail left just under its floor stays open at the floor", () => {
    const w = 1280;
    const layout = {
      leftPanel: (190 / w) * 100, // 10px under 200
      centreLayout: ((w - 190 - 400) / w) * 100,
      rightPanel: (400 / w) * 100,
    };

    expect(settleDrag(w, layout, "left", open())).toEqual({
      railOpen: true,
      railCollapsed: false,
      railPx: SHELL.left.min,
    });
  });

  it("a rail dragged well under its floor becomes the icon strip", () => {
    const w = 1280;
    const layout = {
      leftPanel: (120 / w) * 100, // 80px under: past the slop
      centreLayout: ((w - 120 - 400) / w) * 100,
      rightPanel: (400 / w) * 100,
    };

    expect(settleDrag(w, layout, "left", open())).toEqual({
      railOpen: true,
      railCollapsed: true,
    });
  });

  it("a board left just under its floor does not flip to full width", () => {
    const w = 1280;
    const layout = {
      leftPanel: (280 / w) * 100,
      centreLayout: (380 / w) * 100, // 20px under the 400 floor
      rightPanel: ((w - 280 - 380) / w) * 100,
    };

    expect(settleDrag(w, layout, "right", open())).toEqual({
      columnOpen: true,
      fullWidth: false,
      columnPx: SHELL.right.max,
    });
  });

  it("a board pushed well under its floor still flips to full width", () => {
    const w = 1280;
    const layout = {
      leftPanel: (280 / w) * 100,
      centreLayout: (350 / w) * 100, // 50px under: past the slop
      rightPanel: ((w - 280 - 350) / w) * 100,
    };

    expect(settleDrag(w, layout, "right", open())).toEqual({
      columnOpen: true,
      fullWidth: true,
    });
  });

  it("a column left just under its floor stays open at the floor", () => {
    const w = 1280;
    const layout = {
      leftPanel: (280 / w) * 100,
      centreLayout: ((w - 280 - 310) / w) * 100,
      rightPanel: (310 / w) * 100, // 10px under 320
    };

    expect(settleDrag(w, layout, "right", open())).toEqual({
      columnOpen: true,
      fullWidth: false,
      columnPx: SHELL.right.min,
    });
  });

  it("a column dragged well under its floor closes", () => {
    const w = 1280;
    const layout = {
      leftPanel: (280 / w) * 100,
      centreLayout: ((w - 280 - 280) / w) * 100,
      rightPanel: (280 / w) * 100, // 40px under: past the slop
    };

    expect(settleDrag(w, layout, "right", open())).toEqual({
      columnOpen: false,
      fullWidth: false,
    });
  });

  it("flips to full width when the board was pushed below its floor", () => {
    const w = 1280;
    const layout = {
      leftPanel: (280 / w) * 100,
      centreLayout: (300 / w) * 100, // below 400
      rightPanel: ((w - 280 - 300) / w) * 100,
    };
    expect(settleDrag(w, layout, "right", open())).toEqual({
      columnOpen: true,
      fullWidth: true,
    });
  });

  it("closes the column when it is dragged below its floor", () => {
    const w = 1280;
    const layout = {
      leftPanel: (280 / w) * 100,
      centreLayout: ((w - 280 - 200) / w) * 100,
      rightPanel: (200 / w) * 100,
    };
    expect(settleDrag(w, layout, "right", open())).toEqual({
      columnOpen: false,
      fullWidth: false,
    });
  });

  it("ignores a drag before the group is measured", () => {
    expect(settleDrag(0, at(1280, 280, 400), "left", open())).toEqual({});
  });
});

describe("commands", () => {
  it("⌘B hides an open rail and reopens at the stored width", () => {
    const hidden = toggleRail(1920, open({ railPx: 340 }));
    expect(hidden).toEqual({ railOpen: false, railCollapsed: false });

    const back = computeLayout(1920, open({ railPx: 340 }));
    expect(px(back.leftPanel, 1920)).toBeCloseTo(340, 6);
  });

  it("⌘B closes the column when both cannot fit (F3)", () => {
    expect(toggleRail(900, open({ railOpen: false }))).toEqual({
      railOpen: true,
      railCollapsed: false,
      columnOpen: false,
      fullWidth: false,
    });
  });

  it("⌘⇧B is the icon strip, and it leaves the stored width alone", () => {
    expect(collapseRail()).toEqual({ railOpen: true, railCollapsed: true });
  });

  it("⌘J toggles the column and clears full width on close", () => {
    expect(toggleColumn(1920, open({ fullWidth: true }))).toEqual({
      columnOpen: false,
      fullWidth: false,
    });
  });

  it("⌘⇧J opens a closed column into full width", () => {
    const s = open({ columnOpen: false });
    expect(toggleFullWidth(1920, s)).toEqual({
      columnOpen: true,
      fullWidth: true,
    });
  });

  it("⌘⇧J leaves full width", () => {
    expect(toggleFullWidth(1920, open({ fullWidth: true }))).toEqual({
      fullWidth: false,
    });
  });

  it("opening the column hides a rail that cannot fit beside it (F3)", () => {
    expect(openColumn(900, open({ railOpen: true }))).toEqual({
      columnOpen: true,
      railOpen: false,
      railCollapsed: false,
    });
  });
});
