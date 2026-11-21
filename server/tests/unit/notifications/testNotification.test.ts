import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  userFindOne: vi.fn(),
  workspaceFind: vi.fn(),
  boardFindOne: vi.fn(),
  create: vi.fn(),
  info: vi.fn(),
  debug: vi.fn(),
  error: vi.fn(),
}));

vi.mock("../../../src/infrastructure/db/mongoose/schemas", () => ({
  UserModel: { findOne: mocks.userFindOne },
  WorkspaceModel: { find: mocks.workspaceFind },
  BoardModel: { findOne: mocks.boardFindOne },
  NotificationModel: { create: mocks.create },
  DEFAULT_NOTIFICATION_PREFERENCES: {
    CARD_ASSIGNED: { inApp: true, email: false },
  },
}));

vi.mock("../../../src/infrastructure/logging/childLogger", () => ({
  notificationLogger: {
    info: mocks.info,
    debug: mocks.debug,
    error: mocks.error,
  },
}));

vi.mock("../../../src/application/notifications/createNotification", () => ({
  createNotification: vi.fn(),
}));

import { createNotification } from "../../../src/application/notifications/createNotification";
import {
  PushTargetError,
  pushTestNotifications,
  resolvePushTarget,
} from "../../../src/application/notifications/testNotification";

/** Any chain order ending in `.lean()`. */
function chain(result: unknown) {
  const step = {
    lean: async () => result,
    select: () => step,
    sort: () => step,
    limit: () => step,
  };

  return step;
}

const USER_ID = "507f1f77bcf86cd799439011";
const WORKSPACE_ID = "507f1f77bcf86cd799439012";
const OTHER_WORKSPACE = "507f1f77bcf86cd799439013";
const BOARD_ID = "507f1f77bcf86cd799439014";

function workspaces() {
  return [
    {
      _id: { toString: () => WORKSPACE_ID },
      name: "Personal",
      members: [{ userId: { toString: () => USER_ID }, role: "owner" }],
    },
    {
      _id: { toString: () => OTHER_WORKSPACE },
      name: "Acme",
      members: [{ userId: { toString: () => USER_ID }, role: "guest" }],
    },
  ];
}

describe("resolvePushTarget", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.userFindOne.mockReturnValue(
      chain({ _id: { toString: () => USER_ID }, email: "raj@example.com" }),
    );
    mocks.workspaceFind.mockReturnValue(chain(workspaces()));
    mocks.boardFindOne.mockReturnValue(
      chain({ _id: { toString: () => BOARD_ID }, name: "Repos" }),
    );
  });

  it("defaults to the account's first workspace", async () => {
    const target = await resolvePushTarget({ email: "  Raj@Example.com " });

    expect(target).toMatchObject({
      userId: USER_ID,
      email: "raj@example.com",
      workspaceId: WORKSPACE_ID,
      workspaceName: "Personal",
      role: "owner",
      boardId: null,
    });

    // The email is normalised before the lookup, or a capitalised address misses.
    expect(mocks.userFindOne).toHaveBeenCalledWith({
      email: "raj@example.com",
    });
  });

  it("honours an explicit workspace and reports the role there", async () => {
    const target = await resolvePushTarget({
      email: "raj@example.com",
      workspaceId: OTHER_WORKSPACE,
    });

    expect(target.workspaceName).toBe("Acme");
    expect(target.role).toBe("guest");
  });

  it("refuses a workspace the account is not in, and lists the ones it is", async () => {
    await expect(
      resolvePushTarget({
        email: "raj@example.com",
        workspaceId: "507f1f77bcf86cd799439999",
      }),
    ).rejects.toThrow(/not in workspace .* In: Personal/);
  });

  it("resolves a board by name inside the workspace", async () => {
    const target = await resolvePushTarget({
      email: "raj@example.com",
      board: "Repos",
    });

    expect(target.boardId).toBe(BOARD_ID);
    expect(target.boardName).toBe("Repos");
  });

  it("fails clearly when the account does not exist", async () => {
    mocks.userFindOne.mockReturnValue(chain(null));

    await expect(
      resolvePushTarget({ email: "nobody@example.com" }),
    ).rejects.toBeInstanceOf(PushTargetError);
  });

  it("fails clearly when the account is in no workspace", async () => {
    mocks.workspaceFind.mockReturnValue(chain([]));

    await expect(
      resolvePushTarget({ email: "raj@example.com" }),
    ).rejects.toThrow(/not a member of any workspace/);
  });

  it("fails clearly when the board name matches nothing", async () => {
    mocks.boardFindOne.mockReturnValue(chain(null));

    await expect(
      resolvePushTarget({ email: "raj@example.com", board: "Nope" }),
    ).rejects.toThrow(/No board "Nope"/);
  });

  it("requires an email", async () => {
    await expect(resolvePushTarget({ email: "   " })).rejects.toThrow(
      /--email is required/,
    );
  });
});

