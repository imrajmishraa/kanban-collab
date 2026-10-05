import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import {
  ActivityLogModel,
  BoardModel,
  CardModel,
  ColumnModel,
  NotificationModel,
  UserModel,
  WorkspaceModel,
} from "../../../../infrastructure/db/mongoose/schemas";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { ApiError } from "../../../../shared/utils/ApiError";
import { Types } from "mongoose";

import { getCacheClient } from "../../../../infrastructure/cache/cacheClient";
import { boardControllerLogger } from "../../../../infrastructure/logging/childLogger";
import {
  notWorkspaceMemberError,
  userAlreadyWorkspaceMemberError,
  workspaceIdRequiredError,
} from "../../../../shared/errors/workspace/workspace";
import { userNotFoundError } from "../../../../shared/errors/auth/custom";
import {
  boardNotFoundError,
  boardAccessDeniedError,
  guestCannotModifyBoardError,
} from "../../../../shared/errors/board/board";

/**
 * Resolve the authenticated user's id, or reject.
 *
 * The routes are mounted behind `authenticateJWT`, but a non-null assertion
 * (`req.user!.userId`) would crash with a TypeError if the middleware were ever
 * missing. This mirrors the guard the dashboard controller already uses.
 */
function requireUserId(req: AuthenticatedRequest): string {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required.");
  }
  return req.user.userId;
}

/** Parse the `?include=columns,cards` opt-in used by the boards overview. */
function parseInclude(raw: unknown): { columns: boolean; cards: boolean } {
  const value = typeof raw === "string" ? raw : "";
  const set = new Set(
    value
      .split(",")
      .map((part) => part.trim().toLowerCase())
      .filter(Boolean),
  );
  return {
    columns: set.has("columns") || set.has("cards"),
    cards: set.has("cards"),
  };
}

const createBoard = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { workspaceId, name, backgroundColor, visibility } = req.body;
  const userId = requireUserId(req);
  try {
    // Verify workspace membership
    const workspace = await WorkspaceModel.findOne({
      _id: workspaceId,
      "members.userId": new Types.ObjectId(userId),
    });

    if (!workspace) {
      throw notWorkspaceMemberError();
    }

    const member = workspace.members.find(
      (m) => m.userId.toString() === userId,
    );

    if (!member || member.role === "guest") {
      throw guestCannotModifyBoardError();
    }

    const board = await BoardModel.create({
      workspaceId: new Types.ObjectId(workspaceId as string),
      name,
      backgroundColor: backgroundColor || "#2b6cb0",
      visibility: visibility || "workspace",
    });

    boardControllerLogger.info(
      {
        boardId: board._id,
        workspaceId,
        userId,
      },
      "Board created",
    );
    return res.status(201).json(
      new ApiResponse(201, "Board created successfully", {
        data: board,
      }),
    );
  } catch (error) {
    boardControllerLogger.error(
      {
        err: error,
        userId,
        workspaceId,
      },
      "Create board failed",
    );
    throw error;
  }
});

