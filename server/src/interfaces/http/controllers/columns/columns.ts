import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { ColumnModel, BoardModel, WorkspaceModel } from "../../../../infrastructure/db/mongoose/schemas";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { Types } from "mongoose";
import { columnControllerLogger } from "../../../../infrastructure/logging/childLogger";

import { boardNotFoundError, guestCannotModifyBoardError } from "../../../../shared/errors/board/board";
import { notWorkspaceMemberError } from "../../../../shared/errors/workspace/workspace";


const createColumn = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { boardId, name, orderIndex } = req.body;
  const userId = req.user!.userId;
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

    const member = workspace.members.find(m => m.userId.toString() === userId);

     if (!member || member.role === 'guest') {
        throw guestCannotModifyBoardError();
     }

     const column = await ColumnModel.create({
       boardId: board._id,
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
        new ApiResponse(201, 'Column created successfully', {
            data: {
                id: column._id,
                boardId: column.boardId,
                name: column.name,
                orderIndex: column.orderIndex
            }
        })
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

export { createColumn };
