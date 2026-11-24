import { describe, expect, it } from "vitest";

import { shortcutKeys } from "./shortcutKeys";

/**
 * A tooltip that says "⌘K" on a Windows machine is wrong twice: the key does not exist and
 * the modifier does not work.
 */
describe("shortcutKeys", () => {
  it("uses the Mac glyphs on a Mac", () => {
    expect(shortcutKeys(["mod", "shift", "k"], true)).toEqual(["⌘", "⇧", "K"]);
  });

  it("spells them out elsewhere", () => {
    expect(shortcutKeys(["mod", "shift", "k"], false)).toEqual([
      "Ctrl",
      "Shift",
      "K",
    ]);
  });

  it("upper-cases a single letter and leaves a word alone", () => {
    expect(shortcutKeys(["j", "enter"], true)).toEqual(["J", "↩"]);
    expect(shortcutKeys(["esc"], false)).toEqual(["Esc"]);
  });

  it("passes through anything it does not know", () => {
    expect(shortcutKeys(["F5"], false)).toEqual(["F5"]);
  });

  it("keeps the order the caller wrote", () => {
    expect(shortcutKeys(["shift", "mod", "p"], true)).toEqual(["⇧", "⌘", "P"]);
  });
});
