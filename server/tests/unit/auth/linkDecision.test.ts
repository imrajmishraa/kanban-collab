import { describe, expect, it } from "vitest";

import { decideAccountLink } from "../../../src/application/auth/providers/linkDecision";
import type { OAuthProfile } from "../../../src/infrastructure/auth/providers/types";

/**
 * What an OAuth profile may do to an account it matched by email.
 *
 * The hole these cases close: a profile that matched an account by email used
 * to be linked unconditionally, so registering `victim@example.com` with a
 * password and waiting for the victim to sign in with Google handed over the
 * account. Every case below is a rule from that incident.
 */

function profile(overrides: Partial<OAuthProfile> = {}): OAuthProfile {
  return {
    provider: "google",
    providerId: "google-123",
    email: "victim@example.com",
    emailVerified: true,
    fullName: "Victim",
    avatarUrl: null,
    ...overrides,
  };
}

describe("decideAccountLink", () => {
  it("refuses an unverified provider address, even when the account exists", () => {
    /* The regression test. Before the fix this returned a decision and the
       caller linked happily — the profile's word was the only evidence. */
    expect(() =>
      decideAccountLink(profile({ emailVerified: false }), {
        emailVerified: false,
        hasPassword: true,
      }),
    ).toThrowError(/not verified/i);
  });

  it("refuses an unverified address on an already-verified account too", () => {
    expect(() =>
      decideAccountLink(profile({ emailVerified: false }), {
        emailVerified: true,
        hasPassword: false,
      }),
    ).toThrowError(/not verified/i);
  });

  it("drops the password and the sessions of an unverified password account", () => {
    /* The squat: someone registered the address with a password of their own
       choosing. The provider has now proved ownership, so that password must
       stop working, and so must any session it minted. */
    const decision = decideAccountLink(profile(), {
      emailVerified: false,
      hasPassword: true,
    });

    expect(decision).toEqual({
      markEmailVerified: true,
      dropPassword: true,
      revokeSessions: true,
    });
  });

  it("verifies an unverified account that has no password", () => {
    /* An OAuth-only account created before the address was verified: nothing
       to drop, but the claim is now proven. */
    const decision = decideAccountLink(profile(), {
      emailVerified: false,
      hasPassword: false,
    });

    expect(decision).toEqual({
      markEmailVerified: true,
      dropPassword: false,
      revokeSessions: false,
    });
  });

  it("leaves a verified account's password alone", () => {
    /* The legitimate case the old comment was defending: the account already
       proved its address, so its password is not of unknown provenance and
       the user must keep it. */
    const decision = decideAccountLink(profile(), {
      emailVerified: true,
      hasPassword: true,
    });

    expect(decision).toEqual({
      markEmailVerified: false,
      dropPassword: false,
      revokeSessions: false,
    });
  });
});
