import { afterEach, describe, expect, it, vi } from "vitest";

import { toast } from "sonner";

import {
  dismissToast,
  toastError,
  toastInfo,
  toastLoading,
  toastPromise,
  toastSuccess,
  toastWarning,
} from "./toast";
import { TOAST_MS } from "./toastTokens";

/**
 * The call, without a browser.
 *
 * Every assertion is about what reaches sonner: the lifetime per kind, the
 * surface per tone, and the per-toast attributes the flat API could not carry.
 */
afterEach(() => {
  vi.restoreAllMocks();
});

const spyOn = (kind: "success" | "error" | "info" | "warning" | "loading") =>
  vi.spyOn(toast, kind).mockReturnValue("toast-id");

describe("toastSuccess", () => {
  it("keeps the short lifetime for a success", () => {
    const spy = spyOn("success");

    toastSuccess("Saved");

    expect(spy).toHaveBeenCalledWith("Saved", { duration: TOAST_MS.success });
  });

  it("carries a description as a second line, not a second toast", () => {
    const spy = spyOn("success");

    toastSuccess("Saved", "Your board is up to date.");

    expect(spy).toHaveBeenCalledWith("Saved", {
      duration: TOAST_MS.success,
      description: "Your board is up to date.",
    });
  });

  it("paints the auth tone and dismisses it as a moment", () => {
    const spy = spyOn("success");

    toastSuccess("Logged in", "Welcome back", { tone: "auth" });

    expect(spy).toHaveBeenCalledWith("Logged in", {
      duration: TOAST_MS.moment,
      style: expect.objectContaining({ "--normal-bg": "var(--auth)" }),
      description: "Welcome back",
    });
  });

  it("lets one toast replace another by id", () => {
    const spy = spyOn("success");

    toastSuccess("Saved", undefined, { id: "board-save" });

    expect(spy).toHaveBeenCalledWith("Saved", {
      duration: TOAST_MS.success,
      id: "board-save",
    });
  });

  it("passes an undo button through unchanged", () => {
    const spy = spyOn("success");
    const onClick = vi.fn();

    toastSuccess("Board deleted", undefined, {
      action: { label: "Undo", onClick },
    });

    const [, options] = spy.mock.calls[0] as [string, { action: unknown }];

    expect(options.action).toEqual({ label: "Undo", onClick });
  });
});

describe("the other kinds", () => {
  it("keeps the longer lifetime for errors", () => {
    const spy = spyOn("error");

    toastError(new Error("Boom"));

    expect(spy).toHaveBeenCalledWith("Boom", { duration: TOAST_MS.error });
  });

  it("falls back to a message when the error says nothing", () => {
    const spy = spyOn("error");

    toastError(null, "Your access to this board was removed.");

    expect(spy).toHaveBeenCalledWith("Your access to this board was removed.", {
      duration: TOAST_MS.error,
    });
  });

  it("sends info and warning through their own sonner kinds", () => {
    const info = spyOn("info");
    const warning = spyOn("warning");

    toastInfo("Heads up");
    toastWarning("Slow connection");

    expect(info).toHaveBeenCalledWith("Heads up", {
      duration: TOAST_MS.default,
    });
    expect(warning).toHaveBeenCalledWith("Slow connection", {
      duration: TOAST_MS.default,
    });
  });

  it("keeps a loading toast on screen until something replaces it", () => {
    const spy = spyOn("loading");

    toastLoading("Saving…", { id: "board-save" });

    expect(spy).toHaveBeenCalledWith("Saving…", {
      duration: Infinity,
      id: "board-save",
    });
  });

  it("still honours an explicit duration on a loading toast", () => {
    const spy = spyOn("loading");

    toastLoading("Saving…", { duration: 900 });

    expect(spy).toHaveBeenCalledWith("Saving…", { duration: 900 });
  });
});

describe("toastPromise", () => {
  it("gives one toast the three states", () => {
    const spy = vi.spyOn(toast, "promise").mockReturnValue("toast-id" as never);

    toastPromise(Promise.resolve(1), {
      loading: "Saving…",
      success: "Saved",
      error: "Could not save",
    });

    expect(spy).toHaveBeenCalledWith(expect.any(Promise), {
      loading: "Saving…",
      success: "Saved",
      error: "Could not save",
      duration: TOAST_MS.success,
    });
  });
});

describe("dismissToast", () => {
  it("dismisses one toast, or all of them", () => {
    const spy = vi.spyOn(toast, "dismiss").mockReturnValue("ok");

    dismissToast("board-save");
    dismissToast();

    expect(spy).toHaveBeenNthCalledWith(1, "board-save");
    expect(spy).toHaveBeenNthCalledWith(2, undefined);
  });
});
