import { describe, expect, it } from "vitest";

import { daysUntil, dueDateCopy, syncCopy, wipCopy } from "./kanbanTooltipText";

/**
 * What a Kanban tooltip says. The words are the product decision, so they are pinned here
 * rather than discovered in a browser.
 */
const now = new Date(2026, 2, 10, 12, 0, 0); // 10 March 2026, midday
const day = (offset: number) => new Date(2026, 2, 10 + offset, 9, 0, 0);

describe("daysUntil", () => {
  it("counts whole days, ignoring the time", () => {
    expect(daysUntil(day(0), now)).toBe(0);
    expect(daysUntil(day(1), now)).toBe(1);
    expect(daysUntil(day(-2), now)).toBe(-2);
  });
});

describe("dueDateCopy", () => {
  it("is danger when overdue", () => {
    expect(dueDateCopy(day(-2), now)).toEqual({
      label: "Overdue by 2 days",
      tone: "danger",
    });
    expect(dueDateCopy(day(-1), now)).toEqual({
      label: "Overdue by a day",
      tone: "danger",
    });
  });

  it("is warning for today and tomorrow", () => {
    expect(dueDateCopy(day(0), now).tone).toBe("warning");
    expect(dueDateCopy(day(0), now).label).toBe("Due today");
    expect(dueDateCopy(day(1), now)).toMatchObject({
      label: "Due tomorrow",
      tone: "warning",
    });
  });

  it("is quiet beyond tomorrow — red on every card is not a signal", () => {
    expect(dueDateCopy(day(3), now)).toEqual({
      label: "Due in 3 days",
      tone: "neutral",
    });
  });

  it("switches to weeks past a week", () => {
    expect(dueDateCopy(day(14), now).label).toBe("Due in 2 weeks");
  });
});

describe("syncCopy", () => {
  it("spins while saving", () => {
    expect(syncCopy("saving")).toMatchObject({
      label: "Saving…",
      loading: true,
    });
  });

  it("worries only when offline", () => {
    expect(syncCopy("offline").tone).toBe("warning");
    expect(syncCopy("error").tone).toBe("danger");
  });

  it("says how long ago it saved, and closes itself", () => {
    expect(
      syncCopy("saved", new Date(now.getTime() - 30_000), now),
    ).toMatchObject({
      label: "Saved 30s ago",
      tone: "success",
      autoHide: 2000,
    });
    expect(
      syncCopy("saved", new Date(now.getTime() - 120_000), now).label,
    ).toBe("Saved 2 minutes ago");
  });

  it("says 'just now' for a fresh save", () => {
    expect(syncCopy("saved", new Date(now.getTime() - 1000), now).label).toBe(
      "Saved just now",
    );
  });
});

describe("wipCopy", () => {
  it("is quiet under the limit", () => {
    expect(wipCopy(3, 5)).toEqual({ label: "3/5 cards", tone: "neutral" });
  });

  it("warns at the limit and is danger over it", () => {
    expect(wipCopy(5, 5)).toMatchObject({ tone: "warning" });
    expect(wipCopy(5, 5).label).toContain("limit reached");
    expect(wipCopy(6, 5)).toMatchObject({ tone: "danger" });
    expect(wipCopy(6, 5).label).toContain("over the limit");
  });

  it("ignores a column with no limit", () => {
    expect(wipCopy(9, 0)).toEqual({ label: "9 cards", tone: "neutral" });
  });
});
