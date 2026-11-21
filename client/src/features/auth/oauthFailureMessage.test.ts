import { describe, expect, it } from "vitest";

import { oauthFailureMessage } from "./oauthFailureMessage";

/**
 * The provider flow ends in a redirect, so these strings are the entire user
 * experience of an OAuth failure. Before this existed the params were ignored
 * and the user landed on the login page with no message at all — including for
 * the unverified-address case the account-takeover fix introduced.
 */
describe("oauthFailureMessage", () => {
  it("explains an unverified provider address, and says what to do instead", () => {
    const message = oauthFailureMessage("oauth", "email_not_verified");

    expect(message).toMatch(/isn't verified at your provider/);
    expect(message).toMatch(/password/);
  });

  it("does not dress a cancelled sign-in up as an error the user caused", () => {
    expect(oauthFailureMessage("oauth", "cancelled")).toBe(
      "Sign-in was cancelled before it finished.",
    );
  });

  it("treats every signed-state failure as 'start again'", () => {
    for (const reason of ["state_expired", "state_future", "state_invalid"]) {
      expect(oauthFailureMessage("oauth", reason)).toMatch(
        /expired or was already used/,
      );
    }

    expect(oauthFailureMessage("oauth", "missing_state")).toMatch(
      /expired or was already used/,
    );
  });

  it("separates a failed session start from a failed provider sign-in", () => {
    // The provider flow succeeded; the refresh that follows did not.
    expect(oauthFailureMessage("oauth_refresh")).toMatch(
      /couldn't start your session/,
    );
    expect(oauthFailureMessage("oauth_refresh", "ignored")).toMatch(
      /couldn't start your session/,
    );
  });

  it("falls back to something actionable for an unknown reason", () => {
    const message = oauthFailureMessage("oauth", "something_new");

    expect(message).toBe(
      "We couldn't finish signing you in. Try again, or use your password.",
    );
    expect(oauthFailureMessage("oauth")).toBe(message);
  });

  it("never returns an empty string for any reason the server can send", () => {
    const reasons = [
      "oauth_failed",
      "cancelled",
      "provider_error",
      "missing_code",
      "missing_state",
      "email_not_verified",
      "state_expired",
      "",
    ];

    for (const reason of reasons) {
      expect(oauthFailureMessage("oauth", reason).length).toBeGreaterThan(10);
    }
  });
});
