import { describe, expect, it } from "vitest";

import { TONE_SURFACE, TOAST_MS } from "./toastTokens";

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
      "neutral",
      "auth",
      "accent",
      "inverse",
    ]);
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