const listBoards = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { workspaceId, page = "1", limit = "10", include } = req.query;
  const userId = requireUserId(req);
  try {
    if (!workspaceId) {
      throw workspaceIdRequiredError();
    }

    // Verify workspace membership
    const workspace = await WorkspaceModel.findOne({
      _id: workspaceId as string,
      "members.userId": new Types.ObjectId(userId),
    });

    if (!workspace) {
      throw notWorkspaceMemberError();
    }

    const currentPage = Math.max(Number(page) || 1, 1);
    const pageLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

    const skip = (currentPage - 1) * pageLimit;

    const boardFilter = {
      workspaceId: new Types.ObjectId(workspaceId as string),
    };

    // Fetch boards + total count
    const [boards, totalBoards] = await Promise.all([
      BoardModel.find(boardFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),

      BoardModel.countDocuments(boardFilter),
    ]);

    const totalPages = Math.ceil(totalBoards / pageLimit);

    // Optional heavy payload: nest columns (and cards) so the overview can
    // render every board in a single request instead of one call per board.
    const { columns: wantColumns, cards: wantCards } = parseInclude(include);

    let payload: unknown[] = boards;

    if (wantColumns && boards.length > 0) {
      const boardIds = boards.map((board) => board._id);

      const columns = await ColumnModel.find({ boardId: { $in: boardIds } })
        .select("_id name orderIndex boardId workspaceId createdAt updatedAt")
        .sort({ orderIndex: 1 })
        .lean();

      const cards = wantCards
        ? await CardModel.find({
            boardId: { $in: boardIds },
            isArchived: false,
          })
            .select(
              "_id title description orderIndex dueDate labels checklists columnId boardId workspaceId members isArchived createdAt updatedAt",
            )
            .sort({ orderIndex: 1 })
            .lean()
        : [];

      payload = boards.map((board) => {
        // `board` is a hydrated Mongoose document — spread its plain object
        // form, not the document itself, or the fields won't survive.
        const raw = board.toObject();
        const boardColumns = columns
          .filter((column) => column.boardId.equals(board._id))
          .map((column) => ({
            id: column._id,
            boardId: column.boardId,
            workspaceId: column.workspaceId,
            name: column.name,
            orderIndex: column.orderIndex,
            createdAt: column.createdAt,
            updatedAt: column.updatedAt,
            cards: wantCards
              ? cards
                  .filter((card) => card.columnId.equals(column._id))
                  .map((card) => ({
                    id: card._id,
                    columnId: card.columnId,
                    boardId: card.boardId,
                    workspaceId: card.workspaceId,
                    title: card.title,
                    description: card.description,
                    orderIndex: card.orderIndex,
                    dueDate: card.dueDate,
                    labels: card.labels,
                    checklists: card.checklists,
                    members: card.members ?? [],
                    isArchived: card.isArchived,
                    createdAt: card.createdAt,
                    updatedAt: card.updatedAt,
                  }))
              : [],
          }));

        return {
          ...raw,
          id: raw._id,
          columns: boardColumns,
        };
      });
    }

    boardControllerLogger.info(
      {
        workspaceId,
        userId,
        boardCount: boards.length,
        page: currentPage,
        limit: pageLimit,
        totalBoards,
        include: wantColumns
          ? wantCards
            ? "columns,cards"
            : "columns"
          : "none",
      },
      "Boards listed",
    );
    return res.status(200).json(
      new ApiResponse(200, "Boards fetched successfully", {
        boards: payload,
        pagination: {
          page: currentPage,
          limit: pageLimit,
          totalBoards,
          totalPages,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
        },
      }),
    );
  } catch (error) {
    boardControllerLogger.error(
      {
        err: error,
        workspaceId,
        userId,
      },
      "List boards failed",
    );
    throw error;
  }
});

const updateBoard = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const boardId = req.params["boardId"] || req.params["id"];
  const { name, description, backgroundColor, coverImageUrl, visibility } =
    req.body;
  const userId = requireUserId(req);
  try {
    const board = await BoardModel.findById(boardId);
    if (!board) {
      throw boardNotFoundError();
    }

    const workspace = await WorkspaceModel.findOne({
      _id: board.workspaceId,
      "members.userId": new Types.ObjectId(userId),
    });

    if (!workspace) {
      throw boardAccessDeniedError();
    }

    const member = workspace.members.find(
      (m) => m.userId.toString() === userId,
    );

    if (!member || member.role === "guest") {
      throw guestCannotModifyBoardError();
    }

    if (name !== undefined) board.name = name;
    if (description !== undefined) board.description = description;
    if (backgroundColor !== undefined) board.backgroundColor = backgroundColor;
    if (coverImageUrl !== undefined) board.coverImageUrl = coverImageUrl;
    if (visibility !== undefined) board.visibility = visibility;

    await board.save();

    // Invalidate the cached board-details payload so the next read is fresh.
    try {
      const cache = await getCacheClient();
      await cache.del(`board:${board._id}`);
    } catch (err) {
      boardControllerLogger.warn(
        { err, boardId: board._id },
        "Board cache invalidate failed",
      );
    }

    boardControllerLogger.info(
      {
        boardId: board._id,
        userId,
      },
      "Board updated",
    );

    return res.status(200).json(
      new ApiResponse(200, "Board updated successfully", {
        data: board,
      }),
    );
  } catch (error) {
    boardControllerLogger.error(
      {
        err: error,
        boardId: req.params["boardId"] || req.params["id"],
        userId,
      },
      "Update board failed",
    );
    throw error;
  }
});

