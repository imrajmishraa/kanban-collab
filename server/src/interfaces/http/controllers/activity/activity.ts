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

export { listBoardActivity };
