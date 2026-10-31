// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { applyThemeWithReveal } from "./themeReveal";

/**
 * The theme reveal, as design.md specifies it.
 *
 * The interesting behaviour is not the iris itself but what happens around it:
 * one reveal owns the frame at a time, a repeat press switches instantly
 * instead of stacking a second transition, the input lock always comes back,
 * and a run that is torn down never cleans up after the run that replaced it.
 * Those are the cases that produced a visibly stuck animation in the wild, so
 * they are the cases worth pinning.
 *
 * The module keeps its run, its tap clock and its lock timer at module scope,
 * so the suite is written to be order-independent: every test settles the iris
 * it started, and the clock only ever moves forward.
 */

type FakeAnimation = Animation & {
  finished: Promise<void>;
  cancel: () => void;
};

interface Harness {
  transitions: number;
  skipped: number;
  animations: FakeAnimation[];
  options: Array<Record<string, unknown>>;
  releaseReady: () => void;
  releaseFinished: () => void;
}

/**
 * Installs a stand-in for `document.startViewTransition` and
 * `Element.prototype.animate`, neither of which jsdom implements. `ready` and
 * `finished` are resolved by hand so each step of the sequence can be asserted
 * on its own.
 */
function install(): Harness {
  let resolveReady: () => void = () => {};
  let rejectReady: (error: Error) => void = () => {};
  let resolveFinished: () => void = () => {};

  const harness: Harness = {
    transitions: 0,
    skipped: 0,
    animations: [],
    options: [],
    releaseReady: () => resolveReady(),
    releaseFinished: () => resolveFinished(),
  };

  (document as unknown as Record<string, unknown>).startViewTransition = (
    callback: () => void,
  ) => {
    harness.transitions += 1;
    const ready = new Promise<void>((resolve, reject) => {
      resolveReady = resolve;
      rejectReady = reject;
    });
    // The browser runs the callback before the new frame is captured.
    callback();
    return {
      ready,
      finished: Promise.resolve(),
      skipTransition: () => {
        harness.skipped += 1;
        rejectReady(new DOMException("skipped", "AbortError"));
      },
    };
  };

  Element.prototype.animate = function (_keyframes, options) {
    harness.options.push(options as Record<string, unknown>);
    const finished = new Promise<void>((resolve) => {
      resolveFinished = resolve;
    });
    const animation = {
      finished,
      cancel: vi.fn(() => resolveFinished()),
    } as unknown as FakeAnimation;
    harness.animations.push(animation);
    return animation;
  } as Element["animate"];

  return harness;
}

/** Let the microtasks behind `ready` and `finished` run. */
const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
  await Promise.resolve();
};

/** End a reveal so the next test starts from a clean module state. */
async function settle(harness: Harness) {
  harness.releaseReady();
  await flush();
  harness.releaseFinished();
  await flush();
}

function teardown() {
  delete (document as unknown as Record<string, unknown>).startViewTransition;
  vi.useRealTimers();
  document.documentElement.className = "";
  document.documentElement.removeAttribute("style");
}

const root = () => document.documentElement;
const setLight = () => root().classList.add("light");
const clearLight = () => root().classList.remove("light");

// Each test runs far enough after the previous one that the 200ms coalesce
// window has always expired; tests that want a repeat press create it
// themselves, at their own timestamp.
let clock = 0;

beforeEach(() => {
  clock += 10_000;
  vi.useFakeTimers();
  vi.setSystemTime(clock);
  /* Vitest's fake timers fake `Date` and the timer functions, but not
     `performance.now()` — and the module measures its coalesce window with
     `performance.now()`. Without this stub the clock never advances between
     tests, so every press after the first looks like a repeat and the suite
     tests the instant path instead of the reveal. */
  vi.spyOn(performance, "now").mockImplementation(() => Date.now());
});

