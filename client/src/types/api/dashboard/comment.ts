export interface Comment {
  id: string;
  cardId: string;
  userId: string;
  /** Null for a top-level comment, a comment id for any depth of reply. */
  parentId: string | null;
  authorName: string;
  authorAvatarUrl: string | null;
  text: string;
  likeCount: number;
  dislikeCount: number;
  /** Direct replies only, so "View N replies" knows what to promise. */
  repliesCount: number;
  /** The caller's own vote: 1 like, -1 dislike, 0 none. */
  userAction: 1 | -1 | 0;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentPayload {
  text: string;
  /** Omit or send null for a top-level comment. */
  parentId?: string | null;
}

export interface CommentPage {
  comments: Comment[];
  nextCursor: string | null;
}

export interface ReplyPage {
  replies: Comment[];
  nextCursor: string | null;
}

export interface CommentVoteResult {
  likeCount: number;
  dislikeCount: number;
  userAction: 1 | -1 | 0;
}

export interface CommentWithReplies {
  comment: Comment;
  replies: Comment[];
}
