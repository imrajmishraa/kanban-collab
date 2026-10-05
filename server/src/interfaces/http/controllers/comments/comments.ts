import { Types } from "mongoose";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { ApiError } from "../../../../shared/utils/ApiError";
import {
  ActivityLogModel,
  CardModel,
  CommentModel,
  UserModel,
  WorkspaceModel,
} from "../../../../infrastructure/db/mongoose/schemas";
import { commentControllerLogger } from "../../../../infrastructure/logging/childLogger";
import { cardNotFoundError } from "../../../../shared/errors/card/card";
import { notWorkspaceMemberError } from "../../../../shared/errors/workspace/workspace";
import { guestCannotModifyBoardError } from "../../../../shared/errors/board/board";

/** Guard instead of `req.user!` — see the dashboard controller for rationale. */
function requireUserId(req: AuthenticatedRequest): string {
  if (!req.user) {
    throw ApiError.unauthorized("Authentication required.");
  }
  return req.user.userId;
}

interface CardContext {
  card: {
    _id: Types.ObjectId;
    boardId: Types.ObjectId;
    workspaceId: Types.ObjectId;
  };
  role: string;
}

/**
 * Load a card and confirm the caller is a member of its workspace.
 *
 * The card carries `workspaceId`, so the membership check needs no board
 * round-trip — one query instead of two.
 */
async function loadCardContext(
  cardId: string,
  userId: string,
): Promise<CardContext> {
  const card = await CardModel.findById(cardId)
    .select("_id boardId workspaceId")
    .lean();

  if (!card) {
    throw cardNotFoundError();
  }

  const workspace = await WorkspaceModel.findOne({
    _id: card.workspaceId,
    "members.userId": new Types.ObjectId(userId),
  })
    .select("members")
    .lean();

  if (!workspace) {
    throw notWorkspaceMemberError();
  }

  const member = workspace.members.find((m) => m.userId.toString() === userId);

  if (!member) {
    throw notWorkspaceMemberError();
  }

  return {
    card: {
      _id: card._id,
      boardId: card.boardId,
      workspaceId: card.workspaceId,
    },
    role: member.role,
  };
}

function serializeComment(
  comment: {
    _id: Types.ObjectId;
    cardId: Types.ObjectId;
    userId: Types.ObjectId;
    text: string;
    createdAt: Date;
    updatedAt: Date;
  },
  author: { fullName?: string; avatarUrl?: string } | undefined,
) {
  return {
    id: comment._id.toString(),
    cardId: comment.cardId.toString(),
    userId: comment.userId.toString(),
    authorName: author?.fullName ?? "Unknown",
    authorAvatarUrl: author?.avatarUrl ?? null,
    text: comment.text,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
  };
}

/** GET /api/v1/cards/:cardId/comments */
const listComments = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = requireUserId(req);
  // `noUncheckedIndexedAccess` types the indexed read as `string | undefined`;
  // the route + `validateSchema` guarantee the param, so narrow it here.
  const { cardId } = req.params as { cardId: string };

  await loadCardContext(cardId, userId);

  const comments = await CommentModel.find({ cardId })
    .sort({ createdAt: 1 })
    .lean();

  // Resolve authors in one query rather than N.
  const authorIds = [...new Set(comments.map((c) => c.userId.toString()))];
  const authors = await UserModel.find({ _id: { $in: authorIds } })
    .select("fullName avatarUrl")
    .lean();
  const authorById = new Map(authors.map((a) => [a._id.toString(), a]));

  commentControllerLogger.info(
    { userId, cardId, count: comments.length },
    "Comments listed",
  );

  return res.status(200).json(
    new ApiResponse(200, "Comments fetched successfully", {
      comments: comments.map((c) =>
        serializeComment(c, authorById.get(c.userId.toString())),
      ),
    }),
  );
});

/** POST /api/v1/cards/:cardId/comments */
const createComment = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = requireUserId(req);
  const { cardId } = req.params as { cardId: string };

  // Prefer the validated body so the schema's `trim` actually applies.
  const { text } = (req.validated?.body ?? req.body) as { text: string };

  const { card, role } = await loadCardContext(cardId, userId);

  if (role === "guest") {
    throw guestCannotModifyBoardError();
  }

  const comment = await CommentModel.create({
    workspaceId: card.workspaceId,
    cardId: card._id,
    userId: new Types.ObjectId(userId),
    text,
  });

  // ActivityLogSchema requires workspaceId — derive it from the card.
  await ActivityLogModel.create({
    workspaceId: card.workspaceId,
    boardId: card.boardId,
    userId: new Types.ObjectId(userId),
    actionType: "COMMENT_ADD",
    details: {
      cardId: card._id,
      commentId: comment._id,
      preview: text.slice(0, 80),
    },
  });

  commentControllerLogger.info(
    { userId, cardId, commentId: comment._id },
    "Comment created",
  );

  return res.status(201).json(
    new ApiResponse(201, "Comment created successfully", {
      // `exactOptionalPropertyTypes` rejects `{ fullName: string | undefined }`
      // for an optional `fullName?: string` — build the object conditionally.
      comment: serializeComment(
        comment,
        req.user ? { fullName: req.user.fullName } : undefined,
      ),
    }),
  );
});

/** DELETE /api/v1/comments/:commentId */
const deleteComment = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = requireUserId(req);
  const commentId = req.params["commentId"];

  const comment = await CommentModel.findById(commentId);

  if (!comment) {
    throw ApiError.notFound("Comment not found.");
  }

  const { card, role } = await loadCardContext(
    comment.cardId.toString(),
    userId,
  );

  const isAuthor = comment.userId.toString() === userId;
  const canModerate = role === "owner" || role === "admin";

  if (!isAuthor && !canModerate) {
    throw ApiError.forbidden("You can only delete your own comments.");
  }

  await comment.deleteOne();

  await ActivityLogModel.create({
    workspaceId: card.workspaceId,
    boardId: card.boardId,
    userId: new Types.ObjectId(userId),
    actionType: "COMMENT_DELETE",
    details: { cardId: card._id, commentId: comment._id },
  });

  commentControllerLogger.info(
    { userId, commentId, cardId: card._id },
    "Comment deleted",
  );

  return res.status(200).json(
    new ApiResponse(200, "Comment deleted successfully", {
      comment: { id: comment._id.toString() },
    }),
  );
});

export { listComments, createComment, deleteComment };