const getBoardDetails = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = requireUserId(req);
  const boardId = req.params["boardId"] || req.params["id"];

  // 1. Fetch board
  const board = await BoardModel.findById(boardId).lean();
  if (!board) {
    throw boardNotFoundError();
  }

  // 2. Authorize BEFORE reading the cache. The cached payload is NOT
  //    user-scoped, so serving it before this check would leak the board
  //    (columns + cards) to a non-member who knows the boardId.
  const workspace = await WorkspaceModel.findOne({
    _id: board.workspaceId,
    "members.userId": new Types.ObjectId(userId),
  }).lean();

  if (!workspace) {
    throw boardAccessDeniedError();
  }

  // 3. Cache — safe now that membership is verified.
  const cacheKey = `board:${boardId}`;

  const cache = await getCacheClient();

  let cached: string | null = null;
  try {
    cached = await cache.get(cacheKey);
  } catch (err) {
    boardControllerLogger.warn({ err, boardId }, "Board cache read failed");
  }

  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }

  // 4. Fetch columns and cards in PARALLEL (both use indexes)
  const [columns, cards] = await Promise.all([
    ColumnModel.find({ boardId: board._id })
      .select("_id name orderIndex boardId workspaceId createdAt updatedAt")
      .sort({ orderIndex: 1 })
      .lean(),
    CardModel.find({
      boardId: board._id,
      isArchived: false,
    })
      .select(
        "_id title description orderIndex dueDate labels checklists columnId boardId workspaceId members isArchived createdAt updatedAt",
      )
      .sort({ orderIndex: 1 })
      .lean(),
  ]);

  // 5. Assemble response (fast in‑memory)
  const responseColumns = columns.map((col) => ({
    id: col._id,
    boardId: col.boardId,
    workspaceId: col.workspaceId,
    name: col.name,
    orderIndex: col.orderIndex,
    createdAt: col.createdAt,
    updatedAt: col.updatedAt,
    cards: cards
      .filter((card) => card.columnId.equals(col._id))
      .map((card) => ({
        id: card._id,
        columnId: card.columnId,
        boardId: card.boardId,
        workspaceId: card.workspaceId,
        title: card.title,
        description: card.description,
        orderIndex: card.orderIndex,
        dueDate: card.dueDate,
        labels: card.labels,
        checklists: card.checklists,
        members: card.members ?? [],
        isArchived: card.isArchived,
        createdAt: card.createdAt,
        updatedAt: card.updatedAt,
      })),
  }));

  boardControllerLogger.info(
    { boardId: board._id, workspaceId: board.workspaceId, userId },
    "Board details retrieved",
  );

  const response = new ApiResponse(200, "Fetched board details", {
    data: {
      id: board._id,
      workspaceId: board.workspaceId,
      name: board.name,
      description: board.description,
      backgroundColor: board.backgroundColor,
      coverImageUrl: board.coverImageUrl,
      visibility: board.visibility,
      createdAt: board.createdAt,
      updatedAt: board.updatedAt,
      columns: responseColumns,
    },
  });

  try {
    await cache.setEx(cacheKey, 60, JSON.stringify(response));
  } catch (err) {
    boardControllerLogger.warn({ err, boardId }, "Board cache write failed");
  }
  return res.status(200).json(response);
});

