import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import {
  ActivityLogModel,
  BoardModel,
  CardModel,
  WorkspaceModel,
} from "../../../../infrastructure/db/mongoose/schemas";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { Types } from "mongoose";
import { cardControllerLogger } from "../../../../infrastructure/logging/childLogger";
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
import { cardNotFoundError } from "../../../../shared/errors/card/card";

const createCard = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { columnId, boardId, title, orderIndex } = req.body;
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

    const card = await CardModel.create({
      columnId: new Types.ObjectId(columnId),
      boardId: board._id,
      title,
      orderIndex: orderIndex || 0,
      checklists: [],
      labels: [],
    });

    // Log Activity
    await ActivityLogModel.create({
      boardId: board._id,
      userId: new Types.ObjectId(userId),
      actionType: "CARD_CREATE",
      details: { cardId: card._id, cardTitle: card.title },
    });

    cardControllerLogger.info(
      {
        cardId: card._id,
        boardId,
        columnId,
        userId,
      },
      "Card created",
    );

    return res.status(201).json(
      new ApiResponse(201, "Card created successfully", {
        data: {
          id: card._id,
          title: card.title,
          columnId: card.columnId,
          orderIndex: card.orderIndex,
          checklists: card.checklists,
          labels: card.labels,
        },
      }),
    );
  } catch (error) {
    cardControllerLogger.error(
      {
        err: error,
        boardId,
        userId,
      },
      "Failed to create card",
    );
    throw error;
  }
});

const updateCard = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const cardId = req.params["cardId"] || req.params["id"];
  const { title, columnId } = req.body;
  const userId = requireUserId(req);

  try {
    const card = await CardModel.findById(cardId);

    if (!card) {
      throw cardNotFoundError();
    }

    const board = await BoardModel.findById(card.boardId);

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

    // Verify member permissions

    const member = workspace.members.find(
      (m) => m.userId.toString() === userId,
    );

    if (!member || member.role === "guest") {
      throw guestCannotModifyBoardError();
    }

    // Update only supplied fields
    if (title !== undefined) {
      card.title = title;
    }

    if (columnId !== undefined) {
      card.columnId = new Types.ObjectId(columnId);
    }

    await card.save();

    // Log activity
    await ActivityLogModel.create({
      boardId: board._id,
      userId: new Types.ObjectId(userId),
      actionType: "CARD_UPDATE",
      details: {
        cardId: card._id,
        cardTitle: card.title,
      },
    });

    cardControllerLogger.info(
      {
        cardId: card._id,
        boardId: board._id,
        userId,
      },
      "Card updated",
    );

    return res.status(200).json(
      new ApiResponse(200, "Card updated successfully", {
        data: {
          id: card._id,
          title: card.title,
          columnId: card.columnId,
          orderIndex: card.orderIndex,
          checklists: card.checklists,
          labels: card.labels,
        },
      }),
    );
  } catch (error) {
    cardControllerLogger.error(
      {
        err: error,
        cardId: cardId,
        userId,
      },
      "Failed to update card",
    );

    throw error;
  }
});

const moveCard = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const cardId = req.params["cardId"] || req.params["id"];
  const { targetColumnId, targetOrderIndex } = req.body;
  const userId = requireUserId(req);
  try {
    const card = await CardModel.findById(cardId);
    if (!card) {
      throw cardNotFoundError();
    }

    const board = await BoardModel.findById(card.boardId);
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

    const sourceCol = card.columnId;
    card.columnId = new Types.ObjectId(targetColumnId);
    card.orderIndex = targetOrderIndex;
    await card.save();

    // Log Activity
    await ActivityLogModel.create({
      boardId: board._id,
      userId: new Types.ObjectId(userId),
      actionType: "CARD_MOVE",
      details: {
        cardId: card._id,
        cardTitle: card.title,
        sourceColumnId: sourceCol,
        targetColumnId,
      },
    });

    cardControllerLogger.info(
      {
        cardId: card._id,
        boardId: req.params,
        sourceColumnId: sourceCol,
        targetColumnId: targetColumnId,
        userId,
      },
      "Card moved",
    );
    return res
      .status(200)
      .json(new ApiResponse(200, "Card moved successfully.", { data: null }));
  } catch (error) {
    cardControllerLogger.error(
      {
        err: error,
        userId,
        targetColumnId,
      },
      "Failed to move card",
    );
    throw error;
  }
});

const deleteCard = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const cardId = req.params["cardId"] || req.params["id"];
  const userId = requireUserId(req);

  try {
    const card = await CardModel.findById(cardId);

    if (!card) {
      throw cardNotFoundError();
    }

    const board = await BoardModel.findById(card.boardId);

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

    await card.deleteOne();

    cardControllerLogger.info(
      { cardId: card._id, boardId: board._id, userId },
      "Card deleted",
    );

    return res.status(200).json(
      new ApiResponse(200, "Card deleted successfully", {
        data: { id: card._id },
      }),
    );
  } catch (error) {
    cardControllerLogger.error(
      { err: error, cardId, userId },
      "Failed to delete card",
    );
    throw error;
  }
});

export { createCard, moveCard, updateCard, deleteCard };
