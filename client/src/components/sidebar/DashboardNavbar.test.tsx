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
vi.mock("@/stores/panelState", async () => {
  const { createStore } = await import("zustand/vanilla");
  const { useSyncExternalStore } = await import("react");

  /* One store, three slices; the bar reads the rail's mode and the column's mode. */
  const store = createStore<{
    leftPanel: {
      mode: "collapsed" | "expanded" | "hidden";
      hovering: boolean;
      width: number;
      setMode: (mode: "collapsed" | "expanded" | "hidden") => void;
      setHovering: (hovering: boolean) => void;
      openFromPreview: () => void;
      peek: () => void;
      unpeek: () => void;
    };
    centrePanel: { scrollTop: number };
    rightPanel: {
      mode: "off" | "panel";
      level: string;
      width: number;
      toggle: () => void;
    };
  }>()((set) => ({
    leftPanel: {
      mode: "hidden",
      hovering: false,
      width: 288,
      setMode: (mode) => set((s) => ({ leftPanel: { ...s.leftPanel, mode } })),
      setHovering: (hovering) =>
        set((s) => ({ leftPanel: { ...s.leftPanel, hovering } })),
      openFromPreview: () =>
        set((s) => ({
          leftPanel: { ...s.leftPanel, mode: "expanded", hovering: false },
        })),
      peek: () =>
        set((s) => ({ leftPanel: { ...s.leftPanel, hovering: true } })),
      unpeek: () =>
        set((s) => ({
          leftPanel: { ...s.leftPanel, mode: "hidden", hovering: false },
        })),
    },
    centrePanel: { scrollTop: 0 },
    rightPanel: { mode: "off", level: "normal", width: 420, toggle: vi.fn() },
  }));

  return {
    usePanelState: Object.assign(
      (selector: (state: unknown) => unknown) =>
        useSyncExternalStore(store.subscribe, () => selector(store.getState())),
      {
        getState: store.getState,
        subscribe: store.subscribe,
        setState: store.setState,
      },
    ),
    __panelStore: store,
  };
});

vi.mock("@/features/dashboard", () => ({
  useNotifications: () => ({ data: { unreadCount: 0 } }),
  WorkspaceSelector: () => null,
  NavbarSearchIcon: () => null,
  NotificationsButton: () => null,
  NotificationsPanel: () => null,
}));

vi.mock("@/stores/activeWorkspace", () => ({
  useActiveWorkspace: () => ({
    activeWorkspaceId: null,
    activeWorkspaceName: null,
    setActiveWorkspace: vi.fn(),
    clearActiveWorkspace: vi.fn(),
  }),
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

import * as panels from "@/stores/panelState";

import DashboardNavbar from "./DashboardNavbar";

const railStore = (
  panels as unknown as {
    __panelStore: {
      getState: () => { leftPanel: { mode: string; hovering: boolean } };
      setState: (partial: unknown) => void;
    };
  }
).__panelStore;

/* A slice patch, not a slice replacement: replacing `leftPanel` would drop its
   actions along with its values. */
const setLeft = (patch: Record<string, unknown>) =>
  railStore.setState((state: { leftPanel: Record<string, unknown> }) => ({
    leftPanel: { ...state.leftPanel, ...patch },
  }));
const setRight = (patch: Record<string, unknown>) =>
  railStore.setState((state: { rightPanel: Record<string, unknown> }) => ({
    rightPanel: { ...state.rightPanel, ...patch },
  }));

const railButton = () =>
  screen.queryByRole("button", { name: /expand sidebar/i });

beforeEach(() => {
  setRight({ level: "normal" });
  toggleRail.mockClear();
  setLeft({ mode: "hidden", hovering: false });
});

afterEach(cleanup);

describe("DashboardNavbar — the rail button", () => {
  it("is on screen while the rail is hidden", () => {
    render(<DashboardNavbar embedded />);

    expect(railButton()).toBeTruthy();
  });

  it("is not on screen while the rail is expanded", () => {
    setLeft({ mode: "expanded" });
    render(<DashboardNavbar embedded />);

    /* The rail's own header carries the controls then. */
    expect(railButton()).toBeNull();
  });

  it("stays on screen while its own preview is showing", () => {
    setLeft({ mode: "hidden", hovering: true });
    render(<DashboardNavbar embedded />);

    /* A control that unmounts under the pointer cannot be clicked. */
    expect(railButton()).toBeTruthy();
  });

  it("is not on screen at full width — the board has no column to sit in", () => {
    setRight({ level: "remaining" });
    render(<DashboardNavbar embedded />);

    expect(railButton()).toBeNull();
    expect(screen.queryByRole("navigation")).toBeNull();
  });

  it("is not on screen while the rail is collapsed", () => {
    setLeft({ mode: "collapsed" });
    render(<DashboardNavbar embedded />);

    expect(railButton()).toBeNull();
  });

  it("opens the rail on click", async () => {
    render(<DashboardNavbar embedded />);

    await userEvent.click(railButton()!);

    expect(railStore.getState().leftPanel.mode).toBe("expanded");
  });

  it("previews the rail on hover, without opening it", async () => {
    render(<DashboardNavbar embedded />);

    await userEvent.hover(railButton()!);

    /* The flag goes up; the mode does not move. */
    expect(railStore.getState().leftPanel.hovering).toBe(true);
    expect(railStore.getState().leftPanel.mode).toBe("hidden");
  });
});
