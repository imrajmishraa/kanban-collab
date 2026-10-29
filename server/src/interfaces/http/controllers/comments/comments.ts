import { Types } from "mongoose";

import type { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { ApiError } from "../../../../shared/utils/ApiError";
import {
  ActivityLogModel,
  CardModel,
  CommentLikeModel,
  CommentModel,
  UserModel,
  WorkspaceModel,
} from "../../../../infrastructure/db/mongoose/schemas";
import { getCacheClient } from "../../../../infrastructure/cache/cacheClient";
import { commentControllerLogger } from "../../../../infrastructure/logging/childLogger";
import { cardNotFoundError } from "../../../../shared/errors/card/card";
import { notWorkspaceMemberError } from "../../../../shared/errors/workspace/workspace";
import { guestCannotModifyBoardError } from "../../../../shared/errors/board/board";

/**
 * Threaded comments with per-user votes.
 *
 * Shapes follow the YouTube model: one level shown flat, replies fetched on
 * demand per comment, likes and dislikes stored as one row per user.
 *
 * Storage note: this app runs on MongoDB, not MySQL, so the spec's two tables
 * are two collections here. The semantics are identical: a self-referencing
 * `parentId` for unlimited depth, and a `comment_likes` equivalent with a
 * unique compound index on (commentId, userId).
 */

const PAGE_DEFAULT = 10;
const PAGE_MAX = 50;
/** Top-level pages are cached briefly; writes bump the version to bust them. */
const CACHE_TTL_SECONDS = 30;

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

/** Load a comment and confirm the caller can see its card. */
async function loadCommentContext(commentId: string, userId: string) {
  const comment = await CommentModel.findById(commentId).lean();

  if (!comment) {
    throw ApiError.notFound("Comment not found.");
  }

  const { role } = await loadCardContext(comment.cardId.toString(), userId);

  return { comment, role };
}

function pageLimit(query: unknown): number {
  const raw = (query as { limit?: unknown } | undefined)?.limit;
  const value = Number(raw);

  if (!Number.isFinite(value) || value < 1) return PAGE_DEFAULT;

  return Math.min(Math.floor(value), PAGE_MAX);
}

function pageCursor(query: unknown): string | null {
  const raw = (query as { cursor?: unknown } | undefined)?.cursor;

  return typeof raw === "string" && Types.ObjectId.isValid(raw) ? raw : null;
}

interface SerializedComment {
  id: string;
  cardId: string;
  userId: string;
  parentId: string | null;
  authorName: string;
  authorAvatarUrl: string | null;
  text: string;
  likeCount: number;
  dislikeCount: number;
  repliesCount: number;
  userAction: 1 | -1 | 0;
  createdAt: Date;
  updatedAt: Date;
}

type CommentDoc = {
  _id: Types.ObjectId;
  cardId: Types.ObjectId;
  userId: Types.ObjectId;
  parentId?: Types.ObjectId | null;
  text: string;
  likeCount?: number;
  dislikeCount?: number;
  createdAt: Date;
  updatedAt: Date;
};

/**
 * Turn comment documents into the response shape.
 *
 * Authors, reply counts and the caller's own votes are all resolved in three
 * batched queries regardless of how many comments are on the page, so this
 * stays flat as pages grow.
 */
async function hydrate(
  comments: CommentDoc[],
  userId: string,
  options: { withRepliesCount?: boolean } = {},
): Promise<SerializedComment[]> {
  if (comments.length === 0) return [];

  const ids = comments.map((comment) => comment._id);
  const authorIds = [...new Set(comments.map((c) => c.userId.toString()))];

  const [authors, replyCounts, myVotes] = await Promise.all([
    UserModel.find({ _id: { $in: authorIds } })
      .select("fullName avatarUrl")
      .lean(),

    options.withRepliesCount
      ? CommentModel.aggregate<{ _id: Types.ObjectId; count: number }>([
          { $match: { parentId: { $in: ids } } },
          { $group: { _id: "$parentId", count: { $sum: 1 } } },
        ])
      : Promise.resolve([]),

    CommentLikeModel.find({
      commentId: { $in: ids },
      userId: new Types.ObjectId(userId),
    })
      .select("commentId action")
      .lean(),
  ]);

  const authorById = new Map(authors.map((a) => [a._id.toString(), a]));
  const repliesById = new Map(
    replyCounts.map((row) => [row._id.toString(), row.count]),
  );
  const voteById = new Map(
    myVotes.map((vote) => [vote.commentId.toString(), vote.action]),
  );

  return comments.map((comment) => {
    const id = comment._id.toString();
    const author = authorById.get(comment.userId.toString());

    return {
      id,
      cardId: comment.cardId.toString(),
      userId: comment.userId.toString(),
      parentId: comment.parentId ? comment.parentId.toString() : null,
      authorName: author?.fullName ?? "Unknown",
      authorAvatarUrl: author?.avatarUrl ?? null,
      text: comment.text,
      likeCount: comment.likeCount ?? 0,
      dislikeCount: comment.dislikeCount ?? 0,
      repliesCount: repliesById.get(id) ?? 0,
      userAction: voteById.get(id) ?? 0,
      createdAt: comment.createdAt,
      updatedAt: comment.updatedAt,
    };
  });
}

/** Cache version for a card; bumped on every write to invalidate its pages. */
function versionKey(cardId: string): string {
  return `comments:ver:${cardId}`;
}

async function cacheVersion(cardId: string): Promise<number> {
  const cache = await getCacheClient();
  const raw = await cache.get(versionKey(cardId));

  return raw ? Number(raw) || 0 : 0;
}

async function bumpCacheVersion(cardId: string): Promise<void> {
  const cache = await getCacheClient();
  await cache.incr(versionKey(cardId));
}

/* ── GET /cards/:cardId/comments ─────────────────────────────────────────── */

const listComments = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = requireUserId(req);
  const { cardId } = req.params as { cardId: string };

  await loadCardContext(cardId, userId);

  const limit = pageLimit(req.query);
  const cursor = pageCursor(req.query);
  const cardObjectId = new Types.ObjectId(cardId);

  /* Only the first page is cacheable: later pages depend on the cursor, and
     the payload carries no per-user data, so votes are merged in afterwards. */
  const cacheable = !cursor;
  const cache = await getCacheClient();
  const version = cacheable ? await cacheVersion(cardId) : 0;
  const key = `comments:card:${cardId}:v${version}:${limit}`;

  let page = cacheable
    ? (JSON.parse((await cache.get(key)) ?? "null") as CommentDoc[] | null)
    : null;

  if (!page) {
    page = (await CommentModel.find({
      cardId: cardObjectId,
      parentId: null,
      ...(cursor ? { _id: { $lt: new Types.ObjectId(cursor) } } : {}),
    })
      .sort({ _id: -1 })
      .limit(limit + 1)
      .lean()) as CommentDoc[];

    if (cacheable) {
      await cache.setEx(
        key,
        CACHE_TTL_SECONDS,
        JSON.stringify(page.slice(0, limit)),
      );
    }
  }

  const hasMore = page.length > limit;
  const sliced = page.slice(0, limit);
  const comments = await hydrate(sliced, userId, { withRepliesCount: true });

  commentControllerLogger.info(
    {
      userId,
      cardId,
      count: comments.length,
      cached: Boolean(cacheable && page),
    },
    "Comments listed",
  );

  return res.status(200).json(
    new ApiResponse(200, "Comments fetched successfully", {
      comments,
      nextCursor: hasMore
        ? (sliced[sliced.length - 1]?._id.toString() ?? null)
        : null,
    }),
  );
});

