export interface Note {
  id: string;
  workspaceId: string;
  boardId: string | null;
  userId: string;
  title: string;
  body: string;
  isPinned: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateNotePayload {
  workspaceId: string;
  boardId?: string;
  title: string;
  body?: string;
  isPinned?: boolean;
}

export interface UpdateNotePayload {
  title?: string;
  body?: string;
  isPinned?: boolean;
}
