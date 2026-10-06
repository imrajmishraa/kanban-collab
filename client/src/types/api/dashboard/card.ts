import type { BoardCardChecklistItem } from "./board";

// ── Create ───────────────────────────────────────────────────

export interface CreateCardRequest {
  columnId: string;
  boardId: string;
  title: string;
  description?: string;
  dueDate?: string; // ISO datetime
  members?: string[];
  labels?: string[];
  orderIndex?: number;
}

export interface CreateCardResponse {
  id: string;
  title: string;
  description: string;
  columnId: string;
  boardId: string;
  workspaceId: string;
  dueDate?: string | null;
  members: string[];
  orderIndex: number;
  checklists: BoardCardChecklistItem[];
  labels: string[];
}

// ── Update ───────────────────────────────────────────────────

export interface UpdateCardRequest {
  title?: string;
  description?: string;
  dueDate?: string | null; // null clears it
  members?: string[];
  labels?: string[];
  isArchived?: boolean;
}

export interface UpdateCardResponse {
  id: string;
  title: string;
  columnId: string;
  orderIndex: number;
  checklists: BoardCardChecklistItem[];
  labels: string[];
}

// ── Move ─────────────────────────────────────────────────────

export interface MoveCardRequest {
  targetColumnId: string;
  targetOrderIndex: number;
}