describe("pushTestNotifications", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.userFindOne.mockReturnValue(
      chain({ _id: { toString: () => USER_ID }, email: "raj@example.com" }),
    );
    mocks.workspaceFind.mockReturnValue(chain(workspaces()));
    mocks.boardFindOne.mockReturnValue(chain(null));
    vi.mocked(createNotification).mockResolvedValue({
      created: true,
      id: "notif-1",
    });
  });

  it("creates the rows through the production path", async () => {
    const result = await pushTestNotifications({
      email: "raj@example.com",
      type: "CARD_OVERDUE",
      count: 3,
      now: new Date("2026-11-21T10:00:00.000Z"),
    });

    expect(result.created).toBe(3);
    expect(vi.mocked(createNotification)).toHaveBeenCalledTimes(3);

    const first = vi.mocked(createNotification).mock.calls[0][0];

    expect(first).toMatchObject({
      userId: USER_ID,
      workspaceId: WORKSPACE_ID,
      type: "CARD_OVERDUE",
      title: "A card is overdue",
    });
    expect(first.message).toContain("push-notification.ts");
  });

  it("gives every row its own dedupe key", async () => {
    await pushTestNotifications({
      email: "raj@example.com",
      type: "MENTION",
      count: 2,
      now: new Date("2026-11-21T10:00:00.000Z"),
    });

    const keys = vi
      .mocked(createNotification)
      .mock.calls.map((call) => call[0].dedupeKey);

    expect(new Set(keys).size).toBe(2);
  });

  it("reuses one key when asked, so a second run is deduped", async () => {
    await pushTestNotifications({
      email: "raj@example.com",
      type: "MENTION",
      count: 2,
      stableDedupeKey: true,
    });

    const keys = vi
      .mocked(createNotification)
      .mock.calls.map((call) => call[0].dedupeKey);

    expect(new Set(keys).size).toBe(1);
  });

  it("counts what the index rejected as deduped, not as an error", async () => {
    vi.mocked(createNotification).mockResolvedValueOnce({
      created: false,
      id: null,
    });

    const result = await pushTestNotifications({
      email: "raj@example.com",
      type: "MENTION",
      count: 2,
    });

    expect(result.created).toBe(1);
    expect(result.deduped).toBe(1);
  });

  it("writes nothing on a dry run", async () => {
    const result = await pushTestNotifications({
      email: "raj@example.com",
      type: "BOARD_SHARED",
      dryRun: true,
    });

    expect(result).toMatchObject({ created: 0, dryRun: true, ids: [] });
    expect(vi.mocked(createNotification)).not.toHaveBeenCalled();
  });

  it("clamps an absurd count instead of writing 10 000 rows", async () => {
    const result = await pushTestNotifications({
      email: "raj@example.com",
      type: "MENTION",
      count: 10_000,
    });

    expect(result.created).toBe(50);
  });

  it("keeps a custom title and message", async () => {
    await pushTestNotifications({
      email: "raj@example.com",
      type: "MENTION",
      title: "Custom title",
      message: "Custom message",
    });

    expect(vi.mocked(createNotification).mock.calls[0][0]).toMatchObject({
      title: "Custom title",
      message: "Custom message",
    });
  });
});
