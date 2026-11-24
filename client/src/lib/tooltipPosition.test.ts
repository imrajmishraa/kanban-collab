import { describe, expect, it } from "vitest";

import {
  MARGIN,
  chooseSide,
  computePlacement,
  sideSpace,
} from "./tooltipPosition";

/**
 * The placement maths, without a DOM.
 *
 * Four rules: the requested side wins when it fits, the roomiest side takes over when it
 * does not, the bubble never leaves the viewport, and the caret always points at the
 * anchor's centre.
 */
const anchor = {
  left: 400,
  right: 500,
  top: 300,
  bottom: 340,
  width: 100,
  height: 40,
};
const bubble = { width: 120, height: 40 };
const viewport = { width: 1200, height: 800 };

describe("sideSpace", () => {
  it("measures the room on each side of the anchor", () => {
    expect(sideSpace(anchor, viewport)).toEqual({
      top: 300,
      bottom: 460,
      left: 400,
      right: 700,
    });
  });
});

describe("chooseSide", () => {
  it("keeps the requested side when the bubble fits", () => {
    expect(chooseSide(anchor, bubble, viewport, "bottom")).toEqual({
      side: "bottom",
      flipped: false,
    });
  });

  it("flips to the roomiest side when it does not", () => {
    /* An anchor at the very bottom: nothing below it. */
    const low = { ...anchor, top: 780, bottom: 800 };
    expect(chooseSide(low, bubble, viewport, "bottom").side).toBe("top");
  });

  it("is not simply the opposite side", () => {
    /* Top has 300, right has 700, left has 400 — asking for top when the bubble is tall
       enough to overflow picks right, the roomiest, not bottom. */
    const tall = { width: 120, height: 400 };
    expect(chooseSide(anchor, tall, viewport, "top").side).toBe("right");
  });

  it("measures width for the horizontal sides", () => {
    const narrow = {
      left: 10,
      right: 110,
      top: 300,
      bottom: 340,
      width: 100,
      height: 40,
    };
    /* 10px to the left is not enough for a 120px bubble. */
    expect(chooseSide(narrow, bubble, viewport, "left").side).not.toBe("left");
  });
});

describe("computePlacement", () => {
  it("puts a bottom bubble under the anchor, centred", () => {
    const p = computePlacement({
      anchor,
      bubble,
      viewport,
      side: "bottom",
      align: "center",
    });

    expect(p.side).toBe("bottom");
    expect(p.top).toBe(anchor.bottom + 8);
    expect(p.left).toBe(anchor.left + anchor.width / 2 - bubble.width / 2);
  });

  it("puts a top bubble above it", () => {
    const p = computePlacement({
      anchor,
      bubble,
      viewport,
      side: "top",
      align: "center",
    });

    expect(p.top).toBe(anchor.top - bubble.height - 8);
  });

  it("aligns to the anchor's edges", () => {
    const start = computePlacement({
      anchor,
      bubble,
      viewport,
      side: "bottom",
      align: "left",
    });
    const end = computePlacement({
      anchor,
      bubble,
      viewport,
      side: "bottom",
      align: "right",
    });

    expect(start.left).toBe(anchor.left);
    expect(end.left).toBe(anchor.right - bubble.width);
  });

  it("never leaves the viewport", () => {
    const edge = { ...anchor, left: 0, right: 10, width: 10 };
    const p = computePlacement({
      anchor: edge,
      bubble,
      viewport,
      side: "bottom",
      align: "center",
    });

    expect(p.left).toBeGreaterThanOrEqual(MARGIN);
    expect(p.left + bubble.width).toBeLessThanOrEqual(viewport.width);
  });

  it("applies the offset after the side is chosen", () => {
    const plain = computePlacement({
      anchor,
      bubble,
      viewport,
      side: "bottom",
      align: "center",
    });
    const nudged = computePlacement({
      anchor,
      bubble,
      viewport,
      side: "bottom",
      align: "center",
      offset: { x: 10, y: -12 },
    });

    expect(nudged.left).toBe(plain.left + 10);
    expect(nudged.top).toBe(plain.top - 12);
  });

  it("points the caret at the anchor's centre", () => {
    const p = computePlacement({
      anchor,
      bubble,
      viewport,
      side: "bottom",
      align: "center",
    });
    const cx = anchor.left + anchor.width / 2;
    const caretLeft = (p.arrow.left ?? 0) + 4;

    /* The caret's centre lands on the anchor's centre, inside the bubble. */
    expect(p.left + caretLeft).toBeCloseTo(cx, 0);
  });

  it("keeps the caret inside a bubble clamped at the edge", () => {
    /* Anchor hard against the right edge: the bubble is clamped, the caret must stay
       inside the rounded corner rather than hanging off it. */
    const edge = {
      left: 1190,
      right: 1200,
      top: 300,
      bottom: 340,
      width: 10,
      height: 40,
    };
    const p = computePlacement({
      anchor: edge,
      bubble,
      viewport,
      side: "bottom",
      align: "center",
    });

    const caret = p.arrow.left ?? 0;
    expect(caret).toBeGreaterThanOrEqual(4);
    expect(caret).toBeLessThanOrEqual(bubble.width - 4);
  });

  it("follows the caller's fallback order, not the roomiest side", () => {
    /* Nothing fits the requested side; top is roomiest but the caller asked for right first. */
    const tall = { width: 120, height: 400 };
    const p = computePlacement({
      anchor,
      bubble: tall,
      viewport,
      side: "top",
      align: "center",
      fallbackSides: ["right", "bottom"],
    });

    expect(p.side).toBe("right");
  });

  it("clamps inside a boundary instead of the window", () => {
    /* A modal that starts at x=300 and is 400 wide: the bubble must stay inside it. */
    const p = computePlacement({
      anchor,
      bubble,
      viewport,
      side: "bottom",
      align: "center",
      boundary: { top: 0, left: 300, width: 400, height: 600 },
    });

    expect(p.left).toBeGreaterThanOrEqual(300 + MARGIN);
    expect(p.left + bubble.width).toBeLessThanOrEqual(300 + 400);
  });

  it("mirrors left and right on an RTL page", () => {
    const p = computePlacement({
      anchor,
      bubble,
      viewport,
      side: "left",
      align: "center",
      rtl: true,
    });

    expect(p.side).toBe("right");
  });

  it("reports a flip", () => {
    const low = { ...anchor, top: 780, bottom: 800 };
    const p = computePlacement({
      anchor: low,
      bubble,
      viewport,
      side: "bottom",
      align: "center",
    });

    expect(p.flipped).toBe(true);
    expect(p.side).toBe("top");
  });
});
