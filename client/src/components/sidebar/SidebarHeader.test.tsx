// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The rail's own header, as the rail actually is.
 *
 * Open, it is a bare `h-12` row with `px-2`: the rail's controls live at its left
 * edge, where the eye already is, and there is no title — the navbar's wordmark
 * names the app, so repeating it here would be the same word twice.
 *
 * Collapsed, it is a different header: one logo button, the way back in.
 */

const setMode = vi.fn();
const onToggle = vi.fn();

vi.mock("@/features/dashboard", () => ({
  useSidebarState: (
    selector: (state: { setMode: typeof setMode }) => unknown,
  ) => selector({ setMode }),
  /* The rail's "keep open" hint. */
  NavbarSearchIcon: () => null,
}));

vi.mock("@/components/Tooltips/ToolTip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/assets/KanbanIcon", () => ({
  default: () => <svg data-testid="kanban-logo" />,
}));

import SidebarHeader from "./SidebarHeader";

beforeEach(() => {
  setMode.mockClear();
  onToggle.mockClear();
});

afterEach(cleanup);

describe("SidebarHeader — open rail", () => {
  it("is one bare row: the rail's frame, no title", () => {
    const { container } = render(
      <SidebarHeader collapsed={false} onToggle={onToggle} />,
    );

    const header = container.querySelector("header");
    expect(header).toBeTruthy();
    expect(header?.className).toContain("h-12");
    expect(header?.className).toContain("px-2");
    /* The wordmark is the navbar's job. */
    expect(screen.queryByRole("heading")).toBeNull();
  });

  it("hides the rail from its one control", async () => {
    render(<SidebarHeader collapsed={false} onToggle={onToggle} />);

    await userEvent.click(
      screen.getByRole("button", { name: /hide sidebar/i }),
    );

    expect(setMode).toHaveBeenCalledWith("hidden");
  });

  it("leaves the collapsed header alone: a logo button, no row", () => {
    const { container } = render(
      <SidebarHeader collapsed onToggle={onToggle} />,
    );

    expect(container.querySelector("header")).toBeNull();
    expect(container.querySelector("[data-testid='kanban-logo']")).toBeTruthy();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });
});
