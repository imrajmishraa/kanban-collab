import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { BoardModel, CardModel, ColumnModel, WorkspaceModel } from "../../../../infrastructure/db/mongoose/schemas";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { Types } from "mongoose";

import { boardControllerLogger } from "../../../../infrastructure/logging/childLogger";
import { notWorkspaceMemberError, workspaceIdRequiredError } from "../../../../shared/errors/workspace/workspace";
import { boardNotFoundError, boardAccessDeniedError, guestCannotModifyBoardError } from "../../../../shared/errors/board/board";



const createBoard = asyncHandler(async (req: AuthenticatedRequest, res ) => {
  const { workspaceId, name, backgroundColor, visibility } = req.body;
  const userId = req.user!.userId;
  try {

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
          throw guestCannotModifyBoardError();
      }

      const board = await BoardModel.create({
        workspaceId: new Types.ObjectId(workspaceId as string),
        name,
        backgroundColor: backgroundColor || "#2b6cb0",
        visibility: visibility || 'workspace'
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
          new ApiResponse(201, 'Board created successfully', {
              data: board
          })
      )
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
  const { workspaceId } = req.query;
  const userId = req.user!.userId;  
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

      const boards = await BoardModel.find({
        workspaceId: new Types.ObjectId(workspaceId as string),
      });


      boardControllerLogger.info(
        {
          workspaceId,
          userId,
          boardCount: boards.length,
        },
        "Boards listed",
      );
      return res.status(200).json(
        new ApiResponse(200, "fetched listBoards successfully", {
          data: { boards },
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
  const boardId = req.params.boardId || req.params.id;
  const { name, description, backgroundColor, coverImageUrl, visibility } = req.body;
  const userId = req.user!.userId;
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
        boardId: req.params.boardId || req.params.id,
        userId,
      },
      "Update board failed",
    );
    throw error;
  }
});

const getBoardDetails = asyncHandler(
  async (req: AuthenticatedRequest, res) => {
     const userId = req.user!.userId;
      const boardId = req.params.boardId || req.params.id;
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
        throw boardAccessDeniedError();
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
                        labels: card.labels,
                        checkLists: card.checklists
                    }))
        };
      });

      boardControllerLogger.info(
        {
          boardId: board._id,
          workspaceId: board.workspaceId,
          userId,
        },
        "Board details retrieved",
      );
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
        boardControllerLogger.error(
          {
            err: error,
            boardId: req.params.boardId || req.params.id,
            userId,
          },
          "Get board details failed",
        );
        throw error;
    }
  },
);

export { createBoard, updateBoard, listBoards, getBoardDetails };
