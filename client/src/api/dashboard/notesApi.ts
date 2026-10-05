import { apiClient } from "../client";

import type { ApiResponse } from "@/types/api/api";
import type {
  Note,
  CreateNotePayload,
  UpdateNotePayload,
} from "@/types/api/dashboard/note";

interface ListNotesResponse {
  notes: Note[];
}

interface NoteResponse {
  note: Note;
}

export const notesApi = {
  async listNotes(workspaceId: string, boardId?: string): Promise<Note[]> {
    const response = await apiClient.get<ApiResponse<ListNotesResponse>>(
      "/notes",
      { params: { workspaceId, boardId } },
    );

    return response.data.data.notes;
  },

  async createNote(payload: CreateNotePayload): Promise<Note> {
    const response = await apiClient.post<ApiResponse<NoteResponse>>(
      "/notes",
      payload,
    );

    return response.data.data.note;
  },

  async updateNote(noteId: string, payload: UpdateNotePayload): Promise<Note> {
    const response = await apiClient.patch<ApiResponse<NoteResponse>>(
      `/notes/${noteId}`,
      payload,
    );

    return response.data.data.note;
  },

  async deleteNote(noteId: string): Promise<{ id: string }> {
    const response = await apiClient.delete<
      ApiResponse<{ note: { id: string } }>
    >(`/notes/${noteId}`);

    return response.data.data.note;
  },
};
