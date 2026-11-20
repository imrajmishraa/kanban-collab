import { describe, expect, it } from "vitest";

import {
  applyReadState,
  isReadState,
} from "../../../src/application/notifications/readState";

const NOW = new Date("2026-11-20T10:00:00.000Z");
const EARLIER = new Date("2026-11-19T10:00:00.000Z");

describe("applyReadState — the two fields are written together", () => {
  it("keeps the timestamp of record when readAt is set", () => {
    expect(applyReadState({ isRead: true, readAt: EARLIER }, NOW)).toEqual({
      isRead: true,
      readAt: EARLIER,
    });
  });

  it("stamps readAt when only the flag says read", () => {
    // A legacy row, or a caller that only knew the boolean.
    expect(applyReadState({ isRead: true, readAt: null }, NOW)).toEqual({
      isRead: true,
      readAt: NOW,
    });
  });

  it("trusts readAt even when the flag is false", () => {
    // The TTL index watches readAt, so this row is expiring either way.
    expect(applyReadState({ isRead: false, readAt: EARLIER }, NOW)).toEqual({
      isRead: true,
      readAt: EARLIER,
    });
  });

  it("clears a stale readAt when the notification is unread", () => {
    expect(applyReadState({ isRead: false, readAt: null }, NOW)).toEqual({
      isRead: false,
      readAt: null,
    });
  });

  it("ignores an invalid date rather than writing it", () => {
    const invalid = new Date("not-a-date");

    expect(applyReadState({ isRead: true, readAt: invalid }, NOW)).toEqual({
      isRead: true,
      readAt: NOW,
    });
  });

  it("treats an empty state as unread", () => {
    expect(applyReadState({}, NOW)).toEqual({ isRead: false, readAt: null });
  });
});

describe("isReadState — readAt alone is enough", () => {
  it("is read when a timestamp exists, whatever the flag says", () => {
    expect(isReadState({ isRead: false, readAt: EARLIER })).toBe(true);
  });

  it("is read when the flag is set, whatever the timestamp says", () => {
    expect(isReadState({ isRead: true, readAt: null })).toBe(true);
  });

  it("is unread when neither says so", () => {
    expect(isReadState({ isRead: false, readAt: null })).toBe(false);
    expect(isReadState({})).toBe(false);
  });
});
