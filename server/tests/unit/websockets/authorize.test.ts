import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  boardFindById: vi.fn(),
  workspaceFindOne: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
}));

vi.mock("../../../src/infrastructure/db/mongoose/schemas", () => ({
  BoardModel: { findById: mocks.boardFindById },
  WorkspaceModel: { findOne: mocks.workspaceFindOne },
}));

vi.mock("../../../src/infrastructure/logging/childLogger", () => ({
  websocketAuthLogger: {
    info: mocks.info,
    warn: mocks.warn,
    error: mocks.error,
  },
}));

import { authorize } from "../../../src/interfaces/websockets/middlewares/authorize";

const USER = "507f1f77bcf86cd799439011";
const BOARD = "507f1f77bcf86cd799439012";
const WORKSPACE = "507f1f77bcf86cd799439013";

function chain(result: unknown) {
  const step = {
    lean: async () => result,
    select: () => step,
  };

  return step;
}

function board(visibility: string) {
  return { _id: BOARD, workspaceId: WORKSPACE, visibility };
}

function member(role: string) {
  return {
    _id: WORKSPACE,
    status: "active",
    members: [{ userId: { toString: () => USER }, role }],
  };
}

describe("authorize — public boards over the socket", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.boardFindById.mockReturnValue(chain(board("public")));
    mocks.workspaceFindOne.mockReturnValue(chain(null));
  });

  it("lets a signed-in non-member join a public board, read-only", async () => {
    const result = await authorize(USER, BOARD);

    expect(result).toEqual({ role: null, canWrite: false });
  });

  it("still refuses a non-member on a workspace board", async () => {
    mocks.boardFindById.mockReturnValue(chain(board("workspace")));

    await expect(authorize(USER, BOARD)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("still refuses a non-member on a private board", async () => {
    mocks.boardFindById.mockReturnValue(chain(board("private")));

    await expect(authorize(USER, BOARD)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("keeps a member writable on a public board", async () => {
    mocks.workspaceFindOne.mockReturnValue(chain(member("member")));

    const result = await authorize(USER, BOARD);

    expect(result).toEqual({ role: "member", canWrite: true });
  });

  it("keeps a guest read-only on a workspace board", async () => {
    mocks.boardFindById.mockReturnValue(chain(board("workspace")));
    mocks.workspaceFindOne.mockReturnValue(chain(member("guest")));

    const result = await authorize(USER, BOARD);

    expect(result).toEqual({ role: "guest", canWrite: false });
  });

  it("refuses a guest on a private board", async () => {
    mocks.boardFindById.mockReturnValue(chain(board("private")));
    mocks.workspaceFindOne.mockReturnValue(chain(member("guest")));

    await expect(authorize(USER, BOARD)).rejects.toMatchObject({
      statusCode: 403,
    });
  });

  it("answers 404 for a board that does not exist", async () => {
    mocks.boardFindById.mockReturnValue(chain(null));

    await expect(authorize(USER, BOARD)).rejects.toMatchObject({
      statusCode: 404,
    });
  });

  it("rejects malformed ids before touching the database", async () => {
    await expect(authorize("not-an-id", BOARD)).rejects.toBeDefined();
    expect(mocks.boardFindById).not.toHaveBeenCalled();
  });
});
