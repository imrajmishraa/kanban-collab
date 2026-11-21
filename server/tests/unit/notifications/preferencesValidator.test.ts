import { describe, expect, it } from "vitest";

import { updateNotificationPreferencesSchema } from "../../../src/interfaces/http/validators/notifications/notificationPreference.validator";

/**
 * The preferences payload, as the two callers actually send it.
 *
 * The settings screen sends the whole map; the inbox's "Mute" sends one type. The
 * second one used to fail with a wall of "expected object, received undefined" —
 * `z.record` with an enum key is *exhaustive* in Zod 4, so every type was
 * required. These cases pin both shapes, plus the rejections that must survive.
 */

const body = updateNotificationPreferencesSchema.body;

function parse(payload: unknown) {
  return body.safeParse(payload);
}

describe("a single-type patch (what Mute sends)", () => {
  it("accepts one type with one channel", () => {
    const result = parse({ preferences: { CARD_OVERDUE: { inApp: false } } });

    expect(result.success).toBe(true);
  });

  it("accepts the same type being switched back on", () => {
    expect(
      parse({ preferences: { CARD_OVERDUE: { inApp: true } } }).success,
    ).toBe(true);
  });

  it("accepts several types at once", () => {
    expect(
      parse({
        preferences: {
          MENTION: { inApp: false },
          COMMENT_ADDED: { email: true },
        },
      }).success,
    ).toBe(true);
  });
});

describe("the full map (what the settings screen sends)", () => {
  it("still accepts every type", () => {
    expect(
      parse({
        preferences: {
          CARD_ASSIGNED: { inApp: true, email: false },
          CARD_MOVED: { inApp: true },
          CARD_DUE_SOON: { inApp: true },
          CARD_OVERDUE: { inApp: true },
          COMMENT_ADDED: { inApp: true },
          MENTION: { inApp: true },
          WORKSPACE_INVITE: { inApp: true },
          WORKSPACE_ROLE_CHANGED: { inApp: true },
          WORKSPACE_DELETION_SCHEDULED: { inApp: true },
          BOARD_SHARED: { inApp: true },
        },
      }).success,
    ).toBe(true);
  });
});

describe("rejections", () => {
  it("refuses a type that does not exist", () => {
    expect(parse({ preferences: { NOPE: { inApp: false } } }).success).toBe(
      false,
    );
  });

  it("refuses a channel value that is not a boolean", () => {
    expect(parse({ preferences: { MENTION: { inApp: "no" } } }).success).toBe(
      false,
    );
  });

  it("strips a channel that does not exist", () => {
    /* Unknown keys are stripped rather than rejected, which is the house style
       for every other validator in this folder. What matters is that a known
       channel's value is still checked — the case above this one. */
    expect(
      parse({ preferences: { MENTION: { carrier_pigeon: true } } }).success,
    ).toBe(true);
  });

  it("refuses an empty body", () => {
    expect(parse({}).success).toBe(false);
  });

  it("refuses an unknown digest frequency", () => {
    expect(parse({ digestFrequency: "hourly" }).success).toBe(false);
  });
});

describe("quiet hours", () => {
  it("accepts a partial block", () => {
    expect(parse({ quietHours: { enabled: true } }).success).toBe(true);
  });

  it("refuses a time that is not HH:MM", () => {
    expect(parse({ quietHours: { start: "10pm" } }).success).toBe(false);
  });
});