afterEach(() => {
  teardown();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("applyThemeWithReveal", () => {
  it("runs one transition and clips the frame that is arriving", async () => {
    const harness = install();

    applyThemeWithReveal(setLight);

    expect(harness.transitions).toBe(1);
    harness.releaseReady();
    await flush();

    // Going light: the new frame grows out of the control, so the clip belongs
    // to ::view-transition-new(root).
    expect(harness.options[0]?.pseudoElement).toBe(
      "::view-transition-new(root)",
    );
    expect(harness.options[0]?.duration).toBe(1200);
    expect(harness.options[0]?.fill).toBe("both");
    await settle(harness);
  });

  it("closes the old frame when going dark", async () => {
    const harness = install();
    setLight();

    applyThemeWithReveal(clearLight);
    harness.releaseReady();
    await flush();

    expect(harness.options[0]?.pseudoElement).toBe(
      "::view-transition-old(root)",
    );
    expect(harness.options[0]?.duration).toBe(900);
    await settle(harness);
  });

  it("locks the control while the iris runs and releases it when it ends", async () => {
    const harness = install();
    applyThemeWithReveal(setLight);

    expect(root().classList.contains("vt-running")).toBe(true);
    expect(root().classList.contains("vt-grow")).toBe(true);

    await settle(harness);

    expect(root().classList.contains("vt-running")).toBe(false);
    expect(root().classList.contains("vt-grow")).toBe(false);
  });

  it("switches instantly instead of stacking a second transition", async () => {
    const harness = install();
    applyThemeWithReveal(setLight);
    harness.releaseReady();
    await flush();

    // A second press while the first iris is still on screen.
    const second = vi.fn(clearLight);
    applyThemeWithReveal(second);

    expect(harness.transitions).toBe(1); // no second transition
    expect(second).toHaveBeenCalledTimes(1); // the theme did change
    expect(harness.skipped).toBe(1); // the old one was torn down
    expect(harness.animations[0].cancel).toHaveBeenCalled();
    expect(root().classList.contains("vt-running")).toBe(false);
  });

  it("switches instantly when the press follows the previous one closely", async () => {
    const harness = install();
    applyThemeWithReveal(setLight);
    await settle(harness);

    vi.advanceTimersByTime(50); // inside the 200ms coalesce window
    applyThemeWithReveal(clearLight);

    expect(harness.transitions).toBe(1);
    expect(root().classList.contains("vt-running")).toBe(false);
  });

  it("animates again once the quiet window has passed", async () => {
    const harness = install();
    applyThemeWithReveal(setLight);
    await settle(harness);

    vi.advanceTimersByTime(500);
    applyThemeWithReveal(clearLight);

    expect(harness.transitions).toBe(2);
    await settle(harness);
  });

  it("does not animate when the browser has no View Transitions", () => {
    // No install(): document.startViewTransition is undefined.
    const apply = vi.fn(setLight);
    applyThemeWithReveal(apply);

    expect(apply).toHaveBeenCalledTimes(1);
    expect(root().classList.contains("vt-running")).toBe(false);
  });

  it("does not animate under prefers-reduced-motion", () => {
    const harness = install();
    vi.stubGlobal(
      "matchMedia",
      vi.fn(() => ({
        matches: true,
        addEventListener() {},
        removeEventListener() {},
      })),
    );

    const apply = vi.fn(setLight);
    applyThemeWithReveal(apply);

    expect(harness.transitions).toBe(0);
    expect(apply).toHaveBeenCalledTimes(1);
    vi.unstubAllGlobals();
  });

  it("releases the lock on a timer when the animation never settles", async () => {
    const harness = install();
    applyThemeWithReveal(setLight);
    harness.releaseReady();
    await flush();

    expect(root().classList.contains("vt-running")).toBe(true);

    // A torn-down transition can leave `finished` pending forever. Without the
    // failsafe the class stays, the CSS lock swallows every press, and the
    // theme control is dead until reload.
    vi.advanceTimersByTime(1200 + 200 + 600);

    expect(root().classList.contains("vt-running")).toBe(false);
    await settle(harness);
  });

  it("does not let a torn-down run clear the classes of the run that replaced it", async () => {
    const harness = install();
    applyThemeWithReveal(setLight);
    harness.releaseReady();
    await flush();

    // Second press: the instant path cancels the first animation. The cancelled
    // animation's `finished` settles afterwards and must not strip the classes
    // that the next reveal has already set.
    applyThemeWithReveal(clearLight);
    await flush();

    expect(root().classList.contains("vt-collapse")).toBe(false);
    expect(root().classList.contains("vt-running")).toBe(false);
  });
});
