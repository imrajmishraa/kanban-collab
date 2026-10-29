import { Types } from "mongoose";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { ApiError } from "../../../../shared/utils/ApiError";
import {
  ActivityLogModel,
  BoardModel,
  UserModel,
  WorkspaceModel,
} from "../../../../infrastructure/db/mongoose/schemas";
import { activityControllerLogger } from "../../../../infrastructure/logging/childLogger";
import { createActivityMessage } from "../../../../shared/utils/activityMessage";
import { boardNotFoundError } from "../../../../shared/errors/board/board";
import { notWorkspaceMemberError } from "../../../../shared/errors/workspace/workspace";

function requireUserId(req: AuthenticatedRequest): string {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required.");
  }
  return req.user.userId;
}

/**
 * GET /api/v1/boards/:boardId/activity
 *
 * The read side of `ActivityLogModel`, which the card/column/board controllers
 * already write but nothing surfaced. Newest first, capped by `limit`.
 */
const listBoardActivity = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    const userId = requireUserId(req);
    const boardId = req.params["boardId"];
    const limit = Math.min(Math.max(Number(req.query["limit"]) || 30, 1), 100);

    const board = await BoardModel.findById(boardId)
      .select("_id workspaceId")
      .lean();

    if (!board) {
      throw boardNotFoundError();
    }

    // Reading activity is allowed for any member, guests included.
    const workspace = await WorkspaceModel.findOne({
      _id: board.workspaceId,
      "members.userId": new Types.ObjectId(userId),
    })
      .select("_id")
      .lean();

    if (!workspace) {
      throw notWorkspaceMemberError();
    }

    const entries = await ActivityLogModel.find({ boardId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    const actorIds = [...new Set(entries.map((e) => e.userId.toString()))];
    const actors = await UserModel.find({ _id: { $in: actorIds } })
      .select("fullName avatarUrl")
      .lean();
    const actorById = new Map(actors.map((a) => [a._id.toString(), a]));

    activityControllerLogger.info(
      { userId, boardId, count: entries.length },
      "Board activity listed",
    );

    return res.status(200).json(
      new ApiResponse(200, "Board activity fetched successfully", {
        activity: entries.map((entry) => {
          const actor = actorById.get(entry.userId.toString());
          return {
            id: entry._id.toString(),
            boardId: entry.boardId.toString(),
            userId: entry.userId.toString(),
            actorName: actor?.fullName ?? "Unknown",
            actorAvatarUrl: actor?.avatarUrl ?? null,
            actionType: entry.actionType,
            details: entry.details,
            createdAt: entry.createdAt,
          };
        }),
      }),
    );
  },
);

/**
 * GET /api/v1/activity
 *
 * Every activity row across the workspaces the caller belongs to, newest
 * first, cursor paginated. The dashboard used to ship a fixed slice of eight
 * inside its own payload; this lets the feed page without refetching the whole
 * dashboard.
 */
const listMyActivity = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = requireUserId(req);
  const userObjectId = new Types.ObjectId(userId);

  const limit = Math.min(Math.max(Number(req.query["limit"]) || 6, 1), 50);
  const cursor = req.query["cursor"];

  const workspaces = await WorkspaceModel.find({
    "members.userId": userObjectId,
  })
    .select("_id name")
    .lean();

  if (workspaces.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, "Activity fetched successfully", {
        activity: [],
        nextCursor: null,
      }),
    );
  }

  const workspaceIds = workspaces.map((workspace) => workspace._id);
  const workspaceNameById = new Map(
    workspaces.map((workspace) => [workspace._id.toString(), workspace.name]),
  );

  const entries = await ActivityLogModel.find({
    workspaceId: { $in: workspaceIds },
    ...(typeof cursor === "string" && Types.ObjectId.isValid(cursor)
      ? { _id: { $lt: new Types.ObjectId(cursor) } }
      : {}),
  })
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean();

  const hasMore = entries.length > limit;
  const page = entries.slice(0, limit);

  const [actors, boards] = await Promise.all([
    UserModel.find({
      _id: { $in: [...new Set(page.map((entry) => entry.userId))] },
    })
      .select("fullName avatarUrl")
      .lean(),
    BoardModel.find({
      _id: { $in: [...new Set(page.map((entry) => entry.boardId))] },
    })
      .select("name")
      .lean(),
  ]);

  const actorById = new Map(actors.map((a) => [a._id.toString(), a]));
  const boardNameById = new Map(
    boards.map((board) => [board._id.toString(), board.name]),
  );

  return res.status(200).json(
    new ApiResponse(200, "Activity fetched successfully", {
      activity: page.map((entry) => {
        const actor = actorById.get(entry.userId.toString());
        const boardName = boardNameById.get(entry.boardId.toString());

        return {
          id: entry._id.toString(),
          boardId: entry.boardId.toString(),
          workspaceId: entry.workspaceId.toString(),
          workspaceName:
            workspaceNameById.get(entry.workspaceId.toString()) ?? null,
          boardName: boardName ?? null,
          userId: entry.userId.toString(),
          actorName: actor?.fullName ?? "Unknown member",
          actorAvatarUrl: actor?.avatarUrl ?? null,
          actionType: entry.actionType,
          message: createActivityMessage(
            entry.actionType,
            entry.details,
            boardName,
          ),
          details: entry.details,
          createdAt: entry.createdAt,
        };
      }),
      nextCursor: hasMore
        ? (page[page.length - 1]?._id.toString() ?? null)
        : null,
    }),
  );
});

export { listBoardActivity, listMyActivity };
