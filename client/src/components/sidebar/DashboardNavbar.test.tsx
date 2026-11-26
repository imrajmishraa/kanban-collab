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

let mode: "open" | "collapsed" | "hidden" | "hover" = "open";

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();

  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: "/boards" }),
  };
});

/*
 * The feature barrel drags in the whole dashboard; the navbar needs five names.
 *
 * `useSidebarState` is a real store, not a stub: the embedded navbar starts the
 * preview through `layouts/railPreview.ts`, which reads and writes the store
 * (`getState`), so a plain selector function would throw on hover.
 */
vi.mock("@/features/dashboard", async () => {
  const { createStore } = await import("zustand/vanilla");
  const { useSyncExternalStore } = await import("react");

  const store = createStore<{
    mode: "open" | "collapsed" | "hidden" | "hover";
    hovering: boolean;
    setMode: (mode: "open" | "collapsed" | "hidden" | "hover") => void;
    setHovering: (hovering: boolean) => void;
    openFromPreview: () => void;
    peek: () => void;
    unpeek: () => void;
  }>()((set) => ({
    mode: "open",
    hovering: false,
    setMode: (mode) => set({ mode }),
    setHovering: (hovering) => set({ hovering }),
    openFromPreview: () => set({ mode: "open", hovering: false }),
    peek: () => set({ mode: "hover", hovering: true }),
    unpeek: () => set({ mode: "hidden", hovering: false }),
  }));

  return {
    useSidebarState: Object.assign(
      (selector: (state: { mode: string }) => unknown) =>
        useSyncExternalStore(store.subscribe, () => selector(store.getState())),
      { getState: store.getState, subscribe: store.subscribe },
    ),
    __railStore: store,
    WorkspaceSelector: () => null,
    NavbarSearchIcon: () => null,
    NotificationsButton: () => null,
    NotificationsPanel: () => null,
  };
});

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

import * as dashboard from "@/features/dashboard";

import DashboardNavbar from "./DashboardNavbar";

const railStore = (
  dashboard as unknown as {
    __railStore: {
      getState: () => { mode: string };
      setState: (partial: { mode: string }) => void;
    };
  }
).__railStore;

afterEach(cleanup);

beforeEach(() => {
  toggleRail.mockClear();
  railStore.setState({ mode: "open" });
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
    railStore.setState({ mode: "hidden" });
    render(<DashboardNavbar embedded />);

    await userEvent.hover(screen.getByRole("button", { name: /sidebar/i }));

    /* The icon starts a preview through `railPreview.ts`: the mode becomes
       `hover`, the rail stays off the page, and nothing is toggled. */
    expect(railStore.getState().mode).toBe("hover");
    expect(toggleRail).not.toHaveBeenCalled();
  });
});