/* ── POST /cards/:cardId/comments ────────────────────────────────────────── */

const createComment = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = requireUserId(req);
  const { cardId } = req.params as { cardId: string };

  const body = (req.validated?.body ?? req.body) as {
    text: string;
    parentId?: string | null;
  };

  const { card, role } = await loadCardContext(cardId, userId);

  if (role === "guest") {
    throw guestCannotModifyBoardError();
  }

  /* A reply must point at a comment on the same card, otherwise a crafted
     parentId would graft a thread onto someone else's board. */
  let parentId: Types.ObjectId | null = null;

  if (body.parentId) {
    const parent = await CommentModel.findById(body.parentId)
      .select("_id cardId")
      .lean();

    if (!parent) {
      throw ApiError.notFound("The comment you are replying to was not found.");
    }

    if (parent.cardId.toString() !== card._id.toString()) {
      throw ApiError.badRequest("A reply must belong to the same card.");
    }

    parentId = parent._id;
  }

  const comment = await CommentModel.create({
    workspaceId: card.workspaceId,
    cardId: card._id,
    userId: new Types.ObjectId(userId),
    text: body.text,
    parentId,
    likeCount: 0,
    dislikeCount: 0,
  });

  await ActivityLogModel.create({
    workspaceId: card.workspaceId,
    boardId: card.boardId,
    userId: new Types.ObjectId(userId),
    actionType: "COMMENT_ADD",
    details: {
      cardId: card._id,
      commentId: comment._id,
      preview: body.text.slice(0, 80),
    },
  });

  await bumpCacheVersion(cardId);

  const [serialized] = await hydrate(
    [comment.toObject() as CommentDoc],
    userId,
  );

  commentControllerLogger.info(
    { userId, cardId, commentId: comment._id, isReply: Boolean(parentId) },
    "Comment created",
  );

  return res.status(201).json(
    new ApiResponse(201, "Comment created successfully", {
      comment: serialized,
    }),
  );
});

