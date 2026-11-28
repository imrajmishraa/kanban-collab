import { describe, expect, it } from "vitest";

import {
  collapseRail,
  openColumn,
  toggleColumn,
  toggleFullWidth,
  toggleRail,
} from "./shellCommands";
import {
  computeLayout,
  fitsBoth,
  giveWay,
  settleDrag,
  SHELL,
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
    /* From the width the two panes under test actually need, upwards. */
    const need = SHELL.left.max + SHELL.right.max + SHELL.centre.min;

    for (let w = need; w <= 2560; w += 7) {
      expect(fitsBoth(w)).toBe(true);

      const l = computeLayout(
        w,
        open({ railPx: SHELL.left.max, columnPx: SHELL.right.max }),
      );
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

/*
 * The fit check has to use the rail's *real* width, not its floor.
 *
 * `fitsBoth` assumed 200 whatever the rail was doing. Two consequences, one in
 * each direction: a column refused beside the 72px icon strip where 72+320+400
 * fits, and a rail opened beside a column at a stored 280 that the group could
 * not actually hold — the library then silently did nothing (F3).
 */
it("opens the column beside the icon strip when 72 + 320 + 420 fits", () => {
  /* 812 of 820: the strip leaves room the rail's floor does not. */
  expect(
    toggleColumn(820, open({ railCollapsed: true, columnOpen: false })),
  ).toEqual({ columnOpen: true });
});

it("closes the column when the rail cannot reopen beside it", () => {
  /* 280 + 420 + 320 = 1020, so 999 does not fit — though the rail's 220 floor
       would have said 860 and opened both. */
  expect(
    toggleRail(
      999,
      open({ railOpen: false, railCollapsed: false, railPx: 280 }),
    ),
  ).toEqual({
    railOpen: true,
    railCollapsed: false,
    columnOpen: false,
    fullWidth: false,
  });
});

it("still closes the rail when the column does not fit beside it", () => {
  /* 280 + 320 + 400 = 1000 > 800. */
  expect(toggleColumn(800, open({ columnOpen: false }))).toEqual({
    columnOpen: true,
    railOpen: false,
    railCollapsed: false,
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

  it("hides the rail between the strip and the open floor", () => {
    /* A drag that ends under the floor means "off the page". The strip is left to
       `toggleRail` and the mode menu, so a gesture cannot land on it by accident. */
    expect(settleDrag(1280, at(1280, 120, 400), "left", open())).toEqual({
      railOpen: false,
      railCollapsed: false,
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
  it("hides the rail the moment a drag goes under its floor", () => {
    const w = 1280;
    const layout = {
      leftPanel: ((SHELL.left.min - 1) / w) * 100,
      centreLayout: ((w - (SHELL.left.min - 1) - 400) / w) * 100,
      rightPanel: (400 / w) * 100,
    };

    expect(settleDrag(w, layout, "left", open())).toEqual({
      railOpen: false,
      railCollapsed: false,
    });
  });

  it("never rests on the icon strip from a drag — only a command does that", () => {
    const w = 1280;
    const layout = {
      leftPanel: (100 / w) * 100,
      centreLayout: ((w - 100 - 400) / w) * 100,
      rightPanel: (400 / w) * 100,
    };

    expect(settleDrag(w, layout, "left", open())).toEqual({
      railOpen: false,
      railCollapsed: false,
    });
  });

  it("hides a rail dragged well under its floor", () => {
    const w = 1280;
    const layout = {
      leftPanel: (120 / w) * 100, // 100px under the 220 floor
      centreLayout: ((w - 120 - 400) / w) * 100,
      rightPanel: (400 / w) * 100,
    };

    expect(settleDrag(w, layout, "left", open())).toEqual({
      railOpen: false,
      railCollapsed: false,
    });
  });

  it("takes the width from the column when the rail is dragged past the board's floor", () => {
    /* The board is 40px under its 420 floor; the column has 60px of slack above
       its own floor, so all 40 come from the column. */
    const got = giveWay(
      1280,
      { left: 520, centre: 380, right: 380 },
      "left",
      open(),
    );

    expect(got).toEqual({ left: 520, right: 340 });
  });

  it("takes the width from the rail when the column is dragged past the board's floor", () => {
    const got = giveWay(
      1280,
      { left: 300, centre: 380, right: 600 },
      "right",
      open(),
    );

    expect(got).toEqual({ left: 260, right: 600 });
  });

  it("leaves both panes alone while the board is above its floor", () => {
    expect(
      giveWay(1280, { left: 280, centre: 420, right: 580 }, "left", open()),
    ).toBeNull();
  });

  it("stops giving once the other pane is on its own floor", () => {
    /* Column already at 320: nothing left to take, so the drag stops instead. */
    expect(
      giveWay(1280, { left: 540, centre: 420, right: 320 }, "left", open()),
    ).toBeNull();
  });

  it("a board left just under its floor does not flip to full width", () => {
    const w = 1280;
    const layout = {
      leftPanel: (280 / w) * 100,
      centreLayout: (400 / w) * 100, // 20px under the 420 floor
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
