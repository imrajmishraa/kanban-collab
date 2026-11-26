// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * Three rules the review caught, each one a way the shell and the stores disagreed:
 *
 * 1. A preview is not an open rail. Reading `hover` as open made the pane reserve
 *    the rail's width for a glance, so the board moved for a hover.
 * 2. A preview must not become `lastVisible`, or the next ⌘B reopens the rail in
 *    `hover` — a mode that only exists while the pointer is inside.
 * 3. The shortcuts go through the shell's commands, so the fit rules apply to the
 *    keyboard exactly as they do to the buttons.
 */

const setModeSpy = vi.fn();

vi.mock("@/features/dashboard", () => ({
  useSidebarState: { getState: () => ({ mode: "hidden" }) },
}));

vi.mock("@/stores/rightPanel", () => ({
  useRightPanel: { getState: () => ({ mode: "panel", width: 400 }) },
}));

import { useSidebarState } from "@/features/dashboard";
import { readShellState } from "./layoutShellStore";

beforeEach(() => setModeSpy.mockClear());
afterEach(() => vi.restoreAllMocks());

describe("readShellState", () => {
  it("does not read a hover preview as an open rail", () => {
    const store = useSidebarState as unknown as {
      getState: () => { mode: string };
    };
    const original = store.getState;
    store.getState = () => ({ mode: "hover" });

    expect(readShellState().railOpen).toBe(false);

    store.getState = original;
  });

  it("still reads open and collapsed as open", () => {
    const store = useSidebarState as unknown as {
      getState: () => { mode: string };
    };
    const original = store.getState;

    for (const mode of ["open", "collapsed"]) {
      store.getState = () => ({ mode });
      expect(readShellState().railOpen).toBe(true);
    }

    store.getState = original;
  });
});
