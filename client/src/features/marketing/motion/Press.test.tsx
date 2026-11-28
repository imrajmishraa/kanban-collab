// @vitest-environment jsdom
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import { Press } from "./Press";

afterEach(cleanup);

/**
 * The rule this protects: `docs/component-creation.md` §3 — a wrapper composes,
 * it does not restyle. `Press` is the one component every marketing call to
 * action passes through, so a style that leaks from it would move every button
 * on the page at once.
 */
describe("Press", () => {
  it("adds no layout of its own — inline-flex and nothing else", () => {
    render(
      <Press className="m-btn">
        <button type="button">Save</button>
      </Press>,
    );

    const wrapper = screen.getByRole("button").parentElement;

    expect(wrapper).not.toBeNull();
    expect(wrapper!.className).toContain("inline-flex");
    expect(wrapper!.className).toContain("m-btn");
    // The old version set display through an inline style, which beat the
    // class and could not be overridden by the caller.
    expect(wrapper!.getAttribute("style")).toBeNull();
  });

  it("renders the control it wraps, unchanged", () => {
    render(
      <Press>
        <button type="button">Save</button>
      </Press>,
    );

    expect(screen.getByRole("button").textContent).toBe("Save");
  });
});
