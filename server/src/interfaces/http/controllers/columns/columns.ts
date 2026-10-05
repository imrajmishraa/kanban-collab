import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import {
  CardModel,
  ColumnModel,
  BoardModel,
  WorkspaceModel,
} from "../../../../infrastructure/db/mongoose/schemas";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { Types } from "mongoose";
import { columnControllerLogger } from "../../../../infrastructure/logging/childLogger";
import { ApiError } from "../../../../shared/utils/ApiError";

/** Guard instead of `req.user!` — see the dashboard controller for rationale. */
function requireUserId(req: AuthenticatedRequest): string {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required.");
  }
  return req.user.userId;
}

import {
  boardNotFoundError,
  guestCannotModifyBoardError,
} from "../../../../shared/errors/board/board";
import { notWorkspaceMemberError } from "../../../../shared/errors/workspace/workspace";
import {
  columnNotEmptyError,
  columnNotFoundError,
} from "../../../../shared/errors/column/column";

const createColumn = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { boardId, name, orderIndex } = req.body;
  const userId = requireUserId(req);
  try {
    const board = await BoardModel.findById(boardId);

    if (!board) {
      throw boardNotFoundError();
    }

    // Verify membership
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

    const column = await ColumnModel.create({
      boardId: board._id,
      // The schema requires workspaceId — without it, create() fails
      // validation. Derive it from the board that was just authorized.
      workspaceId: board.workspaceId,
      name,
      orderIndex: orderIndex || 0,
    });

    columnControllerLogger.info(
      {
        columnId: column._id,
        boardId,
        userId,
      },
      "Column created",
    );

    return res.status(201).json(
      new ApiResponse(201, "Column created successfully", {
        data: {
          id: column._id,
          boardId: column.boardId,
          name: column.name,
          orderIndex: column.orderIndex,
        },
      }),
    );
  } catch (error) {
    columnControllerLogger.error(
      {
        err: error,
        boardId,
        userId,
      },
      "Failed to create column",
    );
    throw error;
  }
});

const deleteColumn = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const columnId = req.params["columnId"] || req.params["id"];
  const userId = requireUserId(req);

  try {
    const column = await ColumnModel.findById(columnId);

    if (!column) {
      throw columnNotFoundError();
    }

    const board = await BoardModel.findById(column.boardId);

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

    // Refuse to delete a column that still holds cards — clear it first.
    const cardCount = await CardModel.countDocuments({ columnId: column._id });

    if (cardCount > 0) {
      throw columnNotEmptyError();
    }

    await column.deleteOne();

    columnControllerLogger.info(
      { columnId: column._id, boardId: board._id, userId },
      "Column deleted",
    );

    return res.status(200).json(
      new ApiResponse(200, "Column deleted successfully", {
        data: { id: column._id },
      }),
    );
  } catch (error) {
    columnControllerLogger.error(
      { err: error, columnId, userId },
      "Failed to delete column",
    );
    throw error;
  }
});

const updateColumn = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const columnId = req.params["columnId"] || req.params["id"];
  const { name, orderIndex } = req.body;
  const userId = requireUserId(req);

  try {
    const column = await ColumnModel.findById(columnId);

    if (!column) {
      throw columnNotFoundError();
    }

    const board = await BoardModel.findById(column.boardId);

    if (!board) {
      throw boardNotFoundError();
    }

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

    if (name !== undefined) column.name = name;
    if (orderIndex !== undefined) column.orderIndex = orderIndex;

    await column.save();

    columnControllerLogger.info(
      { columnId: column._id, boardId: board._id, userId },
      "Column updated",
    );

    return res.status(200).json(
      new ApiResponse(200, "Column updated successfully", {
        data: {
          id: column._id,
          boardId: column.boardId,
          workspaceId: column.workspaceId,
          name: column.name,
          orderIndex: column.orderIndex,
        },
      }),
    );
  } catch (error) {
    columnControllerLogger.error(
      { err: error, columnId, userId },
      "Failed to update column",
    );
    throw error;
  }
});

export { createColumn, updateColumn, deleteColumn };
