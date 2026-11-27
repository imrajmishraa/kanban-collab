// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * A preview is not an open rail.
 *
 * Reading a preview as open made the pane reserve the rail's width for a glance, so
 * the board moved for a hover. The mode is the only thing that decides "open": the
 * `hovering` flag cannot, and there is no preview mode to mistake for one.
 */

const setModeSpy = vi.fn();

vi.mock("@/features/dashboard", () => ({
  useSidebarState: { getState: () => ({ mode: "hidden", hovering: true }) },
}));

vi.mock("@/stores/rightPanel", () => ({
  useRightPanel: { getState: () => ({ mode: "panel", width: 400 }) },
}));

import { useSidebarState } from "@/features/dashboard";
import { readShellState } from "./layoutShellStore";

beforeEach(() => setModeSpy.mockClear());
afterEach(() => vi.restoreAllMocks());

describe("readShellState", () => {
  it("does not read a preview as an open rail", () => {
    const store = useSidebarState as unknown as {
      getState: () => { mode: string; hovering: boolean };
    };
    const original = store.getState;
    store.getState = () => ({ mode: "hidden", hovering: true });

    expect(readShellState().railOpen).toBe(false);

    store.getState = original;
  });

  it("still reads open and collapsed as open", () => {
    const store = useSidebarState as unknown as {
      getState: () => { mode: string; hovering?: boolean };
    };
    const original = store.getState;

    for (const mode of ["expanded", "collapsed"]) {
      store.getState = () => ({ mode });
      expect(readShellState().railOpen).toBe(true);
    }

    store.getState = original;
  });
});
