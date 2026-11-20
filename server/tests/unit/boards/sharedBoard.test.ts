import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  boardFindById: vi.fn(),
  workspaceFindById: vi.fn(),
  columnFind: vi.fn(),
  cardFind: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  debug: vi.fn(),
}));

vi.mock("../../../src/infrastructure/db/mongoose/schemas", () => ({
  BoardModel: { findById: mocks.boardFindById },
  WorkspaceModel: { findById: mocks.workspaceFindById },
  ColumnModel: { find: mocks.columnFind },
  CardModel: { find: mocks.cardFind },
  ActivityLogModel: { create: vi.fn() },
  WorkspaceMemberModel: {},
}));

vi.mock("../../../src/infrastructure/logging/childLogger", () => ({
  boardControllerLogger: {
    info: mocks.info,
    warn: mocks.warn,
    error: mocks.error,
    debug: mocks.debug,
  },
}));

vi.mock("../../../src/infrastructure/cache/cacheClient", () => ({
  getCacheClient: vi.fn(async () => ({
    get: vi.fn(async () => null),
    set: vi.fn(),
    del: vi.fn(),
  })),
}));

import { getSharedBoard } from "../../../src/interfaces/http/controllers/boards/boards";

/** Any chain order ending in `.lean()` — the controllers use several. */
function chain(result: unknown): unknown {
  const step = {
    lean: async () => result,
    sort: () => step,
    select: () => step,
    limit: () => step,
  };

  return step;
}

/**
 * `asyncHandler` swallows the promise and forwards rejections to `next`, so the
 * handler returns void. Call it, then let the microtask queue drain before
 * asserting — the work runs off the returned value, not through it.
 */
async function callController(boardId: string) {
  const req = { params: { boardId } } as never;

  const json = vi.fn();
  const status = vi.fn(() => ({ json }));

  const res = { status, json } as never;
  const next = vi.fn();

  (getSharedBoard as unknown as (r: unknown, s: unknown, n: unknown) => void)(
    req,
    res,
    next,
  );

  await new Promise((resolve) => setImmediate(resolve));

  return { next, status, json };
}

/** The ApiError the handler passed to `next`, if it rejected. */
function failure(next: ReturnType<typeof vi.fn>) {
  return next.mock.calls[0]?.[0] as { statusCode?: number } | undefined;
}

const BOARD_ID = "507f1f77bcf86cd799439011";
const WORKSPACE_ID = "507f1f77bcf86cd799439012";
const COLUMN_ID = "507f1f77bcf86cd799439013";

function board(visibility: string) {
  return {
    _id: BOARD_ID,
    name: "Roadmap",
    description: "Q1",
    visibility,
    workspaceId: WORKSPACE_ID,
  };
}

describe("getSharedBoard — the public read", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mocks.boardFindById.mockReturnValue(chain(board("public")));
    mocks.workspaceFindById.mockReturnValue(chain({ name: "Acme" }));
    mocks.columnFind.mockReturnValue(
      chain([{ _id: COLUMN_ID, name: "Todo", orderIndex: 0 }]),
    );
    mocks.cardFind.mockReturnValue(
      chain([
        {
          _id: "card-1",
          title: "Ship it",
          description: "",
          orderIndex: 0,
          dueDate: null,
          labels: ["p1"],
          checklists: [{}, {}],
          columnId: COLUMN_ID,
          members: ["user-1"],
        },
      ]),
    );
  });

  it("serves a public board without a session", async () => {
    const { json } = await callController(BOARD_ID);

    const payload = json.mock.calls[0]?.[0] as {
      data: {
        board: Record<string, unknown>;
        columns: { cards: Record<string, unknown>[] }[];
      };
    };

    expect(payload.data.board.name).toBe("Roadmap");
    expect(payload.data.board.workspaceName).toBe("Acme");
    expect(payload.data.columns).toHaveLength(1);
    expect(payload.data.columns[0]?.cards[0]?.title).toBe("Ship it");
  });

  it("leaks no membership data in the projection", async () => {
    const { json } = await callController(BOARD_ID);

    const serialised = JSON.stringify(json.mock.calls[0]?.[0]);

    expect(serialised).not.toContain("members");
    expect(serialised).not.toContain("user-1");
    expect(serialised).not.toContain("email");
  });

  it("answers 404 for a workspace-visible board, not 403", async () => {
    mocks.boardFindById.mockReturnValue(chain(board("workspace")));

    const { next } = await callController(BOARD_ID);

    expect(failure(next)?.statusCode).toBe(404);
  });

  it("answers 404 for a private board", async () => {
    mocks.boardFindById.mockReturnValue(chain(board("private")));

    const { next } = await callController(BOARD_ID);

    expect(failure(next)?.statusCode).toBe(404);
  });

  it("answers 404 for a board that does not exist", async () => {
    mocks.boardFindById.mockReturnValue(chain(null));

    const { next } = await callController(BOARD_ID);

    expect(failure(next)?.statusCode).toBe(404);
  });

  it("rejects a malformed id before touching the database", async () => {
    const { next } = await callController("not-an-object-id");

    expect(failure(next)?.statusCode).toBe(400);
    expect(mocks.boardFindById).not.toHaveBeenCalled();
  });
});
