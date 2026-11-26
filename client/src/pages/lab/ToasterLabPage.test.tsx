// @vitest-environment jsdom
import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { toast } from "sonner";

import ToasterLabPage from "./ToasterLabPage";

/**
 * The lab is a surface for looking at the component, so this pins the two things
 * a glance would catch: the panel mounts, and a control actually reaches the
 * stack.
 *
 * Sonner measures heights and listens for reduced-motion, neither of which jsdom
 * implements — stubbed, as in `Toaster.test.tsx`, so the real render path runs.
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

async function fireButton(name: string) {
  const button = screen.getByText(name).closest("button");

  await act(async () => {
    fireEvent.click(button as HTMLButtonElement);
  });

  await waitFor(() => {
    expect(document.querySelector("[data-sonner-toast]")).toBeTruthy();
  });

  return document.querySelector("[data-sonner-toast]") as HTMLElement;
}

describe("ToasterLabPage", () => {
  it("mounts the panel, the triggers and the stack", () => {
    render(<ToasterLabPage />);

    expect(screen.getByRole("heading", { name: "Toaster lab" })).toBeTruthy();
    expect(screen.getByLabelText("shape")).toBeTruthy();
    expect(screen.getByLabelText("position")).toBeTruthy();
    expect(screen.getByText("Success")).toBeTruthy();
    expect(screen.getByText("With undo")).toBeTruthy();
  });

  it("fires into its own stack", async () => {
    render(<ToasterLabPage />);

    const el = await fireButton("Success");

    expect(el.textContent).toContain("Board saved");
  });

  it("builds the stack from what the controls say", async () => {
    render(<ToasterLabPage />);

    fireEvent.change(screen.getByLabelText("width px"), {
      target: { value: "420" },
    });
    fireEvent.change(screen.getByLabelText("shape"), {
      target: { value: "pill" },
    });

    const el = await fireButton("Success");

    expect(el.style.getPropertyValue("--width")).toBe("420px");
    expect(el.className).toContain("!rounded-full");
  });

  it("fills the controls from a preset", async () => {
    render(<ToasterLabPage />);

    fireEvent.change(screen.getByLabelText("preset"), {
      target: { value: "compact" },
    });

    expect((screen.getByLabelText("width px") as HTMLInputElement).value).toBe(
      "320",
    );
  });
});
