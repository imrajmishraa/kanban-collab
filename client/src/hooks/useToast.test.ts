import { describe, expect, it } from "vitest";

import {
  dismissToast,
  toastError,
  toastInfo,
  toastLoading,
  toastPromise,
  toastSuccess,
  toastWarning,
} from "@/lib/toast";

import { toastApi } from "./useToast";

/**
 * The gathering, pinned.
 *
 * The point of this file is that it holds no logic of its own, so the only thing
 * worth testing is that it still holds the library's own functions — not
 * wrappers that will drift the moment an option is added.
 */
describe("toastApi", () => {
  it("exposes every call the library has, and nothing else", () => {
    expect(Object.keys(toastApi).sort()).toEqual([
      "dismiss",
      "error",
      "info",
      "loading",
      "promise",
      "success",
      "warning",
    ]);
  });

  it("is the library's own function, not a wrapper", () => {
    expect(toastApi.success).toBe(toastSuccess);
    expect(toastApi.info).toBe(toastInfo);
    expect(toastApi.warning).toBe(toastWarning);
    expect(toastApi.error).toBe(toastError);
    expect(toastApi.loading).toBe(toastLoading);
    expect(toastApi.promise).toBe(toastPromise);
    expect(toastApi.dismiss).toBe(dismissToast);
  });
});
