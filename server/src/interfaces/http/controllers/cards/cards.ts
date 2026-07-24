import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { ActivityLogModel, BoardModel, CardModel, WorkspaceModel } from "../../../../infrastructure/db/mongoose/schemas";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { Types } from "mongoose";
import { logger } from "../../../../infrastructure/logging/logger";
import { internalServerError } from "../../../../shared/errors/handler/custom";
import { boardNotFoundError, guestNotCreateBoards } from "../../../../shared/errors/board/board";
import { notWorkspaceMemberError } from "../../../../shared/errors/workspace/workspace";
import { cardNotFoundError } from "../../../../shared/errors/card/card";


const createCard = asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const { columnId, boardId, title, orderIndex } = req.body;
      const userId = req.user!.userId;

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
        throw guestNotCreateBoards();
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

      logger.info({ cardId: card._id, boardId }, "Card created");

      return res.status(201).json(
        new ApiResponse(201, "Card created successfully", {
          data: {
            id: card._id,
            title: card.title,
            columnId: card.columnId,
            orderIndex: card.orderIndex,
            checklists: card.checklists,
            labels: card.labels,
          }
        }),
      );
    } catch (error) {
      logger.error("Create card error:", error);
      throw internalServerError();
    }
});

const moveCard = asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const { targetColumnId, targetOrderIndex } = req.body;
      const userId = req.user!.userId;

      const card = await CardModel.findById(id);
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
        throw guestNotCreateBoards();
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

      logger.info({ cardId: card._id, targetColumnId }, "Card moved");
      return res
        .status(200)
        .json(new ApiResponse(200, "Card moved successfully.", { data: null }));
    } catch (error) {
      logger.error("Move card error:", error);
      throw internalServerError();
    }
});


export { createCard, moveCard };
