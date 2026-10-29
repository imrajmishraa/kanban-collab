import { apiClient } from "../client";

import type { ApiResponse } from "@/types/api/api";
import type {
  Comment,
  CommentPage,
  CommentVoteResult,
  CommentWithReplies,
  CreateCommentPayload,
  ReplyPage,
} from "@/types/api/dashboard/comment";

export const commentsApi = {
  /** Top-level comments, newest first, cursor paginated. */
  async listComments(
    cardId: string,
    params: { cursor?: string | null; limit?: number } = {},
  ): Promise<CommentPage> {
    const response = await apiClient.get<ApiResponse<CommentPage>>(
      `/cards/${cardId}/comments`,
      {
        params: {
          ...(params.cursor ? { cursor: params.cursor } : {}),
          ...(params.limit ? { limit: params.limit } : {}),
        },
      },
    );

    return response.data.data;
  },

  async createComment(
    cardId: string,
    payload: CreateCommentPayload,
  ): Promise<Comment> {
    const response = await apiClient.post<ApiResponse<{ comment: Comment }>>(
      `/cards/${cardId}/comments`,
      payload,
    );

    return response.data.data.comment;
  },

  /** Direct replies to one comment; this is what "View replies" loads. */
  async listReplies(
    commentId: string,
    params: { cursor?: string | null; limit?: number } = {},
  ): Promise<ReplyPage> {
    const response = await apiClient.get<ApiResponse<ReplyPage>>(
      `/comments/${commentId}/replies`,
      {
        params: {
          ...(params.cursor ? { cursor: params.cursor } : {}),
          ...(params.limit ? { limit: params.limit } : {}),
        },
      },
    );

    return response.data.data;
  },

  async getComment(commentId: string): Promise<CommentWithReplies> {
    const response = await apiClient.get<ApiResponse<CommentWithReplies>>(
      `/comments/${commentId}`,
    );

    return response.data.data;
  },

  /** Send the same action twice and the server toggles the vote off. */
  async vote(commentId: string, action: 1 | -1): Promise<CommentVoteResult> {
    const response = await apiClient.post<ApiResponse<CommentVoteResult>>(
      `/comments/${commentId}/like`,
      { action },
    );

    return response.data.data;
  },

  async clearVote(commentId: string): Promise<CommentVoteResult> {
    const response = await apiClient.delete<ApiResponse<CommentVoteResult>>(
      `/comments/${commentId}/like`,
    );

    return response.data.data;
  },

  /** Authors only; the server rejects anyone else. */
  async updateComment(commentId: string, text: string): Promise<Comment> {
    const response = await apiClient.patch<ApiResponse<{ comment: Comment }>>(
      `/comments/${commentId}`,
      { text },
    );

    return response.data.data.comment;
  },

  async deleteComment(commentId: string): Promise<{ id: string }> {
    const response = await apiClient.delete<ApiResponse<{ id: string }>>(
      `/comments/${commentId}`,
    );

    return response.data.data;
  },
};
