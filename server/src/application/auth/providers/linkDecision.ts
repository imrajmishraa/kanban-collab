import { oauthEmailNotVerifiedError } from "../../../shared/errors/auth/oauth";
import type { OAuthProfile } from "../../../infrastructure/auth/providers/types";

/**
 * What an OAuth profile is allowed to do to an account it matched by email.
 *
 * `signInWithProvider` used to link a provider to any account whose email
 * matched, and say why in a comment: "the user already has a verified account
 * in our DB". That premise is false. `register` creates accounts with
 * `emailVerified: false`, and nothing in the server ever verifies an address —
 * so the only thing a matching email proves is that somebody typed it first.
 *
 * The attack that follows: register `victim@example.com` with a password of
 * your choosing, wait for the victim to sign in with Google, and keep the
 * password. The victim's own OAuth login hands you their account.
 *
 * The rule here is the one `linkProvider` (the signed-in "connect an account"
 * path) already applies — a provider identity is only trusted when the
 * provider says it verified the address. This function is the same rule, kept
 * pure so it can be tested without a database.
 */

/** The parts of an existing account the decision depends on. */
export interface ExistingAccount {
  /** Has this account ever proved it owns its email address? */
  emailVerified: boolean;
  /** Does it still hold a password credential? */
  hasPassword: boolean;
}

export interface LinkDecision {
  /** The provider proved the address, so the account may claim it. */
  markEmailVerified: boolean;
  /** Unset `passwordHash`: someone who never proved the address set it. */
  dropPassword: boolean;
  /** Delete every existing session before the new one is minted. */
  revokeSessions: boolean;
}

/**
 * @throws `OAUTH_EMAIL_NOT_VERIFIED` when the provider has not verified the
 * address. `fetchProfile` fills that flag from the source of truth — GitHub's
 * `/user/emails` `verified`, Google's `email_verified` — so a `false` here
 * means the address was genuinely unproven, not that we forgot to ask. A
 * GitHub user whose primary address is private is not caught by this: the
 * provider resolves a *verified* address from the list when one exists.
 */
export function decideAccountLink(
  profile: OAuthProfile,
  account: ExistingAccount,
): LinkDecision {
  if (!profile.emailVerified) {
    throw oauthEmailNotVerifiedError(profile.provider);
  }

  /*
   * A password on an unverified account is a credential of unknown
   * provenance: registration takes any address and no verification step
   * exists, so whoever typed the address chose that password. Now that the
   * provider has proved ownership, the password cannot be left working — and
   * neither can the sessions it minted, or dropping it would leave the
   * squatter signed in on their own device.
   */
  const squat = !account.emailVerified && account.hasPassword;

  return {
    markEmailVerified: !account.emailVerified,
    dropPassword: squat,
    revokeSessions: squat,
  };
}
