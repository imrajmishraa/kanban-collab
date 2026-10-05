import { apiClient } from "../client";

import type { ApiResponse } from "@/types/api/api";
import type {
  Comment,
  CreateCommentPayload,
} from "@/types/api/dashboard/comment";

interface ListCommentsResponse {
  comments: Comment[];
}

interface CommentResponse {
  comment: Comment;
}

export const commentsApi = {
  async listComments(cardId: string): Promise<Comment[]> {
    const response = await apiClient.get<ApiResponse<ListCommentsResponse>>(
      `/cards/${cardId}/comments`,
    );

    return response.data.data.comments;
  },

  async createComment(
    cardId: string,
    payload: CreateCommentPayload,
  ): Promise<Comment> {
    const response = await apiClient.post<ApiResponse<CommentResponse>>(
      `/cards/${cardId}/comments`,
      payload,
    );

    return response.data.data.comment;
  },

  async deleteComment(commentId: string): Promise<{ id: string }> {
    const response = await apiClient.delete<
      ApiResponse<{ comment: { id: string } }>
    >(`/comments/${commentId}`);

    return response.data.data.comment;
  },
};
