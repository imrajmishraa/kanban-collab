import { describe, expect, it } from "vitest";

import { DRAG_DAMPING, dampedWidth } from "./railDrag";

/**
 * A drag follows part of the pointer's travel, not all of it.
 *
 * That is what makes it feel smooth: a 1px tremor is not a 1px layout shift, and the
 * magnetic stops are easier to land on. Both edges share the number, so they feel alike.
 */
describe("dampedWidth", () => {
  it("moves slower than the pointer", () => {
    expect(dampedWidth(288, 500, 600, 1)).toBeCloseTo(288 + 100 * DRAG_DAMPING);
  });

  it("is symmetric: the right column widens as the pointer moves left", () => {
    expect(dampedWidth(420, 900, 800, -1)).toBeCloseTo(
      420 + 100 * DRAG_DAMPING,
    );
  });

  it("does not move without travel", () => {
    expect(dampedWidth(420, 700, 700, -1)).toBe(420);
  });

  it("keeps a 1px tremor under a pixel of layout", () => {
    expect(Math.abs(dampedWidth(420, 700, 701, -1) - 420)).toBeLessThan(1);
  });

  it("is slower than 1:1, and still quick enough to cross the rail's range", () => {
    expect(DRAG_DAMPING).toBeGreaterThan(0.4);
    expect(DRAG_DAMPING).toBeLessThan(1);
  });
});
