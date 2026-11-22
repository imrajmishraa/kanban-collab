import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * Closing live sockets when access changes.
 *
 * This is the half of the access-control fix that has no HTTP status to observe:
 * a socket that was authorised at the upgrade keeps streaming unless something
 * closes it. The read side got a guard and nine cases; this pins the other side.
 */

const mocks = vi.hoisted(() => ({
  boardFind: vi.fn(),
  workspaceFindById: vi.fn(),
  getUserConnections: vi.fn(),
  getBoardConnections: vi.fn(),
  logInfo: vi.fn(),
  logWarn: vi.fn(),
  logError: vi.fn(),
}));

vi.mock("../../../src/infrastructure/db/mongoose/schemas", () => ({
  BoardModel: { find: mocks.boardFind },
  WorkspaceModel: { findById: mocks.workspaceFindById },
}));

vi.mock(
  "../../../src/interfaces/websockets/collaboration/lifecycle/connectionRegistry",
  () => ({
    connectionRegistry: {
      getUserConnections: mocks.getUserConnections,
      getBoardConnections: mocks.getBoardConnections,
    },
  }),
);

vi.mock("../../../src/infrastructure/logging/childLogger", () => ({
  websocketLogger: {
    info: mocks.logInfo,
    warn: mocks.logWarn,
    error: mocks.logError,
  },
}));

import {
  revokeGuestSocketsOnBoard,
  revokeWorkspaceSockets,
} from "../../../src/interfaces/websockets/collaboration/lifecycle/accessRevocation";

const USER_ID = "6517f1c2a4b8e9d0f1a2b3c5";
const WORKSPACE_ID = "6517f1c2a4b8e9d0f1a2b3c6";
const BOARD_A = "6517f1c2a4b8e9d0f1a2b3c7";
const BOARD_B = "6517f1c2a4b8e9d0f1a2b3c8";

/** Any chain order ending in `.lean()`. */
function chain(result: unknown): unknown {
  const lean = async () => result;
  const select = () => ({ lean });

  return { select };
}

function connection(id: string, userId: string, boardId: string) {
  return { id, userId, boardId, socket: { close: vi.fn() } };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("revokeWorkspaceSockets", () => {
  it("closes the user's sockets on this workspace's boards, and only those", async () => {
    mocks.boardFind.mockReturnValue(
      chain([
        { _id: { toString: () => BOARD_A } },
        { _id: { toString: () => BOARD_B } },
      ]),
    );

    const onBoardA = connection("c1", USER_ID, BOARD_A);
    const onBoardB = connection("c2", USER_ID, BOARD_B);
    /* Same user, a board in another workspace: the query above never returned
       it, so this connection must survive. */
    const otherWorkspace = connection(
      "c3",
      USER_ID,
      "6517f1c2a4b8e9d0f1a2b3c9",
    );
    mocks.getUserConnections.mockReturnValue([
      onBoardA,
      onBoardB,
      otherWorkspace,
    ]);

    const closed = await revokeWorkspaceSockets(
      USER_ID,
      WORKSPACE_ID,
      "member_removed",
    );

    expect(closed).toBe(2);
    expect(onBoardA.socket.close).toHaveBeenCalledWith(4003, "member_removed");
    expect(onBoardB.socket.close).toHaveBeenCalledWith(4003, "member_removed");
    expect(otherWorkspace.socket.close).not.toHaveBeenCalled();
  });

  it("ends the socket on removal but only changes it on a role change", async () => {
    mocks.boardFind.mockReturnValue(
      chain([{ _id: { toString: () => BOARD_A } }]),
    );

    const removed = connection("c1", USER_ID, BOARD_A);
    mocks.getUserConnections.mockReturnValue([removed]);

    await revokeWorkspaceSockets(USER_ID, WORKSPACE_ID, "member_removed");
    expect(removed.socket.close).toHaveBeenCalledWith(4003, "member_removed");

    const demoted = connection("c2", USER_ID, BOARD_A);
    mocks.getUserConnections.mockReturnValue([demoted]);

    await revokeWorkspaceSockets(USER_ID, WORKSPACE_ID, "role_changed");
    expect(demoted.socket.close).toHaveBeenCalledWith(4006, "role_changed");
  });

  it("returns 0 without touching the registry when the workspace has no boards", async () => {
    mocks.boardFind.mockReturnValue(chain([]));

    const closed = await revokeWorkspaceSockets(
      USER_ID,
      WORKSPACE_ID,
      "member_left",
    );

    expect(closed).toBe(0);
    expect(mocks.getUserConnections).not.toHaveBeenCalled();
  });

  it("never throws, because the membership change is already committed", async () => {
    mocks.boardFind.mockRejectedValue(new Error("mongo is down"));

    await expect(
      revokeWorkspaceSockets(USER_ID, WORKSPACE_ID, "role_changed"),
    ).resolves.toBe(0);
    expect(mocks.logError).toHaveBeenCalled();
  });

  it("keeps closing after one socket refuses to close", async () => {
    mocks.boardFind.mockReturnValue(
      chain([{ _id: { toString: () => BOARD_A } }]),
    );

    const broken = connection("c1", USER_ID, BOARD_A);
    broken.socket.close.mockImplementation(() => {
      throw new Error("already closed");
    });
    const healthy = connection("c2", USER_ID, BOARD_A);
    mocks.getUserConnections.mockReturnValue([broken, healthy]);

    const closed = await revokeWorkspaceSockets(
      USER_ID,
      WORKSPACE_ID,
      "role_changed",
    );

    expect(closed).toBe(2);
    expect(healthy.socket.close).toHaveBeenCalled();
    expect(mocks.logWarn).toHaveBeenCalled();
  });
});

describe("revokeGuestSocketsOnBoard", () => {
  it("closes the guests on the board and leaves the members watching", async () => {
    mocks.workspaceFindById.mockReturnValue(
      chain({
        members: [
          { userId: { toString: () => "guest-1" }, role: "guest" },
          { userId: { toString: () => "member-1" }, role: "member" },
        ],
      }),
    );

    const guest = connection("c1", "guest-1", BOARD_A);
    const member = connection("c2", "member-1", BOARD_A);
    mocks.getBoardConnections.mockReturnValue([guest, member]);

    const closed = await revokeGuestSocketsOnBoard(BOARD_A, WORKSPACE_ID);

    expect(closed).toBe(1);
    /* 4006, not 4003: access changed, so the socket reconnects against the
       board's new visibility instead of giving up. */
    expect(guest.socket.close).toHaveBeenCalledWith(4006, "board_made_private");
    expect(member.socket.close).not.toHaveBeenCalled();
  });

  it("does nothing when the workspace has no guests", async () => {
    mocks.workspaceFindById.mockReturnValue(
      chain({
        members: [{ userId: { toString: () => USER_ID }, role: "member" }],
      }),
    );

    const closed = await revokeGuestSocketsOnBoard(BOARD_A, WORKSPACE_ID);

    expect(closed).toBe(0);
    expect(mocks.getBoardConnections).not.toHaveBeenCalled();
  });

  it("does nothing when the workspace is gone", async () => {
    mocks.workspaceFindById.mockReturnValue(chain(null));

    await expect(
      revokeGuestSocketsOnBoard(BOARD_A, WORKSPACE_ID),
    ).resolves.toBe(0);
  });
});
