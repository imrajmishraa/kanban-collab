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

/* One store, three slices: `readShellState` reads the rail's and the column's. */
vi.mock("@/stores/panelState", () => ({
  usePanelState: {
    getState: () => ({
      leftPanel: { mode: "hidden", hovering: true, width: 288 },
      centrePanel: { scrollTop: 0 },
      rightPanel: { mode: "panel", width: 400, level: "normal" },
    }),
  },
}));

import { usePanelState } from "@/stores/panelState";
import { readShellState } from "./layoutShellStore";

beforeEach(() => setModeSpy.mockClear());
afterEach(() => vi.restoreAllMocks());

describe("readShellState", () => {
  it("does not read a preview as an open rail", () => {
    const store = usePanelState as unknown as {
      getState: () => { leftPanel: { mode: string; hovering: boolean } };
    };
    const original = store.getState;
    store.getState = () => ({
      leftPanel: { mode: "hidden", hovering: true },
      rightPanel: { mode: "panel", width: 400 },
    });

    expect(readShellState().railOpen).toBe(false);

    store.getState = original;
  });

  it("still reads open and collapsed as open", () => {
    const store = usePanelState as unknown as {
      getState: () => { leftPanel: { mode: string; hovering?: boolean } };
    };
    const original = store.getState;

    for (const mode of ["expanded", "collapsed"]) {
      store.getState = () => ({
        leftPanel: { mode },
        rightPanel: { mode: "panel", width: 400 },
      });
      expect(readShellState().railOpen).toBe(true);
    }

    store.getState = original;
  });
});
