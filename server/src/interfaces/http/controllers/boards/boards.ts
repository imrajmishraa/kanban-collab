import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { BoardModel, CardModel, ColumnModel, WorkspaceModel } from "../../../../infrastructure/db/mongoose/schemas";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { Types } from "mongoose";
import { logger } from "../../../../infrastructure/logging/logger";
import { notWorkspaceMemberError, workspaceIdRequiredError } from "../../../../shared/errors/workspace/workspace";
import { boardNotFoundError, boardWorkspaceAccessDeniedError, guestNotCreateBoards } from "../../../../shared/errors/board/board";
import { internalServerError } from "../../../../shared/errors/handler/custom";


const createBoard = asyncHandler(async (req: AuthenticatedRequest, res ) => {
  try {
    const { workspaceId, name, backgroundColor, visibility } = req.body;
    const userId = req.user!.userId;
  
    // Verify workspace membership
    const workspace = await WorkspaceModel.findOne({
      _id: workspaceId,
      "members.userId": new Types.ObjectId(userId),
    });
  
    if(!workspace) {
      throw notWorkspaceMemberError();
    }
  
      const member = workspace.members.find(
        (m) => m.userId.toString() === userId,
      );
  
      if(!member|| member.role === 'guest') {
          throw guestNotCreateBoards();
      }
  
      const board = await BoardModel.create({
        workspaceId: new Types.ObjectId(userId),
        name,
        backgroundColor: backgroundColor || "#2b6cb0",
        visibility: visibility || 'workspace'
      });
  
      logger.info({ boardId: board._id, workspaceId }, "Board created");
      return res.status(201).json(
          new ApiResponse(201, 'Board created successfully', {
              data: board
          })
      )
  } catch (error) {
    logger.error({ err: error }, "Create board error");
    throw internalServerError();
  }
});

const listBoards = asyncHandler(async (req: AuthenticatedRequest, res) => {
    try {
      const { workspaceId } = req.query;
      const userId = req.user!.userId;

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

      const boards = await BoardModel.find({
        workspaceId: new Types.ObjectId(workspaceId as string),
      });


      return res.status(200).json(
        new ApiResponse(200, "fetched listBoards successfully", {
          data: { boards },
        }),
      );
    } catch (error) {
        logger.error({ err: error }, "List boards error");
        throw internalServerError();
    }
});

const getBoardDetails = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
    try {
      const { id } = req.params;
      const userId = req.user!.userId;

      const board = await BoardModel.findById(id);
      if (!board) {
        throw boardNotFoundError();
      }

      // Verify workspace membership
      const workspace = await WorkspaceModel.findOne({
        _id: board.workspaceId,
        "members.userId": new Types.ObjectId(userId),
      });


      if (!workspace) {
        throw boardWorkspaceAccessDeniedError();
      }

      const columns = await ColumnModel.find({ boardId: board._id }).sort({ orderIndex: 1});
      const cards = await CardModel.find({ boardId: board._id, isArchived: false }).sort({ orderIndex: 1 });

      const responseColumns = columns.map(col => {
        return {
            id: col._id,
            name: col.name,
            orderIndex: col.orderIndex,
            cards: cards
                    .filter( card => card.columnId.equals(col._id))
                    .map(card => ({
                        id: card._id,
                        title: card.title,
                        description: card.description,
                        orderIndex: card.orderIndex,
                        dueDate: card.dueDate,
                        lebels: card.labels,
                        checkLists: card.checklists
                    }))
        };
      });

      return res.status(200).json(
        new ApiResponse(200, "Fetched board details", {
          data: {
            id: board.id,
            name: board.name,
            description: board.description,
            backgroundColor: board.backgroundColor,
            columns: responseColumns,
          },
        }),
      );
    } catch (error) {
        logger.error({ err: error }, "Get board details error");
        throw internalServerError();
    }
  },
);

export { createBoard, listBoards, getBoardDetails };