const deleteBoard = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = requireUserId(req);
  const boardId = req.params["boardId"] || req.params["id"];

  try {
    const board = await BoardModel.findById(boardId);

    if (!board) {
      throw boardNotFoundError();
    }

    // Verify workspace membership
    const workspace = await WorkspaceModel.findOne({
      _id: board.workspaceId,
      "members.userId": new Types.ObjectId(userId),
    });

    if (!workspace) {
      throw notWorkspaceMemberError();
    }

    const member = workspace.members.find(
      (m) => m.userId.toString() === userId,
    );

    if (!member || member.role === "guest") {
      throw guestCannotModifyBoardError();
    }

    // Cascade: a board owns its columns and cards.
    await Promise.all([
      ColumnModel.deleteMany({ boardId: board._id }),
      CardModel.deleteMany({ boardId: board._id }),
    ]);

    await board.deleteOne();

    // Drop the cached details payload.
    try {
      const cache = await getCacheClient();
      await cache.del(`board:${board._id}`);
    } catch (err) {
      boardControllerLogger.warn(
        { err, boardId: board._id },
        "Board cache invalidate failed",
      );
    }

    boardControllerLogger.info(
      { boardId: board._id, workspaceId: board.workspaceId, userId },
      "Board deleted",
    );

    return res.status(200).json(
      new ApiResponse(200, "Board deleted successfully", {
        data: { id: board._id },
      }),
    );
  } catch (error) {
    boardControllerLogger.error(
      { err: error, boardId, userId },
      "Delete board failed",
    );
    throw error;
  }
});

/**
 * POST /api/v1/boards/:boardId/share
 *
 * Share a board by inviting a user (by email) into the board's workspace.
 * Board access is workspace-scoped, so "sharing a board" means granting
 * workspace membership and notifying the invitee.
 */
const shareBoard = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const boardId = req.params["boardId"] || req.params["id"];
  const { email, role } = (req.validated?.body ?? req.body) as {
    email: string;
    role?: "member" | "guest";
  };
  const userId = requireUserId(req);

  const board = await BoardModel.findById(boardId);

  if (!board) {
    throw boardNotFoundError();
  }

  // Only an owner/admin of the board's workspace may share it.
  const workspace = await WorkspaceModel.findOne({
    _id: board.workspaceId,
    members: {
      $elemMatch: {
        userId: new Types.ObjectId(userId),
        role: { $in: ["owner", "admin"] },
      },
    },
  });

  if (!workspace) {
    throw boardAccessDeniedError();
  }

  const invitee = await UserModel.findOne({ email: email.toLowerCase().trim() })
    .select("_id fullName")
    .lean();

  if (!invitee) {
    throw userNotFoundError();
  }

  if (workspace.members.some((m) => m.userId.equals(invitee._id))) {
    throw userAlreadyWorkspaceMemberError();
  }

  const grantedRole = role ?? "member";

  workspace.members.push({ userId: invitee._id, role: grantedRole });
  await workspace.save();

  // Notify the invitee (NotificationSchema requires userId, workspaceId, type,
  // title and message — boardId is optional but set here for deep-linking).
  await NotificationModel.create({
    userId: invitee._id,
    actorId: new Types.ObjectId(userId),
    workspaceId: board.workspaceId,
    boardId: board._id,
    type: "BOARD_SHARED",
    title: "A board was shared with you",
    message: `${req.user?.fullName ?? "Someone"} shared “${board.name}” with you.`,
    channels: { inApp: true, email: false, push: false, sms: false },
  });

  await ActivityLogModel.create({
    workspaceId: board.workspaceId,
    boardId: board._id,
    userId: new Types.ObjectId(userId),
    actionType: "BOARD_SHARED",
    details: {
      boardId: board._id,
      inviteeId: invitee._id,
      role: grantedRole,
    },
  });

  boardControllerLogger.info(
    { boardId: board._id, userId, inviteeId: invitee._id, role: grantedRole },
    "Board shared",
  );

  return res.status(200).json(
    new ApiResponse(200, "Board shared successfully", {
      sharedWith: {
        userId: invitee._id.toString(),
        name: invitee.fullName,
        role: grantedRole,
      },
    }),
  );
});

export {
  createBoard,
  updateBoard,
  listBoards,
  getBoardDetails,
  deleteBoard,
  shareBoard,
};