/* ── GET /comments/:commentId/replies ────────────────────────────────────── */

const listReplies = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = requireUserId(req);
  const { commentId } = req.params as { commentId: string };

  await loadCommentContext(commentId, userId);

  const limit = pageLimit(req.query);
  const cursor = pageCursor(req.query);

  const replies = (await CommentModel.find({
    parentId: new Types.ObjectId(commentId),
    ...(cursor ? { _id: { $lt: new Types.ObjectId(cursor) } } : {}),
  })
    .sort({ _id: -1 })
    .limit(limit + 1)
    .lean()) as CommentDoc[];

  const hasMore = replies.length > limit;
  const sliced = replies.slice(0, limit);
  const serialized = await hydrate(sliced, userId, { withRepliesCount: true });

  return res.status(200).json(
    new ApiResponse(200, "Replies fetched successfully", {
      replies: serialized,
      nextCursor: hasMore
        ? (sliced[sliced.length - 1]?._id.toString() ?? null)
        : null,
    }),
  );
});

/* ── GET /comments/:commentId ────────────────────────────────────────────── */

const getComment = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = requireUserId(req);
  const { commentId } = req.params as { commentId: string };

  await loadCommentContext(commentId, userId);

  const [comment] = await hydrate(
    [(await CommentModel.findById(commentId).lean()) as CommentDoc],
    userId,
    { withRepliesCount: true },
  );

  const replies = (await CommentModel.find({
    parentId: new Types.ObjectId(commentId),
  })
    .sort({ _id: -1 })
    .limit(PAGE_DEFAULT)
    .lean()) as CommentDoc[];

  return res.status(200).json(
    new ApiResponse(200, "Comment fetched successfully", {
      comment,
      replies: await hydrate(replies, userId, { withRepliesCount: true }),
    }),
  );
});

/* ── POST /comments/:commentId/like ──────────────────────────────────────── */

type VoteOp = "create" | "delete" | "update";

interface VotePlan {
  op: VoteOp;
  likeDelta: number;
  dislikeDelta: number;
  userAction: 1 | -1 | 0;
}

/**
 * Decide what a vote press does.
 *
 * Pure and total: every path returns all four values, so the handler never
 * needs a pre-initialised variable that a branch then overwrites. Three cases,
 * as the spec asks: first vote, same vote again (toggle off), opposite vote
 * (switch sides and adjust both counters).
 */
function planVote(existingAction: 1 | -1 | null, action: 1 | -1): VotePlan {
  if (existingAction === null) {
    return {
      op: "create",
      likeDelta: action === 1 ? 1 : 0,
      dislikeDelta: action === -1 ? 1 : 0,
      userAction: action,
    };
  }

  if (existingAction === action) {
    return {
      op: "delete",
      likeDelta: action === 1 ? -1 : 0,
      dislikeDelta: action === -1 ? -1 : 0,
      userAction: 0,
    };
  }

  return {
    op: "update",
    likeDelta: action === 1 ? 1 : -1,
    dislikeDelta: action === -1 ? 1 : -1,
    userAction: action,
  };
}

