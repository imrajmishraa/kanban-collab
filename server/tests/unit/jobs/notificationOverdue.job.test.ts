import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("../../../src/config/env", () => ({
  ENV: { NOTIF_OVERDUE_WINDOW_DAYS: 14, NOTIF_BATCH_SIZE: 200 },
}));

vi.mock("../../../src/infrastructure/logging/childLogger", () => ({
  notificationOverdueJobLogger: {
    info: vi.fn(),
    error: vi.fn(),
    debug: vi.fn(),
  },
}));

vi.mock("../../../src/infrastructure/db/mongoose/schemas", () => ({
  CardModel: { find: vi.fn() },
}));

vi.mock("../../../src/application/notifications/createNotification", () => ({
  createNotification: vi.fn(),
}));

import { notificationOverdueJob } from "../../../src/jobs/notificationOverdue.job";
import { CardModel } from "../../../src/infrastructure/db/mongoose/schemas";
import { createNotification } from "../../../src/application/notifications/createNotification";

const findMock = vi.mocked(CardModel.find);
const createNotificationMock = vi.mocked(createNotification);

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

function card(overrides: Record<string, unknown> = {}) {
  return {
    _id: { toString: () => "card-1" },
    boardId: "507f1f77bcf86cd799439031",
    workspaceId: "507f1f77bcf86cd799439032",
    dueDate: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
    members: [MEMBER_A, MEMBER_B],
    title: "Ship it",
    ...overrides,
  };
}

describe("notificationOverdueJob", () => {
  beforeEach(() => {
    findMock.mockReset();
    createNotificationMock.mockReset();
    createNotificationMock.mockResolvedValue({ created: true } as never);
  });

  it("only looks at cards past their due date, within the lookback window", async () => {
    stubCards([]);

    await notificationOverdueJob();

    const filter = findMock.mock.calls[0]?.[0] as {
      dueDate: { $lt: Date; $gte: Date };
      isArchived: boolean;
    };

    expect(filter.isArchived).toBe(false);
    expect(filter.dueDate.$lt).toBeInstanceOf(Date);

    const windowDays =
      (Date.now() - filter.dueDate.$gte.getTime()) / (24 * 60 * 60 * 1000);
    expect(Math.round(windowDays)).toBe(14);
  });

  it("emits one CARD_OVERDUE per member with a per-day dedupe key", async () => {
    stubCards([card()]);

    await notificationOverdueJob();

    expect(createNotificationMock).toHaveBeenCalledTimes(2);

    const [first] = createNotificationMock.mock.calls[0] ?? [];
    expect(first).toMatchObject({
      type: "CARD_OVERDUE",
      userId: MEMBER_A,
      title: "A card is overdue",
      workspaceId: "507f1f77bcf86cd799439032",
      boardId: "507f1f77bcf86cd799439031",
    });
    expect(first?.dedupeKey).toMatch(
      /^CARD_OVERDUE:card-1:507f1f77bcf86cd799439021:\d{4}-\d{2}-\d{2}$/,
    );
    expect(first?.message).toMatch(/3 days ago/);
  });

  it("says '1 day ago' rather than '1 days ago'", async () => {
    stubCards([
      card({ dueDate: new Date(Date.now() - 24 * 60 * 60 * 1000 - 1000) }),
    ]);

    await notificationOverdueJob();

    const [first] = createNotificationMock.mock.calls[0] ?? [];
    expect(first?.message).toMatch(/1 day ago/);
  });

  it("counts a card that is only seconds overdue as at least one day late", async () => {
    stubCards([card({ dueDate: new Date(Date.now() - 5_000) })]);

    await notificationOverdueJob();

    const [first] = createNotificationMock.mock.calls[0] ?? [];
    expect((first?.metadata as { daysLate: number }).daysLate).toBe(1);
  });

  it("does nothing when there are no candidates", async () => {
    stubCards([]);

    await notificationOverdueJob();

    expect(createNotificationMock).not.toHaveBeenCalled();
  });

  it("rethrows so the scheduler logs the failure", async () => {
    findMock.mockReturnValue({
      select: () => ({
        limit: () => ({
          lean: async () => {
            throw new Error("mongo down");
          },
        }),
      }),
    } as never);

    await expect(notificationOverdueJob()).rejects.toThrow("mongo down");
  });
});
