import { describe, expect, it } from "vitest";

import { shouldClearRefreshCookie } from "../../../src/application/auth/refreshFailure";
import { ApiError } from "../../../src/shared/utils/ApiError";

/**
 * A blip is not a logout.
 *
 * The refresh handler cleared the cookie on every error, so one database hiccup
 * or two tabs refreshing at once ended the session. Only a 401 means the token
 * is finished.
 */

describe("shouldClearRefreshCookie", () => {
  it("clears on 401 — invalid, expired or reused", () => {
    expect(
      shouldClearRefreshCookie(new ApiError(401, "Refresh token is invalid.")),
    ).toBe(true);
  });

  it("keeps the cookie on a server or database failure", () => {
    expect(shouldClearRefreshCookie(new ApiError(500, "boom"))).toBe(false);
    expect(shouldClearRefreshCookie(new Error("mongo is away"))).toBe(false);
  });

  it("keeps the cookie when the error is not an ApiError at all", () => {
    expect(shouldClearRefreshCookie(undefined)).toBe(false);
    expect(shouldClearRefreshCookie("nope")).toBe(false);
  });
});