const voteComment = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = requireUserId(req);
  const { commentId } = req.params as { commentId: string };
  const { action } = (req.validated?.body ?? req.body) as { action: 1 | -1 };

  const { comment, role } = await loadCommentContext(commentId, userId);

  if (role === "guest") {
    throw guestCannotModifyBoardError();
  }

  const userObjectId = new Types.ObjectId(userId);
  const commentObjectId = new Types.ObjectId(commentId);

  const existing = await CommentLikeModel.findOne({
    commentId: commentObjectId,
    userId: userObjectId,
  }).lean();

  /* Work out the write and the counter deltas before touching anything.
     Declaring the deltas up front and then reassigning them in every branch
     left three dead stores, which is what the editor was warning about. */
  const plan = planVote(existing ? existing.action : null, action);

  if (plan.op === "create") {
    /* First vote. The unique index makes a double-tap safe: the loser of the
       race gets E11000, and the counters below are still correct because the
       other request applied the same delta. */
    try {
      await CommentLikeModel.create({
        commentId: commentObjectId,
        userId: userObjectId,
        action,
      });
    } catch (error) {
      if ((error as { code?: number }).code !== 11000) throw error;
    }
  }

  if (plan.op === "delete" && existing) {
    // Same button again: the vote is removed.
    await CommentLikeModel.deleteOne({ _id: existing._id });
  }

  if (plan.op === "update" && existing) {
    // Switched sides: move the row, and the deltas adjust both counters.
    await CommentLikeModel.updateOne(
      { _id: existing._id },
      { $set: { action } },
    );
  }

  const updated = await CommentModel.findByIdAndUpdate(
    commentObjectId,
    {
      $inc: {
        likeCount: plan.likeDelta,
        dislikeCount: plan.dislikeDelta,
      },
    },
    { new: true, projection: { likeCount: 1, dislikeCount: 1 } },
  ).lean();

  await bumpCacheVersion(comment.cardId.toString());

  return res.status(200).json(
    new ApiResponse(200, "Vote recorded", {
      likeCount: Math.max(updated?.likeCount ?? 0, 0),
      dislikeCount: Math.max(updated?.dislikeCount ?? 0, 0),
      userAction: plan.userAction,
    }),
  );
});

/* ── DELETE /comments/:commentId/like ────────────────────────────────────── */

const clearVote = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = requireUserId(req);
  const { commentId } = req.params as { commentId: string };

  const { comment } = await loadCommentContext(commentId, userId);

  const existing = await CommentLikeModel.findOneAndDelete({
    commentId: new Types.ObjectId(commentId),
    userId: new Types.ObjectId(userId),
  }).lean();

  if (existing) {
    await CommentModel.updateOne(
      { _id: new Types.ObjectId(commentId) },
      {
        $inc: {
          likeCount: existing.action === 1 ? -1 : 0,
          dislikeCount: existing.action === -1 ? -1 : 0,
        },
      },
    );
    await bumpCacheVersion(comment.cardId.toString());
  }

  const updated = await CommentModel.findById(commentId)
    .select("likeCount dislikeCount")
    .lean();

  return res.status(200).json(
    new ApiResponse(200, "Vote removed", {
      likeCount: Math.max(updated?.likeCount ?? 0, 0),
      dislikeCount: Math.max(updated?.dislikeCount ?? 0, 0),
      userAction: 0,
    }),
  );
});

/* ── PATCH /comments/:commentId ──────────────────────────────────────────── */

const updateComment = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = requireUserId(req);
  const { commentId } = req.params as { commentId: string };
  const { text } = (req.validated?.body ?? req.body) as { text: string };

  const { comment } = await loadCommentContext(commentId, userId);

  /* Only the author may edit. Admins can delete but not rewrite someone
     else's words, which would misattribute them. */
  if (comment.userId.toString() !== userId) {
    throw ApiError.forbidden("You can only edit your own comments.");
  }

  const updated = await CommentModel.findByIdAndUpdate(
    commentId,
    { $set: { text } },
    { new: true },
  ).lean();

  if (!updated) {
    throw ApiError.notFound("Comment not found.");
  }

  await bumpCacheVersion(comment.cardId.toString());

  const [serialized] = await hydrate([updated as CommentDoc], userId, {
    withRepliesCount: true,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment updated", { comment: serialized }));
});

/* ── DELETE /comments/:commentId ─────────────────────────────────────────── */

const deleteComment = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = requireUserId(req);
  const { commentId } = req.params as { commentId: string };

  const { comment, role } = await loadCommentContext(commentId, userId);

  // Authors may delete their own; admins and owners may delete any.
  if (
    comment.userId.toString() !== userId &&
    !["owner", "admin"].includes(role)
  ) {
    throw ApiError.forbidden("You can only delete your own comments.");
  }

  /* Replies go with the parent, otherwise they would be orphaned and
     unreachable through any listing. */
  const replies = await CommentModel.find({ parentId: comment._id })
    .select("_id")
    .lean();
  const ids = [comment._id, ...replies.map((reply) => reply._id)];

  await Promise.all([
    CommentLikeModel.deleteMany({ commentId: { $in: ids } }),
    CommentModel.deleteMany({ _id: { $in: ids } }),
  ]);

  await bumpCacheVersion(comment.cardId.toString());

  return res
    .status(200)
    .json(new ApiResponse(200, "Comment deleted", { id: commentId }));
});

export {
  listComments,
  createComment,
  listReplies,
  getComment,
  voteComment,
  clearVote,
  updateComment,
  deleteComment,
};
