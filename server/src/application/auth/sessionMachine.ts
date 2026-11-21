/**
 * The refresh-token lineage, as a table.
 *
 * A session row carries one live `jti`, plus the `jti` it just replaced
 * (`previousJti`) and a short expiry for that one (`previousJtiExpiresAt`). That
 * pair is a two-state machine with a timer, and until now its rules lived as a
 * Mongo `$or` inside `refresh()` — readable only by reading the query.
 *
 * The states a presented token can be in:
 *
 *   current  — it is the session's live token. Normal case: rotate.
 *   grace    — it is the token that was just rotated away, inside its window.
 *              Two tabs refreshing at once both hold it; the second must not be
 *              punished with a logout.
 *   reuse    — anything else: an old token from two rotations ago, a token from
 *              another session, or a grace token presented after its window.
 *              This is the signal that a token leaked.
 *   revoked  — the session was already ended.
 *   expired  — the session outlived its own expiry (the TTL index can lag).
 */

export const GRACE_PERIOD_MS = 30_000;

export interface SessionState {
  jti: string;
  previousJti?: string | null;
  previousJtiExpiresAt?: Date | null;
  revokedAt?: Date | null;
  expiresAt: Date;
}

export type RotationOutcome =
  "current" | "grace" | "reuse" | "revoked" | "expired";

/**
 * Decide what a presented refresh token means for this session.
 *
 * Order matters and is deliberate: expiry before revocation (an expired session
 * is gone whatever its flags say), revocation before lineage (a revoked session
 * must not rotate, even with its own current token), lineage last.
 */
export function rotationOutcome(
  session: SessionState,
  incomingJti: string,
  now: Date,
): RotationOutcome {
  if (session.expiresAt.getTime() <= now.getTime()) return "expired";

  if (session.revokedAt) return "revoked";

  if (session.jti === incomingJti) return "current";

  if (session.previousJti === incomingJti) {
    const graceUntil = session.previousJtiExpiresAt;

    /* A grace token whose window has closed is a replay, not a race. */
    if (graceUntil && graceUntil.getTime() > now.getTime()) return "grace";

    return "reuse";
  }

  return "reuse";
}

/**
 * When the grace window for the *next* rotation should close.
 *
 * The window is anchored to the rotation that orphaned the token, never
 * extended by later use. The first implementation set `now + 30s` on every
 * rotation, so presenting the same old token every 20 seconds kept its grace
 * alive forever — a sliding window, which is no window at all.
 */
export function nextGraceExpiry(
  session: SessionState,
  outcome: RotationOutcome,
  now: Date,
): Date | null {
  if (outcome === "current") {
    return new Date(now.getTime() + GRACE_PERIOD_MS);
  }

  if (outcome === "grace") {
    /* Keep the original deadline: this rotation is the tail of the previous
       one, not a new grant. */
    return session.previousJtiExpiresAt ?? null;
  }

  return null;
}

/**
 * May this outcome continue into a rotation?
 *
 * `reuse` is answered with a revocation rather than a token, and `revoked` /
 * `expired` are terminal.
 */
export function isRotatable(outcome: RotationOutcome): boolean {
  return outcome === "current" || outcome === "grace";
}
