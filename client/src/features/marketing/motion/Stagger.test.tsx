// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, beforeAll, describe, expect, it } from "vitest";

import { Stagger } from "./Stagger";

/**
 * `whileInView` asks for an IntersectionObserver, which jsdom does not
 * implement. Stubbed rather than mocked out of the component, so the real render
 * path still runs (`Toaster.test.tsx` does the same for ResizeObserver).
 */
beforeAll(() => {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
      return [];
    }
    root = null;
    rootMargin = "";
    thresholds = [];
  } as unknown as typeof IntersectionObserver;
});

afterEach(cleanup);

/**
 * The rule this protects: `DESIGN.md` → *Motion principles* #3 — one band
 * arrives as one gesture. The container carries no motion of its own, so with
 * the observer never firing, its children are still in the document.
 */
describe("Stagger", () => {
  it("puts its children in the document before anything is scrolled to", () => {
    render(
      <Stagger>
        <p>first</p>
        <p>second</p>
      </Stagger>,
    );

    expect(screen.getByText("first")).toBeTruthy();
    expect(screen.getByText("second")).toBeTruthy();
  });

  it("keeps the class it was given", () => {
    render(
      <Stagger className="grid gap-4">
        <p>first</p>
      </Stagger>,
    );

    expect(screen.getByText("first").parentElement!.className).toContain(
      "grid",
    );
  });
});
