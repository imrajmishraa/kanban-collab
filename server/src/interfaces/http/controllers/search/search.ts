import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { WorkspaceModel, BoardModel, CardModel } from "../../../../infrastructure/db/mongoose/schemas";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { Types } from "mongoose";
import { searchControllerLogger } from "../../../../infrastructure/logging/childLogger";

import { forbiddenWorkspaceError } from "../../../../shared/errors/fileUpload/fileUpload";
import { boardIdAndQueryParametersRequiredError, boardNotFoundError } from "../../../../shared/errors/board/board";


const searchCards = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { boardId, q } = req.query;
  const userId = req.user!.userId;
    try {
      if (!boardId || !q) {
        throw boardIdAndQueryParametersRequiredError();
      }

      const board = await BoardModel.findById(boardId as string);
      if (!board) {
        throw boardNotFoundError();
      }

      // Verify membership
      const workspace = await WorkspaceModel.findOne({
        _id: board.workspaceId,
        "members.userId": new Types.ObjectId(userId),
      });
      if (!workspace) {
        throw forbiddenWorkspaceError();
      }

      // Search database using text index
      const cards = await CardModel.find({
        boardId: board._id,
        isArchived: false,
        $text: { $search: q as string },
      });

      searchControllerLogger.info(
        {
          userId,
          workspaceId: workspace._id,
          query: q,
          resultCount: cards.length,
        },
        "Card search completed",
      );
      
      return res.status(200).json(
        new ApiResponse(200, "result..", {
          data: {
            cards: cards.map((c) => ({
              id: c._id,
              title: c.title,
              columnId: c.columnId,
            })),
          }
        }),
      );
    } catch (error) {
      searchControllerLogger.error({ err: error }, "Failed to search cards");
      throw error;
    }
});


export { searchCards };
