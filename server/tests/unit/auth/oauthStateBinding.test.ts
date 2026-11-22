import { describe, expect, it, vi } from "vitest";

/* `stateToken` reads its HMAC key from the validated config, and `config/env`
   exits the process when a required variable is missing — which none are set to
   be in a unit test. Mock the two keys it asks for. */
vi.mock("../../../src/config/env", () => ({
  ENV: {
    OAUTH_STATE_SECRET: "test-state-secret",
    JWT_SECRET: "test-jwt-secret",
  },
}));

import {
  createStateToken,
  stateMatchesBrowser,
  verifyStateToken,
} from "../../../src/application/auth/oauth/stateToken";

/**
 * The state token, and the half of login CSRF it cannot answer on its own.
 *
 * The signature says "our server minted this"; it says nothing about *whose
 * browser* finishes the flow. An attacker who starts one, keeps the
 * `code`+`state` pair and sends the callback URL to a victim gets that victim
 * signed into the attacker's account. The nonce in a cookie is what closes it.
 */

describe("createStateToken / verifyStateToken", () => {
  it("hands back the nonce that is inside the token", () => {
    const { token, nonce } = createStateToken({
      provider: "google",
      rememberMe: true,
    });

    const verified = verifyStateToken(token, "google");

    expect(verified.nonce).toBe(nonce);
    expect(verified.rememberMe).toBe(true);
  });

  it("gives two flows different nonces", () => {
    const first = createStateToken({ provider: "google", rememberMe: false });
    const second = createStateToken({ provider: "google", rememberMe: false });

    expect(first.nonce).not.toBe(second.nonce);
  });

  it("still refuses a state minted for another provider", () => {
    const { token } = createStateToken({
      provider: "google",
      rememberMe: true,
    });

    expect(() => verifyStateToken(token, "github")).toThrowError(
      /invalid|state/i,
    );
  });
});

describe("stateMatchesBrowser", () => {
  it("accepts the nonce the flow was started with", () => {
    expect(stateMatchesBrowser("nonce-1", "nonce-1")).toBe(true);
  });

  it("refuses a state that arrived without its cookie", () => {
    /* The login-CSRF case: a valid, correctly signed state from somebody else's
       browser. */
    expect(stateMatchesBrowser("nonce-1", undefined)).toBe(false);
  });

  it("refuses a state whose cookie belongs to a different flow", () => {
    expect(stateMatchesBrowser("nonce-1", "nonce-2")).toBe(false);
  });
});
