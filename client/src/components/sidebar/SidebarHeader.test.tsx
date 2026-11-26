// @vitest-environment jsdom
import { cleanup, render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The open rail's header, after the logo became the toggle.
 *
 * Four things asked for, each asserted here:
 * 1. the logo shows a hover hint (two glyphs in the same 32px box);
 * 2. clicking the logo toggles the rail — collapse, not hide;
 * 3. "Kanban" stays a link to /workspaces, on its own click target;
 * 4. the toggle button on the right of the wordmark is gone.
 */

const navigate = vi.fn();
const setMode = vi.fn();
const onToggle = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();

  return { ...actual, useNavigate: () => navigate };
});

/* The feature barrel pulls in the whole dashboard; this header needs one setter. */
vi.mock("@/features/dashboard", () => ({
  useSidebarState: (
    selector: (state: { setMode: typeof setMode }) => unknown,
  ) => selector({ setMode }),
}));

/* The tooltip is a portal with analytics behind it — irrelevant to this contract. */
vi.mock("@/components/Tooltips/ToolTip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/assets/KanbanIcon", () => ({
  default: () => <svg data-testid="kanban-logo" />,
}));

import SidebarHeader from "./SidebarHeader";

const renderOpen = () =>
  render(<SidebarHeader collapsed={false} onToggle={onToggle} />);

/* No globals, so nothing unmounts between cases: eight buttons would pile up. */
afterEach(cleanup);

beforeEach(() => {
  navigate.mockClear();
  setMode.mockClear();
  onToggle.mockClear();
});

describe("SidebarHeader — open rail", () => {
  it("puts the toggle on the logo, with a hover hint beside it", () => {
    renderOpen();

    const toggle = screen.getByRole("button", { name: /collapse sidebar/i });

    /* The logo and the hint share one 32px box: hover swaps them. */
    expect(within(toggle).getByTestId("kanban-logo")).toBeTruthy();
    expect(toggle.querySelectorAll("svg").length).toBeGreaterThanOrEqual(2);
  });

  it("collapses the rail when the logo is clicked", async () => {
    renderOpen();

    await userEvent.click(
      screen.getByRole("button", { name: /collapse sidebar/i }),
    );

    expect(onToggle).toHaveBeenCalledTimes(1);
    /* Collapse, not hide: the icon strip is what the reader asked for. */
    expect(setMode).not.toHaveBeenCalledWith("hidden");
    expect(navigate).not.toHaveBeenCalled();
  });

  it("keeps 'Kanban' as its own target that goes to /workspaces", async () => {
    renderOpen();

    const wordmark = screen.getByRole("button", { name: /go to workspaces/i });
    expect(within(wordmark).queryByTestId("kanban-logo")).toBeNull();

    await userEvent.click(wordmark);

    expect(navigate).toHaveBeenCalledWith("/workspaces");
    expect(onToggle).not.toHaveBeenCalled();
  });

  it("no longer renders a toggle on the right of the wordmark", () => {
    renderOpen();

    /* Two targets and no third: the wordmark and the logo. */
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });
});
