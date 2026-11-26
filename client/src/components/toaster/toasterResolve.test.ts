import { describe, expect, it } from "vitest";

import { resolveToaster } from "./toasterResolve";
import { DEFAULT_WIDTH_PX, MOBILE_WIDTH_PX } from "./toasterVariants";
import { TOAST_MS } from "@/lib/toastTokens";

/**
 * The whole mapping, in the node environment — no React, no sonner, no browser.
 *
 * `resolveToaster` is where the props become numbers and classes, so this is
 * where "did the preset win over the caller" and "is this number written twice"
 * are cheap to pin.
 */
describe("resolveToaster — defaults", () => {
  const resolved = resolveToaster();

  it("reproduces the values the flat API shipped with", () => {
    expect(resolved.position).toBe("bottom-right");
    expect(resolved.theme).toBe("dark");
    expect(resolved.visibleToasts).toBe(3);
    expect(resolved.gap).toBe(10);
    expect(resolved.offset).toBe(16);
    expect(resolved.mobileOffset).toBe(12);
    expect(resolved.expand).toBe(false);
    expect(resolved.closeButton).toBe(true);
    expect(resolved.duration).toBe(TOAST_MS.default);
  });

  it("keeps one keyboard registration, at alt+T", () => {
    expect(resolved.hotkey).toEqual(["altKey", "KeyT"]);
    expect(resolved.swipeDirections).toEqual(["right", "top"]);
  });

  it("labels the stack and the close button", () => {
    expect(resolved.containerAriaLabel).toBe("Notifications");
    expect(resolved.closeButtonAriaLabel).toBe("Dismiss notification");
  });

  it("starts on the elevated gradient panel", () => {
    expect(resolved.toastStyle["--normal-bg"]).toContain("linear-gradient");
    expect(resolved.toastStyle["--width"]).toBe(`${DEFAULT_WIDTH_PX}px`);
    expect(resolved.toastStyle["--toast-mobile-width"]).toBe(
      `${MOBILE_WIDTH_PX}px`,
    );
  });
});

describe("resolveToaster — a preset is a default, not an override", () => {
  it("fills several groups from one word", () => {
    const resolved = resolveToaster({ preset: "quiet" });

    expect(resolved.visibleToasts).toBe(1);
    expect(resolved.closeButton).toBe(false);
    expect(resolved.duration).toBe(TOAST_MS.moment);
    expect(resolved.classNames.title).toContain("!text-[12px]");
  });

  it("lets the caller win over the preset", () => {
    const resolved = resolveToaster({
      preset: "quiet",
      appearance: { size: "lg" },
      layout: { visibleToasts: 4 },
    });

    expect(resolved.classNames.title).toContain("!text-[15px]");
    expect(resolved.visibleToasts).toBe(4);
  });

  it("keeps the auth preset short and blue", () => {
    const resolved = resolveToaster({ preset: "auth" });

    expect(resolved.toastStyle["--normal-bg"]).toBe("var(--auth)");
    expect(resolved.duration).toBe(TOAST_MS.moment);
  });
});

describe("resolveToaster — layout", () => {
  it("turns a width into a pixel variable", () => {
    expect(
      resolveToaster({ layout: { width: 520 } }).toastStyle["--width"],
    ).toBe("520px");
  });

  it("passes a CSS length through untouched", () => {
    expect(
      resolveToaster({ layout: { width: "28rem" } }).toastStyle["--width"],
    ).toBe("28rem");
  });

  it("overrides the mobile cap, which used to be unreachable", () => {
    const resolved = resolveToaster({ layout: { mobileWidth: 300 } });

    expect(resolved.toastStyle["--toast-mobile-width"]).toBe("300px");
  });

  it("adds the height caps as variables and the matching classes", () => {
    const resolved = resolveToaster({
      layout: { height: 72, maxHeight: "50vh" },
    });

    expect(resolved.toastStyle["--toast-min-height"]).toBe("72px");
    expect(resolved.toastStyle["--toast-max-height"]).toBe("50vh");
    expect(resolved.classNames.toast).toContain(
      "!min-h-[var(--toast-min-height)]",
    );
  });

  it("leaves the cap classes off when no cap was asked for", () => {
    expect(resolveToaster().classNames.toast).not.toContain("!min-h-[");
  });
});

