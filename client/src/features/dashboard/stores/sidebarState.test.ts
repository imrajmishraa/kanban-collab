import { beforeEach, describe, expect, it } from "vitest";

import { useSidebarState } from "./sidebarState";

/** Reset to the store's own defaults between cases. */
function reset() {
  useSidebarState.setState({
    mode: "expanded",
    collapsed: false,
    hovering: false,
    boardsOpen: true,
  });
}

describe("useSidebarState", () => {
  beforeEach(reset);

  it("derives `collapsed` from `mode` for every mode", () => {
    for (const mode of ["expanded", "collapsed", "hidden"] as const) {
      useSidebarState.getState().setMode(mode);

      const state = useSidebarState.getState();
      expect(state.mode).toBe(mode);
      expect(state.collapsed).toBe(mode !== "expanded");
    }
  });

  it("clears `hovering` when the mode really changes", () => {
    useSidebarState.getState().setMode("hidden");
    useSidebarState.getState().setHovering(true);
    expect(useSidebarState.getState().hovering).toBe(true);

    useSidebarState.getState().setMode("collapsed");

    const state = useSidebarState.getState();
    expect(state.mode).toBe("collapsed");
    expect(state.hovering).toBe(false);
  });

  /*
   * The bug this pins: the shell re-asserts the mode after every commit, and a
   * `setMode` that clears `hovering` even when the mode did not change ended a
   * preview the pointer was still inside.
   */
  it("leaves a preview alone when the mode is re-asserted", () => {
    useSidebarState.getState().setMode("hidden");
    useSidebarState.getState().setHovering(true);

    useSidebarState.getState().setMode("hidden");

    expect(useSidebarState.getState().hovering).toBe(true);
    expect(useSidebarState.getState().mode).toBe("hidden");
  });

  it("toggles between expanded and collapsed", () => {
    useSidebarState.getState().toggleCollapsed();
    expect(useSidebarState.getState().mode).toBe("collapsed");
    expect(useSidebarState.getState().collapsed).toBe(true);

    useSidebarState.getState().toggleCollapsed();
    expect(useSidebarState.getState().mode).toBe("expanded");
    expect(useSidebarState.getState().collapsed).toBe(false);
  });

  it("pins a preview and drops the hover flag", () => {
    useSidebarState.getState().setMode("hidden");
    useSidebarState.getState().setHovering(true);

    useSidebarState.getState().expand();

    const state = useSidebarState.getState();
    expect(state.mode).toBe("expanded");
    expect(state.collapsed).toBe(false);
    expect(state.hovering).toBe(false);
  });

  it("toggles the boards section independently of the rail", () => {
    useSidebarState.getState().toggleBoards();
    expect(useSidebarState.getState().boardsOpen).toBe(false);
    expect(useSidebarState.getState().mode).toBe("expanded");

    useSidebarState.getState().openBoards();
    expect(useSidebarState.getState().boardsOpen).toBe(true);
  });
});
