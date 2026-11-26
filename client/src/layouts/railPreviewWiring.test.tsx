// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The rail preview's wiring, driven by real DOM events.
 *
 * One trigger and one owner:
 * - the navbar's rail icon starts a preview on hover;
 * - the overlay that appears under it holds the preview and ends it;
 * - leaving the icon without reaching the overlay also ends it (the "stuck
 *   preview" the review caught), after the grace period;
 * - the icon is deaf for a moment after a close, so a pointer already resting on
 *   it cannot reopen what it just closed.
 *
 * The window's left edge no longer triggers anything: that strip was covered by
 * the rail the moment it opened, so its own `mouseleave` closed the preview it
 * had just opened.
 */

vi.mock("@/features/dashboard", async () => {
  const { createStore } = await import("zustand/vanilla");
  const { useSyncExternalStore } = await import("react");

  const store = createStore<{
    mode: "open" | "collapsed" | "hidden" | "hover";
    setMode: (mode: "open" | "collapsed" | "hidden" | "hover") => void;
    setHovering: (hovering: boolean) => void;
    openFromPreview: () => void;
  }>()((set) => ({
    mode: "hidden",
    setMode: (mode) => set({ mode }),
    setHovering: () => {},
    openFromPreview: () => set({ mode: "open" }),
  }));

  return {
    RAIL: { COLLAPSED: 72, DEFAULT: 288, MIN: 200, MAX: 420 },
    useSidebarState: Object.assign(
      (selector: (state: { mode: string }) => unknown) =>
        useSyncExternalStore(store.subscribe, () => selector(store.getState())),
      { getState: store.getState, subscribe: store.subscribe },
    ),
    __railStore: store,
  };
});

import * as dashboard from "@/features/dashboard";
import { cancelClose, scheduleEnd, startPreview } from "./railPreview";

const railStore = (
  dashboard as unknown as {
    __railStore: {
      getState: () => { mode: string };
      setState: (partial: { mode: string }) => void;
    };
  }
).__railStore;
const useSidebarState = dashboard.useSidebarState as unknown as (
  selector: (state: { mode: string }) => unknown,
) => unknown;

const mode = () => railStore.getState().mode;

/** The shell's preview wiring, reduced to the elements that matter. */
function PreviewHarness() {
  const previewing = useSidebarState((state) => state.mode) === "hover";

  return (
    <div className="flex h-96 w-96 flex-col">
      <button
        type="button"
        data-testid="trigger"
        onMouseEnter={startPreview}
        onMouseLeave={scheduleEnd}
      >
        rail
      </button>

      <div className="relative flex-1">
        {previewing && (
          <div
            data-testid="overlay"
            onMouseEnter={cancelClose}
            onMouseMove={cancelClose}
            onMouseLeave={scheduleEnd}
            className="absolute inset-y-0 left-0 z-40 w-72"
          />
        )}
      </div>
    </div>
  );
}

const trigger = () => screen.queryByTestId("trigger");
const overlay = () => screen.queryByTestId("overlay");

beforeEach(() => {
  vi.useFakeTimers();
  railStore.setState({ mode: "hidden" });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("the rail preview's wiring", () => {
  it("opens from the navbar icon and keeps the icon on screen", () => {
    render(<PreviewHarness />);

    fireEvent.mouseEnter(trigger()!);

    expect(mode()).toBe("hover");
    expect(overlay()).toBeTruthy();
    /* The icon lives in the navbar, above the group: it is not covered by the
       overlay, so it never receives a `mouseleave` it did not cause. */
    expect(trigger()).toBeTruthy();
  });

  it("holds while the pointer is inside the overlay", () => {
    render(<PreviewHarness />);
    fireEvent.mouseEnter(trigger()!);
    fireEvent.mouseLeave(trigger()!);

    fireEvent.mouseEnter(overlay()!);
    fireEvent.mouseMove(overlay()!);
    act(() => vi.advanceTimersByTime(1000));

    expect(mode()).toBe("hover");
    expect(overlay()).toBeTruthy();
  });

  it("closes on the overlay's leave, after the grace period", () => {
    render(<PreviewHarness />);
    fireEvent.mouseEnter(trigger()!);

    fireEvent.mouseLeave(overlay()!);

    act(() => vi.advanceTimersByTime(100));
    expect(mode()).toBe("hover");

    act(() => vi.advanceTimersByTime(100));
    expect(mode()).toBe("hidden");
    expect(overlay()).toBeNull();
  });

  it("closes when the pointer leaves the icon and never reaches the overlay", () => {
    render(<PreviewHarness />);
    fireEvent.mouseEnter(trigger()!);

    fireEvent.mouseLeave(trigger()!);
    act(() => vi.advanceTimersByTime(200));

    expect(mode()).toBe("hidden");
  });

  it("does not reopen from the icon until the cooldown is over", () => {
    render(<PreviewHarness />);
    fireEvent.mouseEnter(trigger()!);
    fireEvent.mouseLeave(trigger()!);
    act(() => vi.advanceTimersByTime(200));
    expect(mode()).toBe("hidden");

    /* The pointer is still on the icon. */
    fireEvent.mouseEnter(trigger()!);
    expect(mode()).toBe("hidden");

    act(() => vi.advanceTimersByTime(400));
    fireEvent.mouseEnter(trigger()!);
    expect(mode()).toBe("hover");
  });
});
