import { afterEach, describe, expect, it, vi } from "vitest";

/**
 * The default matters more than the option.
 *
 * `warn` logs a state that arrived without its cookie and carries on — and the
 * login-CSRF callback is exactly a state that arrives without its cookie. A
 * default of `warn` therefore ships the hole the binding exists to close, so
 * production has to be `required` unless somebody says otherwise.
 */

const env = vi.hoisted(() => ({
  ENV: {
    IS_PROD: false,
    OAUTH_STATE_BINDING: undefined as "warn" | "required" | undefined,
  },
}));

vi.mock("../../../src/config/env", () => env);

import { oauthStateBindingMode } from "../../../src/config/oauth";

afterEach(() => {
  env.ENV.IS_PROD = false;
  env.ENV.OAUTH_STATE_BINDING = undefined;
});

describe("oauthStateBindingMode", () => {
  it("requires the binding in production when nothing is set", () => {
    env.ENV.IS_PROD = true;

    expect(oauthStateBindingMode()).toBe("required");
  });

  it("warns outside production when nothing is set", () => {
    env.ENV.IS_PROD = false;

    expect(oauthStateBindingMode()).toBe("warn");
  });

  it("lets an explicit setting win, in both directions", () => {
    env.ENV.IS_PROD = true;
    env.ENV.OAUTH_STATE_BINDING = "warn";
    expect(oauthStateBindingMode()).toBe("warn");

    env.ENV.IS_PROD = false;
    env.ENV.OAUTH_STATE_BINDING = "required";
    expect(oauthStateBindingMode()).toBe("required");
  });
});
