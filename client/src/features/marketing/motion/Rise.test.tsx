// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Rise } from "./Rise";

afterEach(cleanup);

/**
 * The rule this protects: `DESIGN.md` → *Motion principles* #3 and #4 — the
 * parent owns the clock, the item owns the path. A `Rise` outside a `Stagger`
 * must still render its content, because an entrance that hides its content when
 * the parent is missing is a blank band on the page.
 */
describe("Rise", () => {
  it("renders its content even with no Stagger above it", () => {
    render(<Rise className="plan">Pro</Rise>);

    expect(screen.getByText("Pro")).toBeTruthy();
  });

  it("keeps the class it was given", () => {
    render(<Rise className="plan">Pro</Rise>);

    expect(screen.getByText("Pro").className).toContain("plan");
  });

  it("takes a position in its group without changing what it renders", () => {
    render(
      <Rise index={2} count={4} radius={10}>
        Pro
      </Rise>,
    );

    expect(screen.getByText("Pro").textContent).toBe("Pro");
  });
});