describe("resolveToaster — appearance", () => {
  it("paints from the tone's variables", () => {
    expect(
      resolveToaster({ appearance: { tone: "brand" } }).toastStyle[
        "--normal-bg"
      ],
    ).toBe("var(--brand)");
    expect(
      resolveToaster({ appearance: { tone: "danger" } }).toastStyle[
        "--normal-bg"
      ],
    ).toBe("var(--danger)");
  });

  it("applies the shape as a radius class", () => {
    expect(
      resolveToaster({ appearance: { shape: "pill" } }).classNames.toast,
    ).toContain("!rounded-full");
  });

  it("never writes the radius as a variable as well", () => {
    const resolved = resolveToaster({ appearance: { shape: "card" } });

    expect(resolved.toastStyle["--border-radius"]).toBeUndefined();
    expect(resolved.classNames.toast).toContain("!rounded-[20px]");
  });
});

describe("resolveToaster — fill", () => {
  it("fills the surface solid by default", () => {
    expect(
      resolveToaster({ appearance: { tone: "danger" } }).toastStyle[
        "--normal-bg"
      ],
    ).toBe("var(--danger)");
  });

  it("tints the surface and keeps the page's ink when soft", () => {
    const resolved = resolveToaster({
      appearance: { tone: "danger", fill: "soft" },
    });

    expect(resolved.toastStyle["--normal-bg"]).toContain("color-mix");
    expect(resolved.toastStyle["--normal-text"]).toBe("var(--text-primary)");
  });

  it("leaves the surface alone and colours the edge when outlined", () => {
    const resolved = resolveToaster({
      appearance: { tone: "danger", fill: "outline" },
    });

    expect(resolved.toastStyle["--normal-bg"]).toBe("var(--bg-elevated)");
    expect(resolved.toastStyle["--normal-border"]).toContain("var(--danger)");
  });

  it("takes the fill from a preset, and the caller still wins", () => {
    const quiet = resolveToaster({
      preset: "quiet",
      appearance: { tone: "danger" },
    });

    expect(quiet.toastStyle["--normal-bg"]).toContain("color-mix");

    const overridden = resolveToaster({
      preset: "quiet",
      appearance: { tone: "danger", fill: "solid" },
    });

    expect(overridden.toastStyle["--normal-bg"]).toBe("var(--danger)");
  });
});

describe("resolveToaster — behaviour and labels", () => {
  it("passes the shortcut and the swipe directions through", () => {
    const resolved = resolveToaster({
      behaviour: { hotkey: ["altKey", "KeyN"], swipeDirections: ["left"] },
    });

    expect(resolved.hotkey).toEqual(["altKey", "KeyN"]);
    expect(resolved.swipeDirections).toEqual(["left"]);
  });

  it("renames the stack for a second toaster", () => {
    const resolved = resolveToaster({
      a11y: { containerLabel: "Board alerts" },
    });

    expect(resolved.containerAriaLabel).toBe("Board alerts");
  });

  it("keeps the action buttons above the 44px touch floor on mobile", () => {
    const { actionButton, cancelButton } = resolveToaster().classNames;

    expect(actionButton).toContain("!h-11");
    expect(actionButton).toContain("sm:!h-7");
    expect(cancelButton).toContain("!h-11");
  });
});

describe("resolveToaster — escape hatches", () => {
  it("appends a caller's toast class after the variant classes", () => {
    const resolved = resolveToaster({
      classNames: { toast: "!bg-transparent" },
    });

    expect(resolved.classNames.toast).toContain("!bg-transparent");
    expect(
      resolved.classNames.toast?.indexOf("!bg-transparent"),
    ).toBeGreaterThan(resolved.classNames.toast!.indexOf("!rounded-"));
  });

  it("lets a caller replace one slot without losing the rest", () => {
    const resolved = resolveToaster({ classNames: { title: "!uppercase" } });

    expect(resolved.classNames.title).toContain("!uppercase");
    expect(resolved.classNames.title).toContain("!font-semibold");
  });

  it("puts the root class on the toaster, not on a toast", () => {
    const resolved = resolveToaster({ classNames: { toaster: "!z-50" } });

    expect(resolved.rootClass).toContain("!z-50");
    expect(resolved.classNames.toast).not.toContain("!z-50");
  });

  it("names the stack only when asked", () => {
    expect(resolveToaster({ id: "system" }).id).toBe("system");
    expect(resolveToaster().id).toBeUndefined();
  });
});
