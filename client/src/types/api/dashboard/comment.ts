export interface Comment {
  id: string;
  cardId: string;
  userId: string;
  authorName: string;
  authorAvatarUrl: string | null;
  text: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateCommentPayload {
  text: string;
}
