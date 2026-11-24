import { describe, expect, it } from "vitest";

import { resolveTriggers } from "./tooltipTriggers";

/**
 * "Hover to peek, click to pin" is a pair, so the prop takes a list. These pin what each
 * combination means.
 */
describe("resolveTriggers", () => {
  it("defaults to hover, and only where the device can hover", () => {
    expect(resolveTriggers(undefined, true).hover).toBe(true);
    expect(resolveTriggers(undefined, false).hover).toBe(false);
  });

  it("accepts one gesture", () => {
    expect(resolveTriggers("click", true)).toEqual({
      hover: false,
      focus: false,
      click: true,
      manual: false,
    });
  });

  it("accepts several", () => {
    const both = resolveTriggers(["hover", "click"], true);

    expect(both.hover).toBe(true);
    expect(both.click).toBe(true);
  });

  it("drops hover on a device without one, and keeps the click", () => {
    const touch = resolveTriggers(["hover", "click"], false);

    expect(touch.hover).toBe(false);
    expect(touch.click).toBe(true);
  });

  it("opens on keyboard focus for hover and focus, but not for click alone", () => {
    expect(resolveTriggers(["hover"], true).focus).toBe(true);
    expect(resolveTriggers("focus", true).focus).toBe(true);
    expect(resolveTriggers("click", true).focus).toBe(false);
  });

  it("leaves manual alone", () => {
    expect(resolveTriggers("manual", true)).toEqual({
      hover: false,
      focus: false,
      click: false,
      manual: true,
    });
  });
});
