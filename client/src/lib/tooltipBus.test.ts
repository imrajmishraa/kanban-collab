import { afterEach, describe, expect, it, vi } from "vitest";

import {
  claimTooltip,
  onClosedByOther,
  releaseTooltip,
  suppressTooltips,
  tooltipsSuppressed,
} from "./tooltipBus";

/**
 * The rules that cannot live inside one component: one bubble at a time, and nothing while
 * something else owns the pointer.
 */
describe("one at a time", () => {
  it("closes the open bubble when another claims the screen", () => {
    const a = Symbol("a");
    const b = Symbol("b");
    const closeA = vi.fn();

    onClosedByOther(a, closeA);
    claimTooltip(a);
    claimTooltip(b);

    expect(closeA).toHaveBeenCalledTimes(1);
  });

  it("does not close itself when it claims twice", () => {
    const a = Symbol("a");
    const closeA = vi.fn();

    onClosedByOther(a, closeA);
    claimTooltip(a);
    claimTooltip(a);

    expect(closeA).not.toHaveBeenCalled();
  });

  it("only the current holder releases", () => {
    const a = Symbol("a");
    const b = Symbol("b");
    const closeA = vi.fn();
    const closeB = vi.fn();

    onClosedByOther(a, closeA);
    onClosedByOther(b, closeB);

    claimTooltip(a);
    releaseTooltip(b); // not the holder
    claimTooltip(b);

    expect(closeA).toHaveBeenCalledTimes(1);
  });
});

describe("suppression", () => {
  afterEach(() => {
    /* The counter is module state: drain whatever a failed assertion left behind. */
    while (tooltipsSuppressed()) suppressTooltips()();
  });

  it("is off by default", () => {
    expect(tooltipsSuppressed()).toBe(false);
  });

  it("is on while the undo has not been called", () => {
    const undo = suppressTooltips();
    expect(tooltipsSuppressed()).toBe(true);
    undo();
    expect(tooltipsSuppressed()).toBe(false);
  });

  it("nests: two suppressions need two undos", () => {
    const first = suppressTooltips();
    const second = suppressTooltips();

    first();
    expect(tooltipsSuppressed()).toBe(true);

    second();
    expect(tooltipsSuppressed()).toBe(false);
  });

  it("is idempotent per undo, so a double call cannot un-suppress early", () => {
    const undo = suppressTooltips();
    const other = suppressTooltips();

    undo();
    undo();

    expect(tooltipsSuppressed()).toBe(true);
    other();
    expect(tooltipsSuppressed()).toBe(false);
  });
});
