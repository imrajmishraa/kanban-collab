// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The rail's own header, as the rail actually is.
 *
 * Open, it is a bare `h-12` row with `px-2`. Two shapes, one control:
 *
 * - rail hidden → the way back in ("Expand sidebar"), which also starts the
 *   hover preview;
 * - rail on screen → "Hide sidebar".
 *
 * The workspace pill beside it belongs to the preview: it is what the rail shows
 * while the pointer is inside it.
 *
 * Collapsed, it is a different header: one logo button, the way back in.
 */

const setMode = vi.fn();
const onToggle = vi.fn();
const navigate = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();

  return { ...actual, useNavigate: () => navigate };
});

vi.mock("@/stores/panelState", () => ({
  usePanelState: (
    selector: (state: {
      leftPanel: {
        mode: string;
        hovering: boolean;
        setMode: typeof setMode;
      };
    }) => unknown,
  ) => selector({ leftPanel: { mode: "expanded", hovering: false, setMode } }),
}));

vi.mock("@/features/dashboard", () => ({
  /* The rail's "keep open" hint, and the pill the preview carries. */
  NavbarSearchIcon: () => null,
  WorkspaceSelector: () => null,
}));

vi.mock("@/stores/activeWorkspace", () => ({
  useActiveWorkspace: () => ({
    activeWorkspaceId: null,
    activeWorkspaceName: null,
    setActiveWorkspace: vi.fn(),
    clearActiveWorkspace: vi.fn(),
  }),
}));

vi.mock("@/components/Tooltips/ToolTip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/assets/KanbanIcon", () => ({
  default: () => <svg data-testid="kanban-logo" />,
}));

vi.mock("@/layouts/railPreview", () => ({
  startPreview: vi.fn(),
}));

import SidebarHeader from "./SidebarHeader";

beforeEach(() => {
  setMode.mockClear();
  onToggle.mockClear();
  navigate.mockClear();
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
