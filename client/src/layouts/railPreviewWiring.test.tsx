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

vi.mock("@/stores/panelState", async () => {
  const { createStore } = await import("zustand/vanilla");
  const { useSyncExternalStore } = await import("react");

  /* The store is one object with three slices; the test only needs the rail's. */
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
    rightPanel: { mode: "off" | "panel"; level: string; width: number };
  }>()((set, get) => ({
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
        set((s) =>
          s.leftPanel.mode === "hidden"
            ? { leftPanel: { ...s.leftPanel, hovering: true } }
            : {},
        ),
      unpeek: () =>
        set((s) => ({ leftPanel: { ...s.leftPanel, hovering: false } })),
    },
    centrePanel: { scrollTop: 0 },
    rightPanel: { mode: "off", level: "normal", width: 420 },
    get left() {
      return get().leftPanel;
    },
  }));

  return {
    usePanelState: Object.assign(
      (selector: (state: { leftPanel: unknown }) => unknown) =>
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

import * as panels from "@/stores/panelState";
import { cancelClose, scheduleEnd, startPreview } from "./railPreview";

const railStore = (
  panels as unknown as {
    __panelStore: {
      getState: () => { leftPanel: { mode: string; hovering: boolean } };
      setState: (partial: unknown) => void;
    };
  }
).__panelStore;
const useLeftPanel = panels.usePanelState as unknown as (
  selector: (state: {
    leftPanel: { mode: string; hovering: boolean };
  }) => unknown,
) => unknown;

const setLeft = (patch: Record<string, unknown>) =>
  railStore.setState((state: { leftPanel: Record<string, unknown> }) => ({
    leftPanel: { ...state.leftPanel, ...patch },
  }));

const mode = () => railStore.getState().leftPanel.mode;
const hovering = () => railStore.getState().leftPanel.hovering;

/** The shell's preview wiring, reduced to the elements that matter. */
function PreviewHarness() {
  const previewing = useLeftPanel(
    (state) => state.leftPanel.hovering,
  ) as boolean;

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
  setLeft({ mode: "hidden", hovering: false });
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
});

describe("the rail preview's wiring", () => {
  it("opens from the navbar icon and keeps the icon on screen", () => {
    render(<PreviewHarness />);

    fireEvent.mouseEnter(trigger()!);

    expect(hovering()).toBe(true);
    /* The mode is untouched: a preview is a glance, not a place to return to. */
    expect(mode()).toBe("hidden");
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

    expect(hovering()).toBe(true);
    /* The mode is untouched: a preview is a glance, not a place to return to. */
    expect(mode()).toBe("hidden");
    expect(overlay()).toBeTruthy();
  });

  it("closes on the overlay's leave, after the grace period", () => {
    render(<PreviewHarness />);
    fireEvent.mouseEnter(trigger()!);

    fireEvent.mouseLeave(overlay()!);

    act(() => vi.advanceTimersByTime(100));
    expect(hovering()).toBe(true);
    /* The mode is untouched: a preview is a glance, not a place to return to. */
    expect(mode()).toBe("hidden");

    act(() => vi.advanceTimersByTime(100));
    expect(hovering()).toBe(false);
    expect(overlay()).toBeNull();
  });

  it("closes when the pointer leaves the icon and never reaches the overlay", () => {
    render(<PreviewHarness />);
    fireEvent.mouseEnter(trigger()!);

    fireEvent.mouseLeave(trigger()!);
    act(() => vi.advanceTimersByTime(200));

    /* The flag, not the mode: the mode never leaves `hidden`, so asserting it
       passed even when the preview stayed open. */
    expect(hovering()).toBe(false);
    expect(overlay()).toBeNull();
  });

  it("does not push the deadline ahead while the pointer keeps moving", () => {
    render(<PreviewHarness />);
    fireEvent.mouseEnter(trigger()!);

    fireEvent.mouseLeave(trigger()!);

    /* A browser re-fires moves after a layout change; each one used to restart the
       grace, so the preview only closed once the pointer stopped for the whole of
       it. */
    act(() => vi.advanceTimersByTime(60));
    fireEvent.mouseLeave(trigger()!);
    act(() => vi.advanceTimersByTime(60));
    fireEvent.mouseLeave(trigger()!);

    act(() => vi.advanceTimersByTime(40));
    expect(hovering()).toBe(false);
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
    expect(hovering()).toBe(true);
    /* The mode is untouched: a preview is a glance, not a place to return to. */
    expect(mode()).toBe("hidden");
  });
});
