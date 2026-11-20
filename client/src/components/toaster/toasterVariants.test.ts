import { describe, expect, it } from "vitest";

import {
  SHAPE_CLASS,
  SIZE_CLASS,
  SURFACE,
  SURFACE_BY_TONE,
  dimension,
} from "./toasterVariants";

/**
 * The variant tables, without a browser.
 *
 * These run in the node environment so they work everywhere, including the
 * constrained container the render tests cannot run in. They pin the parts that
 * are easy to break by editing a string: which variant maps to which class, and
 * which tone overrides which CSS variable.
 */
describe("shape variants", () => {
  it("keeps the app's card radius as the default", () => {
    expect(SHAPE_CLASS.default).toBe("!rounded-[12px]");
  });

  it("gives every shape its own radius", () => {
    const radii = Object.values(SHAPE_CLASS);

    expect(new Set(radii).size).toBe(radii.length);
  });

  it("adds a blur only for glass", () => {
    expect(SHAPE_CLASS.glass).toContain("!backdrop-blur-md");

    for (const [shape, classes] of Object.entries(SHAPE_CLASS)) {
      if (shape !== "glass") expect(classes).not.toContain("backdrop-blur");
    }
  });
});

describe("size variants", () => {
  it("scales the title monotonically", () => {
    expect(SIZE_CLASS.sm.title).toContain("12px");
    expect(SIZE_CLASS.md.title).toContain("13px");
    expect(SIZE_CLASS.lg.title).toContain("15px");
  });

  it("keeps every description muted", () => {
    for (const scale of Object.values(SIZE_CLASS)) {
      expect(scale.description).toContain("text-(--text-muted)");
    }
  });
});

describe("tone surfaces", () => {
  it("leaves the default surface alone", () => {
    expect(SURFACE_BY_TONE.auto).toEqual({});
  });

  it("paints from tokens, never a raw colour", () => {
    for (const surface of Object.values(SURFACE_BY_TONE)) {
      for (const value of Object.values(surface)) {
        if (typeof value !== "string") continue;

        expect(value).toMatch(/var\(--|color-mix/);
      }
    }
  });

  it("gives each tone its own background variable", () => {
    const backgrounds = Object.values(SURFACE_BY_TONE)
      .map((surface) => surface["--normal-bg"])
      .filter(Boolean);

    expect(new Set(backgrounds).size).toBe(backgrounds.length);
  });

  it("ships an auth token for the login surface", () => {
    expect(SURFACE_BY_TONE.brand["--normal-bg"]).toBe("var(--brand)");
  });
});

describe("the default surface", () => {
  it("stays a gradient panel at 380px", () => {
    expect(SURFACE["--normal-bg"]).toContain("linear-gradient");
    expect(SURFACE["--width"]).toBe("380px");
    expect(SURFACE["--border-radius"]).toBe("12px");
  });
});

describe("dimension()", () => {
  it("passes numbers through as px", () => {
    expect(dimension(72)).toBe("72px");
  });

  it("passes strings through untouched", () => {
    expect(dimension("50vh")).toBe("50vh");
    expect(dimension("28rem")).toBe("28rem");
  });

  it("returns undefined so the caller can skip the property", () => {
    expect(dimension(undefined)).toBeUndefined();
  });
});
