// @vitest-environment jsdom
import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

/*
 * The rail preview's timing rules.
 *
 * Two things went wrong in the shell and both are timing, so both are pinned here:
 *
 * 1. The overlay closes, the pointer is back over the edge strip that opened it,
 *    the strip fires `mouseenter` again — open, close, open, forever. A short
 *    cooldown after a close is what stops the bounce.
 * 2. A glance can start from `hidden` (the window's edge, the navbar logo) or from
 *    `collapsed` (the icon strip), and each has to go back where it came from.
 */

const setMode = vi.fn();
const setHovering = vi.fn();

let mode: "open" | "collapsed" | "hidden" | "hover" = "hidden";

vi.mock("@/features/dashboard", () => ({
  useSidebarState: {
    getState: () => ({
      mode,
      setMode: (next: typeof mode) => {
        mode = next;
        setMode(next);
      },
      setHovering,
    }),
  },
}));

import { useRailPreview } from "./useRailPreview";

beforeEach(() => {
  vi.useFakeTimers();
  mode = "hidden";
  setMode.mockClear();
  setHovering.mockClear();
});

afterEach(() => {
  vi.useRealTimers();
});

describe("useRailPreview", () => {
  it("previews from hidden and returns to hidden", () => {
    const { result } = renderHook(() => useRailPreview());

    act(() => result.current.startPreview());
    expect(mode).toBe("hover");
    expect(setHovering).toHaveBeenCalledWith(true);

    act(() => result.current.scheduleEnd());
    act(() => vi.advanceTimersByTime(200));

    expect(mode).toBe("hidden");
    expect(setHovering).toHaveBeenLastCalledWith(false);
  });

  it("returns to the strip it came from, not to hidden", () => {
    mode = "collapsed";
    const { result } = renderHook(() => useRailPreview());

    act(() => result.current.startPreview());
    expect(mode).toBe("hover");

    act(() => result.current.scheduleEnd());
    act(() => vi.advanceTimersByTime(200));

    expect(mode).toBe("collapsed");
  });

  it("does not reopen during the cooldown (the bounce)", () => {
    const { result } = renderHook(() => useRailPreview());

    act(() => result.current.startPreview());
    act(() => result.current.scheduleEnd());
    act(() => vi.advanceTimersByTime(200));
    expect(mode).toBe("hidden");

    /* The pointer is still over the edge strip that opened it. */
    act(() => result.current.startPreview());
    expect(mode).toBe("hidden");

    /* Once the cooldown is over, the edge works again. */
    act(() => vi.advanceTimersByTime(400));
    act(() => result.current.startPreview());
    expect(mode).toBe("hover");
  });

  it("cancels a pending close when the pointer reaches the overlay", () => {
    const { result } = renderHook(() => useRailPreview());

    act(() => result.current.startPreview());
    act(() => result.current.scheduleEnd());
    act(() => result.current.cancelClose());
    act(() => vi.advanceTimersByTime(400));

    expect(mode).toBe("hover");
  });

  it("ignores a start while the rail is open or already previewing", () => {
    mode = "open";
    const { result } = renderHook(() => useRailPreview());

    act(() => result.current.startPreview());
    expect(setMode).not.toHaveBeenCalled();

    mode = "hover";
    act(() => result.current.startPreview());
    expect(setMode).not.toHaveBeenCalled();
  });
});
