// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The open rail's header, shaped like the column's header.
 *
 * One shape for both surfaces: a quiet title on the left, the surface's two
 * controls on the right — the softer one first (collapse to the icon strip, the
 * rail's analogue of "full width"), the decisive one last (hide, with the filled
 * background the panel's close button uses).
 *
 * The collapsed rail is a different header and is deliberately untouched: its
 * single logo button is the way back in.
 */

const setMode = vi.fn();
const onToggle = vi.fn();
const navigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();

  return { ...actual, useNavigate: () => navigate };
});

vi.mock("@/features/dashboard", () => ({
  useSidebarState: (
    selector: (state: { setMode: typeof setMode }) => unknown,
  ) => selector({ setMode }),
}));

vi.mock("@/components/Tooltips/ToolTip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/assets/KanbanIcon", () => ({
  default: () => <svg data-testid="kanban-logo" />,
}));

import SidebarHeader from "./SidebarHeader";

const renderOpen = () =>
  render(<SidebarHeader collapsed={false} onToggle={onToggle} />);

beforeEach(() => {
  setMode.mockClear();
  onToggle.mockClear();
  navigate.mockClear();
});

afterEach(cleanup);

describe("SidebarHeader — open rail", () => {
  it("has the column's shape: a title on the left, two controls on the right", () => {
    const { container } = renderOpen();

    const header = container.querySelector("header");
    expect(header).toBeTruthy();
    /* Same frame as the panel's header. */
    expect(header?.className).toContain("border-b");
    expect(header?.className).toContain("h-12");

    expect(screen.getByRole("heading", { name: /kanban/i })).toBeTruthy();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("collapses to the icon strip from the first control", async () => {
    renderOpen();

    await userEvent.click(
      screen.getByRole("button", { name: /collapse sidebar/i }),
    );

    expect(onToggle).toHaveBeenCalledTimes(1);
    /* Collapse, not hide: the rail keeps its strip and its stored width. */
    expect(setMode).not.toHaveBeenCalledWith("hidden");
  });

  it("hides the rail from the second control", async () => {
    renderOpen();

    await userEvent.click(
      screen.getByRole("button", { name: /hide sidebar/i }),
    );

    expect(setMode).toHaveBeenCalledWith("hidden");
  });

  it("no longer carries the wordmark — the navbar owns it", () => {
    const { container } = renderOpen();

    expect(container.querySelector("[data-testid='kanban-logo']")).toBeNull();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("leaves the collapsed header alone: one logo button, no title", () => {
    const { container } = render(
      <SidebarHeader collapsed onToggle={onToggle} />,
    );

    expect(container.querySelector("header")).toBeNull();
    expect(container.querySelector("[data-testid='kanban-logo']")).toBeTruthy();
    expect(screen.getAllByRole("button")).toHaveLength(1);
  });
});
