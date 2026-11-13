import { beforeEach, describe, expect, it } from "vitest";

import { useSidebarState } from "./sidebarState";

/** Reset to the store's own defaults between cases. */
function reset() {
  useSidebarState.setState({
    mode: "open",
    collapsed: false,
    hovering: false,
    boardsOpen: true,
  });
}

describe("useSidebarState", () => {
  beforeEach(reset);

  it("derives `collapsed` from `mode` for every mode", () => {
    for (const mode of ["open", "collapsed", "hover"] as const) {
      useSidebarState.getState().setMode(mode);

      const state = useSidebarState.getState();
      expect(state.mode).toBe(mode);
      expect(state.collapsed).toBe(mode !== "open");
    }
  });

  it("clears `hovering` when leaving hover mode", () => {
    useSidebarState.getState().setMode("hover");
    useSidebarState.getState().setHovering(true);
    expect(useSidebarState.getState().hovering).toBe(true);

    useSidebarState.getState().setMode("collapsed");

    const state = useSidebarState.getState();
    expect(state.mode).toBe("collapsed");
    expect(state.hovering).toBe(false);
  });

  it("toggles between open and collapsed", () => {
    useSidebarState.getState().toggleCollapsed();
    expect(useSidebarState.getState().mode).toBe("collapsed");
    expect(useSidebarState.getState().collapsed).toBe(true);

    useSidebarState.getState().toggleCollapsed();
    expect(useSidebarState.getState().mode).toBe("open");
    expect(useSidebarState.getState().collapsed).toBe(false);
  });

  it("expands out of hover mode and drops the hover flag", () => {
    useSidebarState.getState().setMode("hover");
    useSidebarState.getState().setHovering(true);

    useSidebarState.getState().expand();

    const state = useSidebarState.getState();
    expect(state.mode).toBe("open");
    expect(state.collapsed).toBe(false);
    expect(state.hovering).toBe(false);
  });

  it("toggles the boards section independently of the rail", () => {
    useSidebarState.getState().toggleBoards();
    expect(useSidebarState.getState().boardsOpen).toBe(false);
    expect(useSidebarState.getState().mode).toBe("open");

    useSidebarState.getState().openBoards();
    expect(useSidebarState.getState().boardsOpen).toBe(true);
  });
});
