import { describe, expect, it } from "vitest";

import { describeDeletion } from "./deletionNotice";

const NOW = new Date("2026-11-14T12:00:00.000Z");

describe("describeDeletion", () => {
  it("returns null when there is no usable date", () => {
    expect(describeDeletion(null, NOW)).toBeNull();
    expect(describeDeletion(undefined, NOW)).toBeNull();
    expect(describeDeletion("not-a-date", NOW)).toBeNull();
  });

  it("rounds days up, so a partial day never reads as zero", () => {
    const notice = describeDeletion("2026-11-18T11:00:00.000Z", NOW);

    expect(notice?.daysLeft).toBe(4);
    expect(notice?.due).toBe(false);
    expect(notice?.label).toBe(
      "This workspace is scheduled for deletion in 4 days.",
    );
  });

  it("says 'less than a day' instead of 'in 1 days'", () => {
    const notice = describeDeletion("2026-11-14T20:00:00.000Z", NOW);

    expect(notice?.daysLeft).toBe(1);
    expect(notice?.label).toBe(
      "This workspace is scheduled for deletion in less than a day.",
    );
  });

  it("reports due once the instant has passed", () => {
    const notice = describeDeletion("2026-11-14T11:59:00.000Z", NOW);

    expect(notice?.due).toBe(true);
    expect(notice?.daysLeft).toBe(0);
    expect(notice?.label).toMatch(/grace period has ended/i);
  });

  it("treats the exact scheduled instant as due", () => {
    expect(describeDeletion("2026-11-14T12:00:00.000Z", NOW)?.due).toBe(true);
  });

  it("handles the 30-day default grace period", () => {
    const notice = describeDeletion("2026-12-14T12:00:00.000Z", NOW);

    expect(notice?.daysLeft).toBe(30);
    expect(notice?.due).toBe(false);
  });
});
