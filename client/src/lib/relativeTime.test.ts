import { describe, expect, it } from "vitest";

import { relativeTime } from "./relativeTime";

/**
 * The stamp on a notification row.
 *
 * The clock is injected, so these are exact rather than "runs in under a second".
 * The interesting cases are the unit boundaries, where rounding decides whether a
 * row says "59 min" or "1 hr".
 */

const NOW = new Date("2026-11-21T12:00:00.000Z");

function ago(ms: number): string {
  return new Date(NOW.getTime() - ms).toISOString();
}

describe("relativeTime", () => {
  it("says just now under a minute", () => {
    expect(relativeTime(ago(0), NOW)).toBe("just now");
    expect(relativeTime(ago(59_000), NOW)).toBe("just now");
  });

  it("spells minutes out", () => {
    expect(relativeTime(ago(60_000), NOW)).toBe("1 min");
    expect(relativeTime(ago(2 * 60_000), NOW)).toBe("2 min");
    expect(relativeTime(ago(59 * 60_000), NOW)).toBe("59 min");
  });

  it("switches to hours at the boundary", () => {
    expect(relativeTime(ago(60 * 60_000), NOW)).toBe("1 hr");
    expect(relativeTime(ago(2 * 60 * 60_000), NOW)).toBe("2 hr");
    expect(relativeTime(ago(23 * 60 * 60_000), NOW)).toBe("23 hr");
  });

  it("switches to days, and singulars a single day", () => {
    expect(relativeTime(ago(24 * 60 * 60_000), NOW)).toBe("1 day");
    expect(relativeTime(ago(2 * 24 * 60 * 60_000), NOW)).toBe("2 days");
    expect(relativeTime(ago(30 * 24 * 60 * 60_000), NOW)).toBe("30 days");
  });

  it("rounds half a unit up rather than showing 0", () => {
    /* 90 minutes is 1.5 hours: "2 hr" beats "1 hr", which would read as a whole
       hour earlier than it was. */
    expect(relativeTime(ago(90 * 60_000), NOW)).toBe("2 hr");
  });

  it("treats a future timestamp as just now", () => {
    const future = new Date(NOW.getTime() + 5_000).toISOString();

    expect(relativeTime(future, NOW)).toBe("just now");
  });

  it("returns nothing for an unparseable date", () => {
    expect(relativeTime("not-a-date", NOW)).toBe("");
  });
});
