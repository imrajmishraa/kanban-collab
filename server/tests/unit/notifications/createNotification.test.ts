import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../../../src/infrastructure/logging/childLogger", () => ({
  notificationLogger: {
    info: jest.fn(),
    debug: jest.fn(),
    error: jest.fn(),
  },
}));

jest.mock("../../../src/infrastructure/db/mongoose/schemas", () => ({
  NotificationModel: { create: jest.fn() },
  DEFAULT_NOTIFICATION_PREFERENCES: {
    CARD_DUE_SOON: { inApp: true, email: true, push: true, sms: false },
  },
}));

import { createNotification } from "../../../src/application/notifications/createNotification";
import { NotificationModel } from "../../../src/infrastructure/db/mongoose/schemas";

const createMock = jest.mocked(NotificationModel.create);

const baseInput = {
  userId: "507f1f77bcf86cd799439011",
  type: "CARD_DUE_SOON" as const,
  title: "A card is due soon",
  message: "Due tomorrow",
  workspaceId: "507f1f77bcf86cd799439012",
};

describe("createNotification", () => {
  beforeEach(() => {
    createMock.mockReset();
  });

  it("writes a notification and returns its id", async () => {
    createMock.mockResolvedValue({
      _id: { toString: () => "notif-1" },
    } as never);

    const result = await createNotification({
      ...baseInput,
      boardId: "507f1f77bcf86cd799439013",
      cardId: "507f1f77bcf86cd799439014",
      dedupeKey: "CARD_DUE_SOON:card:user:2026-10-05",
      metadata: { cardTitle: "Ship it" },
    });

    expect(result).toEqual({ created: true, id: "notif-1" });
    expect(createMock).toHaveBeenCalledTimes(1);

    const payload = createMock.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload.type).toBe("CARD_DUE_SOON");
    expect(payload.dedupeKey).toBe("CARD_DUE_SOON:card:user:2026-10-05");
    expect(payload.channels).toEqual({
      inApp: true,
      email: true,
      push: true,
      sms: false,
    });
  });

  it("omits optional fields that were not supplied", async () => {
    createMock.mockResolvedValue({ _id: { toString: () => "n" } } as never);

    await createNotification(baseInput);

    const payload = createMock.mock.calls[0]?.[0] as Record<string, unknown>;
    expect(payload).not.toHaveProperty("boardId");
    expect(payload).not.toHaveProperty("cardId");
    expect(payload).not.toHaveProperty("dedupeKey");
  });

  it("returns created:false when the row already exists", async () => {
    createMock.mockRejectedValue(
      Object.assign(new Error("duplicate"), { code: 11000 }),
    );

    const result = await createNotification(baseInput);

    expect(result).toEqual({ created: false, id: null });
  });

  it("rethrows non-duplicate errors", async () => {
    createMock.mockRejectedValue(new Error("boom"));

    await expect(createNotification(baseInput)).rejects.toThrow("boom");
  });
});
