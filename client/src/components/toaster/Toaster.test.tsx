// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { Toaster } from "./Toaster";
import { toastSuccess } from "@/lib/toast";
import { toast } from "sonner";

/**
 * Sonner measures toast heights and listens for reduced-motion, neither of which
 * jsdom implements. Both are stubbed rather than mocked out of the component, so
 * the real render path still runs.
 */
beforeAll(() => {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  } as unknown as typeof ResizeObserver;

  if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
      writable: true,
      value: (query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: () => {},
        removeListener: () => {},
        addEventListener: () => {},
        removeEventListener: () => {},
        dispatchEvent: () => false,
      }),
    });
  }
});

afterEach(() => {
  act(() => {
    toast.dismiss();
  });
  cleanup();
});

/** Fire a toast and wait for sonner to mount it. */
async function fire(fn: () => unknown) {
  await act(async () => {
    fn();
  });

  await waitFor(() => {
    expect(document.querySelector("[data-sonner-toast]")).toBeTruthy();
  });

  return document.querySelector("[data-sonner-toast]") as HTMLElement;
}

describe("Toaster — rendering", () => {
  it("renders a toast with the message and the close button", async () => {
    render(<Toaster />);

    const el = await fire(() => toastSuccess("Copied to clipboard"));

    expect(el.textContent).toContain("Copied to clipboard");

    const close = el.querySelector("[data-close-button]") as HTMLElement;

    expect(close).toBeTruthy();
    expect(close.getAttribute("aria-label")).toBe("Dismiss notification");
  });

  it("keeps the close button in the flow, at the end, and square", async () => {
    render(<Toaster />);

    const el = await fire(() => toastSuccess("Hello"));
    const close = el.querySelector("[data-close-button]") as HTMLElement;

    /* The four utilities that make it a centred, in-flow, right-aligned button.
       `order-last` matters because sonner renders it first in the DOM. */
    expect(close.className).toContain("!static");
    expect(close.className).toContain("!order-last");
    expect(close.className).toContain("!transform-none");
    expect(close.className).toContain("!rounded-md");
  });

  it("uses the default surface for a plain success", async () => {
    render(<Toaster />);

    const el = await fire(() => toastSuccess("Saved"));

    // The gradient panel, not a flat tone.
    expect(el.style.getPropertyValue("--normal-bg")).toContain(
      "linear-gradient",
    );
  });
});

describe("Toaster — the auth tone", () => {
  it("paints the toast with the auth surface", async () => {
    render(<Toaster />);

    const el = await fire(() =>
      toastSuccess("Logged in", "Welcome back", { tone: "auth" }),
    );

    expect(el.style.getPropertyValue("--normal-bg")).toBe("var(--auth)");
    expect(el.style.getPropertyValue("--normal-text")).toBe("var(--auth-ink)");
  });

  it("still shows the message and description", async () => {
    render(<Toaster />);

    const el = await fire(() =>
      toastSuccess("Logged in", "Welcome back", { tone: "auth" }),
    );

    expect(el.textContent).toContain("Logged in");
    expect(el.textContent).toContain("Welcome back");
  });
});

describe("Toaster — the attribute groups", () => {
  it("applies shape, size and tone variants", async () => {
    render(
      <Toaster appearance={{ size: "lg", shape: "pill", tone: "brand" }} />,
    );

    const el = await fire(() => toastSuccess("Branded"));

    expect(el.className).toContain("!rounded-full");
    expect(el.style.getPropertyValue("--normal-bg")).toBe("var(--brand)");

    const title = el.querySelector("[data-title]") as HTMLElement;

    expect(title.className).toContain("!text-[15px]");
  });

  it("honours width and height caps", async () => {
    render(<Toaster layout={{ width: 520, height: 72, maxHeight: "50vh" }} />);

    const el = await fire(() => toastSuccess("Sized"));

    expect(el.style.getPropertyValue("--width")).toBe("520px");
    expect(el.style.getPropertyValue("--toast-min-height")).toBe("72px");
    expect(el.style.getPropertyValue("--toast-max-height")).toBe("50vh");
    expect(el.className).toContain("!min-h-[var(--toast-min-height)]");
  });

  it("can hide the close button", async () => {
    render(<Toaster behaviour={{ closeButton: false }} />);

    const el = await fire(() => toastSuccess("No dismiss"));

    expect(el.querySelector("[data-close-button]")).toBeNull();
  });

  it("merges escape-hatch classNames onto the toast", async () => {
    render(<Toaster classNames={{ toast: "!bg-transparent" }} />);

    const el = await fire(() => toastSuccess("Glass"));

    expect(el.className).toContain("!bg-transparent");
  });

  it("takes a whole configuration from one preset", async () => {
    render(<Toaster preset="compact" />);

    const el = await fire(() => toastSuccess("Compact"));

    expect(el.style.getPropertyValue("--width")).toBe("320px");
    expect(el.style.getPropertyValue("--toast-mobile-width")).toBe("340px");
  });

  it("lets the caller override what the preset filled", async () => {
    render(<Toaster preset="compact" layout={{ width: 400 }} />);

    const el = await fire(() => toastSuccess("Wider"));

    expect(el.style.getPropertyValue("--width")).toBe("400px");
  });

  it("removes a status icon when it is set to null", async () => {
    render(<Toaster appearance={{ icons: { success: null } }} />);

    const el = await fire(() => toastSuccess("No icon"));

    expect(el.querySelector("[data-icon]")).toBeNull();
  });

  it("takes a replacement glyph", async () => {
    render(
      <Toaster
        appearance={{ icons: { success: <span data-testid="mine" /> } }}
      />,
    );

    const el = await fire(() => toastSuccess("Mine"));

    expect(el.querySelector('[data-testid="mine"]')).toBeTruthy();
  });

  it("renames the region for a second stack", async () => {
    render(<Toaster a11y={{ containerLabel: "Board alerts" }} />);

    await fire(() => toastSuccess("Renamed"));

    /* sonner appends the hotkey hint to the stack label, so this is a prefix
       match: the label is "Board alerts Alt+T". */
    expect(document.querySelector('[aria-label^="Board alerts"]')).toBeTruthy();
  });
});

describe("Toaster — dismissal", () => {
  it("removes the toast when the close button is clicked", async () => {
    render(<Toaster />);

    const el = await fire(() => toastSuccess("Dismiss me"));
    const close = el.querySelector("[data-close-button]") as HTMLElement;

    await act(async () => {
      close.click();
    });

    await waitFor(() => {
      expect(screen.queryByText("Dismiss me")).toBeNull();
    });
  });
});
