import { describe, expect, it } from "vitest";

import { resolveToaster } from "@/components/toaster/toasterResolve";
import { TOAST_MS } from "@/lib/toastTokens";

import {
  LAB_DEFAULTS,
  FILLS,
  POSITIONS,
  SHAPES,
  SIZES,
  TONES,
  applyPreset,
  snippet,
  toToasterProps,
} from "./labConfig";

/**
 * The lab is a surface for looking at the component, so its job is to not drift
 * from it: every list comes from the component's own tables, and the props it
 * builds are checked through the component's own resolver.
 */
describe("the option lists", () => {
  it("covers every value the component accepts", () => {
    expect(SHAPES).toHaveLength(17);
    expect(SIZES).toEqual(["xs", "sm", "md", "lg", "xl"]);
    expect(TONES).toHaveLength(11);
    expect(TONES).toContain("auth");
    expect(TONES).toContain("inverse");
    expect(TONES).toContain("info");
    expect(FILLS).toEqual(["solid", "soft", "outline"]);
    expect(POSITIONS).toHaveLength(6);
  });
});

describe("applyPreset", () => {
  it("fills the controls a preset names", () => {
    const quiet = applyPreset("quiet", LAB_DEFAULTS);

    expect(quiet.size).toBe("sm");
    expect(quiet.visibleToasts).toBe(1);
    expect(quiet.closeButton).toBe(false);
    expect(quiet.duration).toBe(TOAST_MS.moment);
  });

  it("fills layout numbers, not just words", () => {
    const compact = applyPreset("compact", LAB_DEFAULTS);

    expect([compact.width, compact.gap, compact.offset]).toEqual([320, 6, 12]);
  });

  it("leaves alone what the preset does not name", () => {
    const before = { ...LAB_DEFAULTS, position: "top-center" as const };

    expect(applyPreset("quiet", before).position).toBe("top-center");
  });

  it("changes nothing for the default preset", () => {
    expect(applyPreset("default", LAB_DEFAULTS)).toEqual(LAB_DEFAULTS);
  });
});

describe("toToasterProps", () => {
  it("builds a toaster that renders what the controls say", () => {
    const resolved = resolveToaster(
      toToasterProps({
        ...LAB_DEFAULTS,
        width: 420,
        shape: "card",
        tone: "brand",
        duration: 1234,
      }),
    );

    expect(resolved.toastStyle["--width"]).toBe("420px");
    expect(resolved.toastStyle["--normal-bg"]).toBe("var(--brand)");
    expect(resolved.classNames.toast).toContain("!rounded-[20px]");
    expect(resolved.duration).toBe(1234);
  });

  it("never sends the preset, so it cannot override the panel behind it", () => {
    expect(
      toToasterProps({ ...LAB_DEFAULTS, preset: "quiet" }),
    ).not.toHaveProperty("preset");
  });
});

describe("snippet", () => {
  it("shows the props the lab is actually rendering", () => {
    const text = snippet({ ...LAB_DEFAULTS, shape: "pill", width: 400 });

    expect(text.startsWith("<Toaster")).toBe(true);
    expect(text).toContain('shape: "pill"');
    expect(text).toContain("width: 400");
  });
});
