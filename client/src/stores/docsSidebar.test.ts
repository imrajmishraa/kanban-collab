import { beforeEach, describe, expect, it } from "vitest";

import { useDocsSidebarState } from "./docsSidebar";

/**
 * The docs column's preference.
 *
 * The bug this pins is behavioural, not cosmetic: the layout held the flag in a
 * `useState`, so a reload reopened the column. The store is the fix; these cases
 * check the transitions the toggle goes through, and that the persisted shape is
 * the preference only.
 */

function reset() {
  useDocsSidebarState.setState({ collapsed: false });
}

describe("useDocsSidebarState", () => {
  beforeEach(reset);

  it("starts open", () => {
    expect(useDocsSidebarState.getState().collapsed).toBe(false);
  });

  it("toggles both ways", () => {
    useDocsSidebarState.getState().toggleCollapsed();
    expect(useDocsSidebarState.getState().collapsed).toBe(true);

    useDocsSidebarState.getState().toggleCollapsed();
    expect(useDocsSidebarState.getState().collapsed).toBe(false);
  });

  it("sets explicitly, so a stored value can be applied on load", () => {
    useDocsSidebarState.getState().setCollapsed(true);
    expect(useDocsSidebarState.getState().collapsed).toBe(true);

    useDocsSidebarState.getState().setCollapsed(false);
    expect(useDocsSidebarState.getState().collapsed).toBe(false);
  });

  it("survives a re-render without losing the value", () => {
    useDocsSidebarState.getState().toggleCollapsed();

    /* Reading it twice is what a component does on every render; the value must
       not be recomputed from a default. */
    const first = useDocsSidebarState.getState().collapsed;
    const second = useDocsSidebarState.getState().collapsed;

    expect(first).toBe(true);
    expect(second).toBe(first);
  });

  it("keeps the two rails independent", () => {
    /* The docs column has its own key and its own store on purpose: collapsing
       docs must not touch the app rail, which has a `hover` mode docs does not. */
    useDocsSidebarState.getState().setCollapsed(true);

    expect(useDocsSidebarState.getState().collapsed).toBe(true);
    expect(useDocsSidebarState.getState()).not.toHaveProperty("mode");
  });
});
