// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The navbar's rail button, as the navbar actually is.
 *
 * It lives in the hidden state only: with the rail on screen the rail's own
 * header carries the controls, so a second copy in the bar would be the same
 * control twice. What it must do:
 *
 * - appear while the rail is hidden, and only then;
 * - open the rail on click (a choice);
 * - preview it on hover (a glance) — through `layouts/railPreview.ts`, so the
 *   pointer and the click cannot disagree about what the rail is doing.
 */

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>();

  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ pathname: "/boards" }),
  };
});

/*
 * A real store: the hover path goes through `railPreview.ts`, which reads and
 * writes the sidebar state (`getState`), so a plain selector stub would throw.
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
    mode: "hidden",
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

const toggleRail = vi.fn();

vi.mock("@/layouts/stores/layoutShellStore", () => ({
  useLayoutShellStore: { getState: () => ({ toggleRail }) },
}));

/*
 * jsdom has no matchMedia and `ToolTip` reads it at module scope. `vi.hoisted`
 * runs before the imports are evaluated — a plain top-level statement would run
 * after them, because ES imports are hoisted.
 */
vi.hoisted(() => {
  if (typeof window === "undefined") return;
  /* jsdom leaves it undefined; a real browser has it. */
  if ("matchMedia" in window && typeof window.matchMedia === "function") return;

  Object.defineProperty(window, "matchMedia", {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: () => {},
      removeEventListener: () => {},
      addListener: () => {},
      removeListener: () => {},
      dispatchEvent: () => false,
    }),
  });
});

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

const railButton = () =>
  screen.queryByRole("button", { name: /expand sidebar/i });

beforeEach(() => {
  toggleRail.mockClear();
  railStore.setState({ mode: "hidden" });
});

afterEach(cleanup);

describe("DashboardNavbar — the rail button", () => {
  it("is on screen while the rail is hidden", () => {
    render(<DashboardNavbar embedded />);

    expect(railButton()).toBeTruthy();
  });

  it("is not on screen while the rail is open", () => {
    railStore.setState({ mode: "open" });
    render(<DashboardNavbar embedded />);

    /* The rail's own header carries the controls then. */
    expect(railButton()).toBeNull();
  });

  it("stays on screen while its own preview is showing", () => {
    railStore.setState({ mode: "hover" });
    render(<DashboardNavbar embedded />);

    /* A control that unmounts under the pointer cannot be clicked. */
    expect(railButton()).toBeTruthy();
  });

  it("is not on screen while the rail is collapsed", () => {
    railStore.setState({ mode: "collapsed" });
    render(<DashboardNavbar embedded />);

    expect(railButton()).toBeNull();
  });

  it("opens the rail on click", async () => {
    render(<DashboardNavbar embedded />);

    await userEvent.click(railButton()!);

    expect(railStore.getState().mode).toBe("open");
  });

  it("previews the rail on hover, without opening it", async () => {
    render(<DashboardNavbar embedded />);

    await userEvent.hover(railButton()!);

    expect(railStore.getState().mode).toBe("hover");
  });
});
