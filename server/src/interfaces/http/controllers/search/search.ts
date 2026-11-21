import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { CardModel } from "../../../../infrastructure/db/mongoose/schemas";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { ApiError } from "../../../../shared/utils/ApiError";
import { searchControllerLogger } from "../../../../infrastructure/logging/childLogger";

/** Guard instead of `req.user!` — see the dashboard controller for rationale. */
function requireUserId(req: AuthenticatedRequest): string {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required.");
  }
  return req.user.userId;
}

import { boardIdAndQueryParametersRequiredError } from "../../../../shared/errors/board/board";
import { loadReadableBoard } from "../../../../application/boards/readableBoard";

const searchCards = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { boardId, q } = req.query;
  const userId = requireUserId(req);
  try {
    if (!boardId || !q) {
      throw boardIdAndQueryParametersRequiredError();
    }

    /* Search is a read of the board, so it carries the same visibility rule as
       `GET /boards/:id`. Membership alone let a guest search the cards of a
       `private` board whose contents they could not open — the card titles and
       ids came back anyway. */
    const board = await loadReadableBoard(boardId as string, userId);

    // Search database using text index
    const cards = await CardModel.find({
      boardId: board.id,
      isArchived: false,
      $text: { $search: q as string },
    });

    searchControllerLogger.info(
      {
        userId,
        workspaceId: board.workspaceId,
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
        },
      }),
    );
  } catch (error) {
    searchControllerLogger.error({ err: error }, "Failed to search cards");
    throw error;
  }
});

export { searchCards };
