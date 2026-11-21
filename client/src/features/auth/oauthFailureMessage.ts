/**
 * What to tell someone whose provider sign-in did not finish.
 *
 * The OAuth flow is a top-level navigation: `/auth/callback` never returns to
 * the login page with an error object, only with `?error=&reason=`. Nothing read
 * those params, so every failure — including "your provider has not verified
 * this address", which the account-takeover fix made a real, reachable outcome —
 * landed the user back on the login screen with no explanation at all.
 *
 * The mapping lives here, away from the component, so it can be tested without a
 * DOM. The server keeps provider text out of the URL on purpose; these are the
 * only sentences a user ever sees for these failures.
 */
const MESSAGES = {
  /** `oauthEmailNotVerifiedError` — the one failure the user can act on. */
  email_not_verified:
    "That email address isn't verified at your provider yet. Verify it there and try again, or sign in with your password.",
  cancelled: "Sign-in was cancelled before it finished.",
  provider_error:
    "Your provider refused the sign-in. Try again, or use your password.",
  expired_link:
    "That sign-in link has expired or was already used. Start again.",
  oauth_failed:
    "We couldn't finish signing you in with that provider. Try again, or use your password.",
  oauth_refresh:
    "You signed in, but we couldn't start your session. Try again.",
  unknown:
    "We couldn't finish signing you in. Try again, or use your password.",
} as const;

/**
 * @param error  `error` from the query string (`oauth`, `oauth_refresh`).
 * @param reason `reason` from the query string — `oauth_failed`, `cancelled`,
 *   `provider_error`, `missing_code`, `missing_state`, `email_not_verified`, or
 *   `state_<detail>` from the signed-state check.
 */
export function oauthFailureMessage(
  error: string,
  reason?: string | null,
): string {
  /* A failed session start is its own case: the provider sign-in worked. */
  if (error === "oauth_refresh") {
    return MESSAGES.oauth_refresh;
  }

  const key = reason ?? error;

  if (key in MESSAGES) {
    return MESSAGES[key as keyof typeof MESSAGES];
  }

  /* Every signed-state failure (`state_expired`, `state_future`, `state_invalid`,
     …) means the same thing to the reader: start again. */
  if (key.startsWith("state_") || key === "missing_state") {
    return MESSAGES.expired_link;
  }

  /* `missing_code` — the provider sent us back without a code. */
  if (key === "missing_code") {
    return MESSAGES.provider_error;
  }

  return MESSAGES.unknown;
}
