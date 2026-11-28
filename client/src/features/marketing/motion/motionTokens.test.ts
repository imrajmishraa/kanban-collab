import { describe, expect, it } from "vitest";

import {
  arcKeyframes,
  arcOffset,
  PRINCIPLES,
  PRINCIPLE_IDS,
  pressFrames,
  resolveDuration,
  staggerDelay,
} from "./motionTokens";

describe("staggerDelay", () => {
  it("gives the first sibling no delay, so nothing waits on the stagger", () => {
    expect(staggerDelay(0)).toBe(0);
  });

  it("grows by the step", () => {
    expect(staggerDelay(3, 0.06)).toBeCloseTo(0.18, 5);
  });

  it("caps, so a long list does not make the last item wait", () => {
    expect(staggerDelay(40, 0.06, 0.36)).toBe(0.36);
  });

  it("treats a negative or non-finite index as the first sibling", () => {
    expect(staggerDelay(-2)).toBe(0);
    expect(staggerDelay(Number.POSITIVE_INFINITY)).toBe(0);
  });
});

describe("arcOffset", () => {
  it("puts a single item straight below its slot", () => {
    expect(arcOffset(0, 1, 8)).toEqual({ x: 0, y: 8 });
  });

  it("spreads the ends and lifts the middle, inside the radius", () => {
    const first = arcOffset(0, 5, 8);
    const middle = arcOffset(2, 5, 8);
    const last = arcOffset(4, 5, 8);

    expect(first.x).toBe(-8);
    expect(last.x).toBe(8);
    expect(middle.x).toBe(0);
    expect(middle.y).toBe(0);
    expect(first.y).toBe(8);
  });

  it("never travels further than the radius", () => {
    for (let count = 2; count <= 25; count += 1) {
      for (let i = 0; i < count; i += 1) {
        const { x, y } = arcOffset(i, count, 12);
        expect(Math.abs(x)).toBeLessThanOrEqual(12);
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y).toBeLessThanOrEqual(12);
      }
    }
  });
});

describe("pressFrames", () => {
  it("dips, overshoots once, and settles at rest scale", () => {
    const frames = pressFrames();
    expect(frames.down).toBeLessThan(frames.rest);
    expect(frames.release).toBeGreaterThan(frames.rest);
    expect(frames.settle).toBe(frames.rest);
  });

  it("keeps the overshoot small enough to read as a reaction", () => {
    expect(pressFrames().release).toBeLessThanOrEqual(1.02);
  });
});

describe("arcKeyframes", () => {
  it("lifts the midpoint above both ends, in either direction", () => {
    expect(arcKeyframes(200, 40)).toEqual([200, 26, 40]);
    expect(arcKeyframes(40, 200)).toEqual([40, 26, 200]);
  });
});

describe("resolveDuration", () => {
  it("returns the duration when motion is allowed", () => {
    expect(resolveDuration(0.7, false)).toBe(0.7);
  });

  it("returns nothing when the reader asked for reduced motion", () => {
    expect(resolveDuration(0.7, true)).toBe(0);
  });
});

describe("the ten principles", () => {
  it("covers all ten, once each", () => {
    expect(PRINCIPLE_IDS).toHaveLength(10);
    expect(new Set(PRINCIPLE_IDS).size).toBe(10);
  });

  it("points every principle at a surface and a number", () => {
    for (const principle of PRINCIPLES) {
      expect(principle.where.length).toBeGreaterThan(0);
      expect(principle.rule).toMatch(/\d/);
    }
  });
});
