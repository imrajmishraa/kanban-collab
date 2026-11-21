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

import { loadReadableBoard } from "../../../../application/boards/readableBoard";

/** What `searchCardsQuerySchema` guarantees by the time the handler runs. */
interface SearchCardsQuery {
  boardId: string;
  q: string;
  limit: number;
}

const searchCards = asyncHandler(async (req: AuthenticatedRequest, res) => {
  /* Validated by `searchCardsQuerySchema`, which also writes the parsed values
     back onto `req.query` — so `limit` is a number with a default, not a string
     or undefined. */
  const { boardId, q, limit } = req.query as unknown as SearchCardsQuery;
  const userId = requireUserId(req);
  try {
    /* Search is a read of the board, so it carries the same visibility rule as
       `GET /boards/:id`. Membership alone let a guest search the cards of a
       `private` board whose contents they could not open — the card titles and
       ids came back anyway. */
    const board = await loadReadableBoard(boardId, userId);

    /* Bounded, and only the three fields the palette renders: the endpoint used
       to return every match in full, so one query could ship a whole board. */
    const cards = await CardModel.find({
      boardId: board.id,
      isArchived: false,
      $text: { $search: q },
    })
      .select("_id title columnId")
      .limit(limit);

    searchControllerLogger.info(
      {
        userId,
        workspaceId: board.workspaceId,
        query: q,
        limit,
        resultCount: cards.length,
      },
      "Card search completed",
    );

    return res.status(200).json(
      new ApiResponse(200, "Card search results", {
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
