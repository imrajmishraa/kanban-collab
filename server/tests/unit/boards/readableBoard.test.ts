import { beforeEach, describe, expect, it, vi } from "vitest";

/**
 * The read guard that every member-facing board surface now goes through.
 *
 * The hole being pinned here: `canReadBoard` said a `guest` may not read a
 * `private` board, but only `GET /boards/:id` and the WebSocket upgrade ever
 * asked it. Search, activity, archived cards, comments and attachments checked
 * workspace membership alone — and a guest is a member — so the rule held on one
 * endpoint out of six.
 */

const mocks = vi.hoisted(() => ({
  boardFindById: vi.fn(),
  boardFind: vi.fn(),
  workspaceFindOne: vi.fn(),
}));

vi.mock("../../../src/infrastructure/db/mongoose/schemas", () => ({
  BoardModel: { findById: mocks.boardFindById, find: mocks.boardFind },
  WorkspaceModel: { findOne: mocks.workspaceFindOne },
}));

import {
  assertBoardReadable,
  hiddenBoardIdsFor,
  loadReadableBoard,
} from "../../../src/application/boards/readableBoard";

const BOARD_ID = "6517f1c2a4b8e9d0f1a2b3c4";
const USER_ID = "6517f1c2a4b8e9d0f1a2b3c5";
const WORKSPACE_ID = "6517f1c2a4b8e9d0f1a2b3c6";

/** Any chain order ending in `.lean()`. */
function chain(result: unknown): unknown {
  const lean = async () => result;
  const select = () => ({ lean });

  return { select };
}

function boardRow(visibility: string) {
  return {
    _id: { toString: () => BOARD_ID },
    workspaceId: WORKSPACE_ID,
    visibility,
  };
}

function workspaceRow(role: string | null) {
  if (role === null) return null;

  return {
    members: [{ userId: { toString: () => USER_ID }, role }],
  };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe("loadReadableBoard", () => {
  it("404s when the board does not exist", async () => {
    mocks.boardFindById.mockReturnValue(chain(null));

    await expect(loadReadableBoard(BOARD_ID, USER_ID)).rejects.toMatchObject({
      statusCode: 404,
      code: "BOARD_NOT_FOUND",
    });
  });

  it("403s when the caller is not in the workspace at all", async () => {
    mocks.boardFindById.mockReturnValue(chain(boardRow("private")));
    mocks.workspaceFindOne.mockReturnValue(chain(null));

    await expect(loadReadableBoard(BOARD_ID, USER_ID)).rejects.toMatchObject({
      statusCode: 403,
      code: "WORKSPACE_MEMBER_REQUIRED",
    });
  });

  it("403s when a guest asks for a private board", async () => {
    mocks.boardFindById.mockReturnValue(chain(boardRow("private")));
    mocks.workspaceFindOne.mockReturnValue(chain(workspaceRow("guest")));

    await expect(loadReadableBoard(BOARD_ID, USER_ID)).rejects.toMatchObject({
      statusCode: 403,
      code: "BOARD_ACCESS_DENIED",
    });
  });

  it("allows a full member onto a private board", async () => {
    mocks.boardFindById.mockReturnValue(chain(boardRow("private")));
    mocks.workspaceFindOne.mockReturnValue(chain(workspaceRow("member")));

    await expect(loadReadableBoard(BOARD_ID, USER_ID)).resolves.toMatchObject({
      id: BOARD_ID,
      visibility: "private",
      role: "member",
    });
  });

  it("allows a guest onto a workspace-visible board", async () => {
    mocks.boardFindById.mockReturnValue(chain(boardRow("workspace")));
    mocks.workspaceFindOne.mockReturnValue(chain(workspaceRow("guest")));

    await expect(loadReadableBoard(BOARD_ID, USER_ID)).resolves.toMatchObject({
      role: "guest",
      visibility: "workspace",
    });
  });

  it("allows a guest onto a public board", async () => {
    mocks.boardFindById.mockReturnValue(chain(boardRow("public")));
    mocks.workspaceFindOne.mockReturnValue(chain(workspaceRow("guest")));

    await expect(loadReadableBoard(BOARD_ID, USER_ID)).resolves.toMatchObject({
      visibility: "public",
    });
  });
});

describe("assertBoardReadable (card-scoped surfaces)", () => {
  it("403s a guest on a private board — the comments/attachments case", async () => {
    mocks.boardFindById.mockReturnValue(chain({ visibility: "private" }));

    await expect(assertBoardReadable(BOARD_ID, "guest")).rejects.toMatchObject({
      statusCode: 403,
      code: "BOARD_ACCESS_DENIED",
    });
  });

  it("allows a guest on a workspace-visible board", async () => {
    mocks.boardFindById.mockReturnValue(chain({ visibility: "workspace" }));

    await expect(
      assertBoardReadable(BOARD_ID, "guest"),
    ).resolves.toBeUndefined();
  });

  it("404s when the card's board has vanished", async () => {
    mocks.boardFindById.mockReturnValue(chain(null));

    await expect(assertBoardReadable(BOARD_ID, "owner")).rejects.toMatchObject({
      statusCode: 404,
      code: "BOARD_NOT_FOUND",
    });
  });
});

describe("hiddenBoardIdsFor (list surfaces)", () => {
  it("returns the private boards a guest may not see", async () => {
    mocks.boardFind.mockReturnValue(
      chain([{ _id: BOARD_ID }, { _id: WORKSPACE_ID }]),
    );

    const hidden = await hiddenBoardIdsFor(WORKSPACE_ID, "guest");

    expect(hidden).toHaveLength(2);
    expect(mocks.boardFind).toHaveBeenCalledWith({
      workspaceId: expect.anything(),
      visibility: "private",
    });
  });

  it("returns nothing for a member, without querying", async () => {
    /* Every role but `guest` may read a private board, so the exclusion set is
       empty — which is what lets callers apply `$nin` unconditionally. */
    await expect(hiddenBoardIdsFor(WORKSPACE_ID, "member")).resolves.toEqual(
      [],
    );
    await expect(hiddenBoardIdsFor(WORKSPACE_ID, "admin")).resolves.toEqual([]);
    await expect(hiddenBoardIdsFor(WORKSPACE_ID, "owner")).resolves.toEqual([]);

    expect(mocks.boardFind).not.toHaveBeenCalled();
  });
});
