import { beforeEach, describe, expect, it, jest } from "@jest/globals";

jest.mock("../../../src/config/env", () => ({
  ENV: { NOTIF_DUE_SOON_WINDOW_HOURS: 24, NOTIF_BATCH_SIZE: 200 },
}));

jest.mock("../../../src/infrastructure/logging/childLogger", () => ({
  notificationDueReminderJobLogger: {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  },
}));

jest.mock("../../../src/infrastructure/db/mongoose/schemas", () => ({
  CardModel: { find: jest.fn() },
}));

jest.mock("../../../src/application/notifications/createNotification", () => ({
  createNotification: jest.fn(),
}));

import { notificationDueReminderJob } from "../../../src/jobs/notificationDueReminder.job";
import { CardModel } from "../../../src/infrastructure/db/mongoose/schemas";
import { createNotification } from "../../../src/application/notifications/createNotification";

const findMock = jest.mocked(CardModel.find);
const createNotificationMock = jest.mocked(createNotification);

const MEMBER_A = "507f1f77bcf86cd799439021";
const MEMBER_B = "507f1f77bcf86cd799439022";

/** Stub the `.select().limit().lean()` chain CardModel.find returns. */
function stubCards(cards: unknown[]): void {
  findMock.mockReturnValue({
    select: () => ({
      limit: () => ({
        lean: async () => cards,
      }),
    }),
  } as never);
}

describe("notificationDueReminderJob", () => {
  beforeEach(() => {
    findMock.mockReset();
    createNotificationMock.mockReset();
  });

  it("emits one CARD_DUE_SOON per member with a per-day dedupe key", async () => {
    stubCards([
      {
        _id: { toString: () => "card-1" },
        boardId: "507f1f77bcf86cd799439031",
        workspaceId: "507f1f77bcf86cd799439032",
        dueDate: new Date("2026-10-05T10:00:00.000Z"),
        members: [MEMBER_A, MEMBER_B],
        title: "Ship it",
      },
    ]);

    createNotificationMock
      .mockResolvedValueOnce({ created: true, id: "n1" })
      .mockResolvedValueOnce({ created: false, id: null });

    await notificationDueReminderJob();

    expect(createNotificationMock).toHaveBeenCalledTimes(2);

    const first = createNotificationMock.mock.calls[0]?.[0] as {
      type: string;
      dedupeKey: string;
      userId: string;
    };
    expect(first.type).toBe("CARD_DUE_SOON");
    expect(first.userId).toBe(MEMBER_A);
    expect(first.dedupeKey).toBe(`CARD_DUE_SOON:card-1:${MEMBER_A}:2026-10-05`);
  });

  it("does nothing when there are no candidate cards", async () => {
    stubCards([]);

    await notificationDueReminderJob();

    expect(createNotificationMock).not.toHaveBeenCalled();
  });
});
