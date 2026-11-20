// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it, vi } from "vitest";

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

describe("Toaster — the auth variant", () => {
  it("paints the toast with the auth surface", async () => {
    render(<Toaster />);

    const el = await fire(() =>
      toastSuccess("Logged in", "Welcome back", { variant: "auth" }),
    );

    expect(el.style.getPropertyValue("--normal-bg")).toBe("var(--auth)");
    expect(el.style.getPropertyValue("--normal-text")).toBe("var(--auth-ink)");
  });

  it("still shows the message and description", async () => {
    render(<Toaster />);

    const el = await fire(() =>
      toastSuccess("Logged in", "Welcome back", { variant: "auth" }),
    );

    expect(el.textContent).toContain("Logged in");
    expect(el.textContent).toContain("Welcome back");
  });
});

describe("Toaster — props", () => {
  it("applies shape, size and tone variants", async () => {
    render(<Toaster size="lg" shape="pill" tone="brand" />);

    const el = await fire(() => toastSuccess("Branded"));

    expect(el.className).toContain("!rounded-full");
    expect(el.style.getPropertyValue("--normal-bg")).toBe("var(--brand)");

    const title = el.querySelector("[data-title]") as HTMLElement;

    expect(title.className).toContain("!text-[15px]");
  });

  it("honours width and height caps", async () => {
    render(<Toaster width={520} height={72} maxHeight="50vh" />);

    const el = await fire(() => toastSuccess("Sized"));

    expect(el.style.getPropertyValue("--width")).toBe("520px");
    expect(el.style.getPropertyValue("--toast-min-height")).toBe("72px");
    expect(el.style.getPropertyValue("--toast-max-height")).toBe("50vh");
    expect(el.className).toContain("!min-h-[var(--toast-min-height)]");
  });

  it("can hide the close button", async () => {
    render(<Toaster closeButton={false} />);

    const el = await fire(() => toastSuccess("No dismiss"));

    expect(el.querySelector("[data-close-button]")).toBeNull();
  });

  it("merges escape-hatch classNames onto the toast", async () => {
    render(<Toaster toastClassName="!bg-transparent" />);

    const el = await fire(() => toastSuccess("Glass"));

    expect(el.className).toContain("!bg-transparent");
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

describe("toast helper", () => {
  it("keeps the longer lifetime for errors", async () => {
    const spy = vi.spyOn(toast, "error");

    const { toastError } = await import("@/lib/toast");

    toastError(new Error("Boom"));

    expect(spy).toHaveBeenCalledWith("Boom", { duration: 6000 });
    spy.mockRestore();
  });
});
