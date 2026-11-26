// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The navbar's rail button.
 *
 * The rule: it is on screen in every rail mode, and a click toggles the rail —
 * from any state the reader can be in, one click puts it away; from hidden, one
 * click brings it back. The command is the shell's own `toggleRail`, so this file
 * only has to prove the button is there and wired, not re-test the model.
 */

const toggleRail = vi.fn();
const peek = vi.fn();
const unpeek = vi.fn();
const toggleHidden = vi.fn();
const openFromPreview = vi.fn();

let mode: "open" | "collapsed" | "hidden" | "hover" = "open";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();

  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: "/boards" }),
  };
});

/* The feature barrel drags in the whole dashboard; the navbar needs five names. */
vi.mock("@/features/dashboard", () => ({
  useSidebarState: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ mode, peek, unpeek, toggleHidden, openFromPreview }),
  WorkspaceSelector: () => null,
  NavbarSearchIcon: () => null,
  NotificationsButton: () => null,
  NotificationsPanel: () => null,
}));

vi.mock("@/features/dashboard/hooks/useNotifications", () => ({
  useNotifications: () => ({ data: { unreadCount: 0 } }),
}));

vi.mock("@/stores/activeWorkspace", () => ({
  useActiveWorkspace: () => ({
    activeWorkspaceId: null,
    activeWorkspaceName: null,
    setActiveWorkspace: vi.fn(),
    clearActiveWorkspace: vi.fn(),
  }),
}));

vi.mock("@/stores/rightPanel", () => ({
  useRightPanel: (selector: (state: Record<string, unknown>) => unknown) =>
    selector({ mode: "off", toggle: vi.fn() }),
}));

vi.mock("@/layouts/stores/layoutShellStore", () => ({
  useLayoutShellStore: { getState: () => ({ toggleRail }) },
}));

vi.mock("@/components/Tooltips/ToolTip", () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => children,
}));

vi.mock("@/assets/KanbanIcon", () => ({
  default: () => <svg data-testid="kanban-logo" />,
}));

/* jsdom ships neither observer; the navbar and the shell both use them. */
class Observer {
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() {
    return [];
  }
}

globalThis.IntersectionObserver =
  Observer as unknown as typeof IntersectionObserver;
globalThis.ResizeObserver = Observer as unknown as typeof ResizeObserver;

import DashboardNavbar from "./DashboardNavbar";

afterEach(cleanup);

beforeEach(() => {
  toggleRail.mockClear();
  peek.mockClear();
  unpeek.mockClear();
});

describe("DashboardNavbar — the rail button", () => {
  for (const state of ["open", "collapsed", "hidden", "hover"] as const) {
    it(`is on screen while the rail is ${state}`, () => {
      mode = state;
      render(<DashboardNavbar embedded />);

      expect(screen.getByRole("button", { name: /sidebar/i })).toBeTruthy();
    });
  }

  it("toggles the rail on click, from any state", async () => {
    for (const state of ["open", "collapsed", "hidden"] as const) {
      mode = state;
      const { unmount } = render(<DashboardNavbar embedded />);

      await userEvent.click(screen.getByRole("button", { name: /sidebar/i }));

      unmount();
      cleanup();
    }

    expect(toggleRail).toHaveBeenCalledTimes(3);
  });

  it("previews the rail on hover, without opening it", async () => {
    mode = "hidden";
    render(<DashboardNavbar embedded />);

    await userEvent.hover(screen.getByRole("button", { name: /sidebar/i }));

    expect(peek).toHaveBeenCalled();
    expect(toggleRail).not.toHaveBeenCalled();
  });
});
