import { describe, expect, it } from "vitest";

import {
  GRACE_PERIOD_MS,
  isRotatable,
  nextGraceExpiry,
  rotationOutcome,
  type SessionState,
} from "../../../src/application/auth/sessionMachine";

/**
 * The refresh lineage, as a table.
 *
 * The rules used to live inside a Mongo `$or`, where "no session" and "reuse"
 * were the same answer. These cases pin what each presented token means.
 */

const NOW = new Date("2026-11-21T10:00:00.000Z");
const LATER = new Date(NOW.getTime() + 60_000);
const SOON = new Date(NOW.getTime() + 10_000);

function session(overrides: Partial<SessionState> = {}): SessionState {
  return {
    jti: "current",
    previousJti: "previous",
    previousJtiExpiresAt: SOON,
    revokedAt: null,
    expiresAt: LATER,
    ...overrides,
  };
}

describe("rotationOutcome", () => {
  it("rotates the live token", () => {
    expect(rotationOutcome(session(), "current", NOW)).toBe("current");
  });

  it("accepts the just-rotated token inside its window", () => {
    // Two tabs refreshing at once: the second must not be logged out.
    expect(rotationOutcome(session(), "previous", NOW)).toBe("grace");
  });

  it("treats a grace token after its window as reuse", () => {
    const expired = session({
      previousJtiExpiresAt: new Date(NOW.getTime() - 1),
    });

    expect(rotationOutcome(expired, "previous", NOW)).toBe("reuse");
  });

  it("treats an unknown token as reuse", () => {
    expect(rotationOutcome(session(), "from-two-rotations-ago", NOW)).toBe(
      "reuse",
    );
  });

  it("treats a missing grace deadline as reuse, not grace", () => {
    expect(
      rotationOutcome(session({ previousJtiExpiresAt: null }), "previous", NOW),
    ).toBe("reuse");
  });

  it("reports a revoked session before looking at lineage", () => {
    expect(rotationOutcome(session({ revokedAt: NOW }), "current", NOW)).toBe(
      "revoked",
    );
    expect(rotationOutcome(session({ revokedAt: NOW }), "previous", NOW)).toBe(
      "revoked",
    );
  });

  it("reports expiry first, whatever the flags say", () => {
    const stale = session({
      expiresAt: new Date(NOW.getTime() - 1),
      revokedAt: NOW,
    });

    expect(rotationOutcome(stale, "current", NOW)).toBe("expired");
  });
});

describe("nextGraceExpiry — the window does not slide", () => {
  it("opens a full window when the live token rotates", () => {
    const expiry = nextGraceExpiry(session(), "current", NOW);

    expect(expiry?.getTime()).toBe(NOW.getTime() + GRACE_PERIOD_MS);
  });

  it("keeps the original deadline when a grace token rotates", () => {
    const state = session();

    /* The regression this pins: the first implementation set `now + 30s` on
       every rotation, so presenting the same old token every 20 seconds kept
       its grace alive forever. */
    const expiry = nextGraceExpiry(state, "grace", NOW);

    expect(expiry?.getTime()).toBe(SOON.getTime());
    expect(expiry?.getTime()).not.toBe(NOW.getTime() + GRACE_PERIOD_MS);
  });

  it("sets nothing for a terminal outcome", () => {
    expect(nextGraceExpiry(session(), "reuse", NOW)).toBeNull();
    expect(nextGraceExpiry(session(), "revoked", NOW)).toBeNull();
    expect(nextGraceExpiry(session(), "expired", NOW)).toBeNull();
  });

  it("repeated grace use cannot extend the window past its start", () => {
    const state = session();
    let deadline = nextGraceExpiry(state, "current", NOW);

    for (let attempt = 0; attempt < 5; attempt += 1) {
      const later = new Date(NOW.getTime() + attempt * 20_000);

      deadline = nextGraceExpiry(
        { ...state, previousJtiExpiresAt: deadline },
        "grace",
        later,
      );
    }

    expect(deadline?.getTime()).toBe(NOW.getTime() + GRACE_PERIOD_MS);
  });
});

describe("isRotatable", () => {
  it("lets only current and grace continue", () => {
    expect(isRotatable("current")).toBe(true);
    expect(isRotatable("grace")).toBe(true);
    expect(isRotatable("reuse")).toBe(false);
    expect(isRotatable("revoked")).toBe(false);
    expect(isRotatable("expired")).toBe(false);
  });
});
