import { describe, expect, it } from "vitest";

import {
  TOAST_FILLS,
  TONE_COLOR,
  TONE_SURFACE,
  TOAST_MS,
  toneSurface,
  type ToastTone,
} from "./toastTokens";

/**
 * The one copy of the toast's colour and time.
 *
 * Both halves read these, so a wrong entry here is a wrong toast in two places —
 * which is exactly the failure the table exists to prevent.
 */
describe("tone surfaces", () => {
  it("leaves the default surface alone", () => {
    expect(TONE_SURFACE.auto).toEqual({});
  });

  it("paints from tokens, never a raw colour", () => {
    for (const surface of Object.values(TONE_SURFACE)) {
      for (const value of Object.values(surface)) {
        if (typeof value !== "string") continue;

        expect(value).toMatch(/var\(--|color-mix/);
      }
    }
  });

  it("gives each tone its own background variable", () => {
    const backgrounds = Object.values(TONE_SURFACE)
      .map((surface) => surface["--normal-bg"])
      .filter(Boolean);

    expect(new Set(backgrounds).size).toBe(backgrounds.length);
  });

  it("ships the auth surface as a tone, not a private table", () => {
    expect(TONE_SURFACE.auth["--normal-bg"]).toBe("var(--auth)");
    expect(TONE_SURFACE.auth["--normal-text"]).toBe("var(--auth-ink)");
  });

  it("keeps the brand tone on the brand token", () => {
    expect(TONE_SURFACE.brand["--normal-bg"]).toBe("var(--brand)");
  });
});

describe("the tone set", () => {
  it("covers the status set, the accent and the tooltip's inverse", () => {
    expect(Object.keys(TONE_SURFACE)).toEqual([
      "auto",
      "brand",
      "success",
      "warning",
      "danger",
      "info",
      "neutral",
      "muted",
      "auth",
      "accent",
      "inverse",
    ]);
  });

  it("carries the tooltip's info and muted tones", () => {
    expect(TONE_SURFACE.info["--normal-bg"]).toBe("var(--link)");
    expect(TONE_SURFACE.muted["--normal-text"]).toBe("var(--text-secondary)");
  });

  it("gives every filling tone its own description and close ink", () => {
    for (const [tone, surface] of Object.entries(TONE_SURFACE)) {
      if (tone === "auto") continue;

      expect(surface["--toast-description"]).toBeTruthy();
      expect(surface["--toast-close"]).toBeTruthy();
    }
  });

  it("uses the ink that flips with the theme on a status fill", () => {
    /* White on the dark theme's success fill is 1.9:1; this is the fix. */
    for (const tone of ["brand", "success", "warning", "danger"] as const) {
      expect(TONE_SURFACE[tone]["--normal-text"]).toBe("var(--inverse-text)");
    }

    expect(TONE_SURFACE.auth["--normal-text"]).toBe("var(--auth-ink)");
  });

  it("paints the accent tone from the segmented-control pair", () => {
    expect(TONE_SURFACE.accent["--normal-bg"]).toBe("var(--accent-fill)");
    expect(TONE_SURFACE.accent["--normal-text"]).toBe("var(--accent)");
  });

  it("takes the inverse tone from the tooltip's family", () => {
    expect(TONE_SURFACE.inverse["--normal-bg"]).toBe("var(--inverse-bg)");
    expect(TONE_SURFACE.inverse["--normal-border"]).toBe(
      "var(--inverse-border)",
    );
  });
});

describe("toneSurface", () => {
  it("returns the solid table for the default fill", () => {
    expect(toneSurface("danger")).toEqual(TONE_SURFACE.danger);
    expect(toneSurface("danger", "solid")).toEqual(TONE_SURFACE.danger);
  });

  it("tints and edges a soft fill, and keeps the page's ink", () => {
    const soft = toneSurface("success", "soft");

    expect(soft["--normal-bg"]).toContain("var(--success)");
    expect(soft["--normal-bg"]).toContain("var(--bg-elevated)");
    expect(soft["--normal-border"]).toContain("var(--success)");
    expect(soft["--normal-text"]).toBe("var(--text-primary)");
  });

  it("leaves an outline unfilled and puts the tone on the edge", () => {
    const outline = toneSurface("danger", "outline");

    expect(outline["--normal-bg"]).toBe("var(--bg-elevated)");
    expect(outline["--normal-border"]).toContain("var(--danger)");
    expect(outline["--normal-text"]).toBe("var(--text-primary)");
  });

  it("has nothing to soften on auto", () => {
    expect(toneSurface("auto", "soft")).toEqual({});
    expect(toneSurface("auto", "outline")).toEqual({});
  });

  it("gives every tone and fill three inks", () => {
    for (const tone of Object.keys(TONE_SURFACE) as ToastTone[]) {
      if (tone === "auto") continue;

      for (const fill of TOAST_FILLS) {
        const surface = toneSurface(tone, fill);

        expect(surface["--normal-bg"]).toBeTruthy();
        expect(surface["--normal-text"]).toBeTruthy();
        expect(surface["--toast-description"]).toBeTruthy();
        expect(surface["--toast-close"]).toBeTruthy();
      }
    }
  });

  it("derives every fill from one colour per tone", () => {
    for (const tone of Object.keys(TONE_COLOR) as ToastTone[]) {
      const color = TONE_COLOR[tone];

      if (color === undefined) continue;

      expect(toneSurface(tone, "soft")["--normal-bg"]).toContain(color);
      expect(toneSurface(tone, "outline")["--normal-border"]).toContain(color);
    }
  });
});

describe("lifetimes", () => {
  it("keeps an error on screen longest and a moment briefest", () => {
    expect(TOAST_MS.error).toBeGreaterThan(TOAST_MS.default);
    expect(TOAST_MS.default).toBeGreaterThan(TOAST_MS.success);
    expect(TOAST_MS.success).toBeGreaterThan(TOAST_MS.moment);
  });

  it("names one short lifetime, so auth and quiet cannot drift apart", () => {
    expect(TOAST_MS.moment).toBe(2500);
  });
});
