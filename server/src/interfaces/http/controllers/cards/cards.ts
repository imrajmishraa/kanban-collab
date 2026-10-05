import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import {
  ActivityLogModel,
  BoardModel,
  CardModel,
  ColumnModel,
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

/**
 * Validated body for `POST /cards`, as produced by `createCardSchema`.
 *
 * The route runs `validateSchema`, which stores its parsed output on
 * `req.validated.body` and intentionally leaves `req.body` untouched. Read
 * from the validated copy so schema transforms (e.g. `title` trimming)
 * actually apply; fall back to `req.body` defensively.
 */
interface CreateCardBody {
  columnId: string;
  boardId: string;
  title: string;
  description?: string;
  dueDate?: string;
  members?: string[];
  labels?: string[];
  orderIndex?: number;
}

const createCard = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const {
    columnId,
    boardId,
    title,
    description,
    dueDate,
    members,
    labels,
    orderIndex,
  } = (req.validated?.body ?? req.body) as CreateCardBody;
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

    // The column must belong to the board it is being added to, otherwise a
    // client could graft a card onto an unrelated board's column.
    const column = await ColumnModel.findById(columnId);
    if (!column || column.boardId.toString() !== board._id.toString()) {
      throw ApiError.badRequest("Column does not belong to this board.");
    }

    const card = await CardModel.create({
      // CardSchema requires workspaceId — derive it from the board that was
      // just authorized rather than trusting a client-supplied value.
      workspaceId: board.workspaceId,
      columnId: new Types.ObjectId(columnId),
      boardId: board._id,
      title,
      description: description ?? "",
      dueDate: dueDate ? new Date(dueDate) : undefined,
      members: (members ?? []).map((id) => new Types.ObjectId(id)),
      orderIndex: orderIndex ?? 0,
      checklists: [],
      labels: labels ?? [],
    });

    // Log Activity
    await ActivityLogModel.create({
      // ActivityLogSchema requires workspaceId — derive it from the board.
      workspaceId: board.workspaceId,
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
          description: card.description,
          columnId: card.columnId,
          boardId: card.boardId,
          workspaceId: card.workspaceId,
          dueDate: card.dueDate,
          members: card.members,
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
      // ActivityLogSchema requires workspaceId — derive it from the board.
      workspaceId: board.workspaceId,
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
      // ActivityLogSchema requires workspaceId — derive it from the board.
      workspaceId: board.workspaceId,
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
