import { describe, expect, it } from "vitest";

import {
  ANIMATION_CLASS,
  DESCRIPTION_INK,
  MOBILE_WIDTH,
  MOBILE_WIDTH_PX,
  PRESET,
  SHAPE_CLASS,
  SIZE_CLASS,
  SURFACE,
  dimension,
} from "./toasterVariants";
import { TOAST_MS } from "@/lib/toastTokens";

/**
 * The variant tables, without a browser.
 *
 * These run in the node environment so they work everywhere, including the
 * constrained container the render tests cannot run in. They pin the parts that
 * are easy to break by editing a string: which variant maps to which class, and
 * which number lives in one place.
 */
describe("shape variants", () => {
  it("keeps the app's card radius as the default", () => {
    expect(SHAPE_CLASS.default).toBe("!rounded-[12px]");
  });

  it("gives every shape its own class list", () => {
    const shapes = Object.values(SHAPE_CLASS);

    expect(new Set(shapes).size).toBe(shapes.length);
  });

  it("offers the tooltip's silhouettes and edges as well as radii", () => {
    expect(Object.keys(SHAPE_CLASS)).toHaveLength(17);
    expect(SHAPE_CLASS.speech).toContain("!rounded-bl-[2px]");
    expect(SHAPE_CLASS.chamfer).toContain("clip-path");
    expect(SHAPE_CLASS.dashed).toContain("!border-dashed");
    expect(SHAPE_CLASS.callout).toContain("!border-l-current");
  });

  it("adds a blur only for glass", () => {
    expect(SHAPE_CLASS.glass).toContain("!backdrop-blur-md");

    for (const [shape, classes] of Object.entries(SHAPE_CLASS)) {
      if (shape !== "glass") expect(classes).not.toContain("backdrop-blur");
    }
  });
});

describe("size variants", () => {
  it("scales the title monotonically, xs through xl", () => {
    expect(SIZE_CLASS.xs.title).toContain("11px");
    expect(SIZE_CLASS.sm.title).toContain("12px");
    expect(SIZE_CLASS.md.title).toContain("13px");
    expect(SIZE_CLASS.lg.title).toContain("15px");
    expect(SIZE_CLASS.xl.title).toContain("17px");
  });

  it("leaves the description's ink to the tone, not to the scale", () => {
    for (const scale of Object.values(SIZE_CLASS)) {
      expect(scale.description).not.toContain("text-(");
    }

    expect(DESCRIPTION_INK).toBe("!text-(--toast-description)");
  });
});

describe("the default surface", () => {
  it("stays a gradient panel at the default width", () => {
    expect(SURFACE["--normal-bg"]).toContain("linear-gradient");
    expect(SURFACE["--width"]).toBe("380px");
  });

  it("owns no radius — SHAPE_CLASS is the only writer of it", () => {
    expect(SURFACE["--border-radius"]).toBeUndefined();
  });

  it("carries the mobile cap as a variable, not a class", () => {
    expect(SURFACE["--toast-mobile-width"]).toBe(`${MOBILE_WIDTH_PX}px`);
    expect(MOBILE_WIDTH).toContain("max-w-[var(--toast-mobile-width)]");
    expect(MOBILE_WIDTH).not.toContain(`${MOBILE_WIDTH_PX}px`);
  });

  it("caps the toast below sonner's own breakpoint, not Tailwind's sm", () => {
    expect(MOBILE_WIDTH).toContain("max-width:600px");
    expect(MOBILE_WIDTH).not.toContain("sm:");
  });
});

describe("animations", () => {
  it("offers the four, and only `none` stops moving", () => {
    expect(Object.keys(ANIMATION_CLASS)).toEqual([
      "fade",
      "slide",
      "scale",
      "none",
    ]);
    expect(ANIMATION_CLASS.none).toContain("!transition-none");

    for (const [name, classes] of Object.entries(ANIMATION_CLASS)) {
      if (name === "none") continue;

      expect(classes).toContain("!transition");
      expect(classes).toContain("!duration-300");
    }
  });
});

describe("presets", () => {
  it("leaves the default preset empty, so it changes nothing", () => {
    expect(PRESET.default).toEqual({});
  });

  it("only fills groups the component knows", () => {
    const groups = new Set(["appearance", "layout", "behaviour", "a11y"]);

    for (const preset of Object.values(PRESET)) {
      for (const key of Object.keys(preset)) expect(groups).toContain(key);
    }
  });

  it("gives quiet the moment lifetime rather than a number of its own", () => {
    expect(PRESET.quiet.behaviour?.duration).toBe(TOAST_MS.moment);
  });

  it("shows one toast when quiet, five when assertive", () => {
    expect(PRESET.quiet.layout?.visibleToasts).toBe(1);
    expect(PRESET.assertive.layout?.visibleToasts).toBe(5);
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
