import { Types } from "mongoose";

import {
  BoardModel,
  WorkspaceModel,
} from "../../infrastructure/db/mongoose/schemas";
import {
  boardAccessDeniedError,
  boardNotFoundError,
} from "../../shared/errors/board/board";
import { notWorkspaceMemberError } from "../../shared/errors/workspace/workspace";

import {
  canReadBoard,
  type BoardVisibility,
  type WorkspaceRole,
} from "./boardAccess";

/**
 * The read rule of `boardAccess.ts`, applied to a real board.
 *
 * `canReadBoard` decided visibility × role on exactly one HTTP surface
 * (`GET /boards/:id`) and on the WebSocket upgrade. Every other read path — the
 * board list, card search, the activity feed, archived cards, comments and
 * attachments — asked only "is this user in the workspace?", which is a weaker
 * question: a `guest` *is* in the workspace, and `private` is supposed to hide
 * the board from them. A guest who knew a board id could therefore list the
 * board, search its cards and read its activity.
 *
 * Two entry points, because the card-scoped controllers already hold the card
 * and the caller's role:
 *
 *   `loadReadableBoard`   — board id → { board, role }, or throws.
 *   `assertBoardReadable` — (board id, role already known) → throws or returns.
 *
 * These are member-facing guards: a caller who is not in the workspace at all is
 * refused here and uses `GET /boards/:id/public` instead, which is the surface
 * that reads visibility with `role === null`.
 *
 * Errors follow the existing convention: 404 when the board is missing (its
 * existence is not the caller's business), 403 when they are in the workspace
 * but this board is not for them.
 */
export interface ReadableBoard {
  id: string;
  workspaceId: Types.ObjectId;
  visibility: BoardVisibility;
  role: WorkspaceRole;
}

/** Load a board the caller may read, or throw the reason they may not. */
export async function loadReadableBoard(
  boardId: string,
  userId: string,
): Promise<ReadableBoard> {
  const board = await BoardModel.findById(boardId)
    .select("_id workspaceId visibility")
    .lean();

  if (!board) {
    throw boardNotFoundError();
  }

  const workspace = await WorkspaceModel.findOne({
    _id: board.workspaceId,
    "members.userId": new Types.ObjectId(userId),
  })
    .select("members")
    .lean();

  if (!workspace) {
    throw notWorkspaceMemberError();
  }

  const member = workspace.members.find(
    (candidate) => candidate.userId.toString() === userId,
  );

  if (!member) {
    throw notWorkspaceMemberError();
  }

  if (!canReadBoard(board.visibility, member.role)) {
    throw boardAccessDeniedError();
  }

  return {
    id: board._id.toString(),
    workspaceId: board.workspaceId,
    visibility: board.visibility,
    role: member.role,
  };
}

/**
 * The same rule for a surface that reached the board through a card.
 *
 * `role` must come from a membership check the caller already made; this only
 * adds the visibility half, which is the half that was missing.
 */
export async function assertBoardReadable(
  boardId: Types.ObjectId | string,
  role: WorkspaceRole,
): Promise<void> {
  const board = await BoardModel.findById(boardId).select("visibility").lean();

  if (!board) {
    throw boardNotFoundError();
  }

  if (!canReadBoard(board.visibility, role)) {
    throw boardAccessDeniedError();
  }
}

/**
 * The board ids in a workspace that this role may not read.
 *
 * Some surfaces cannot ask per board: a list endpoint returns whatever matches a
 * workspace filter, and the dashboard counts boards it never loads. They need
 * the exclusion set up front, so this answers "which boards are invisible to
 * this role here?" once and they filter with it.
 *
 * Empty for every role that may read a private board, so a caller can apply the
 * filter unconditionally — `$nin: []` matches everything.
 */
export async function hiddenBoardIdsFor(
  workspaceId: Types.ObjectId | string,
  role: WorkspaceRole,
): Promise<Types.ObjectId[]> {
  if (canReadBoard("private", role)) {
    return [];
  }

  const boards = await BoardModel.find({
    workspaceId: new Types.ObjectId(workspaceId.toString()),
    visibility: "private",
  })
    .select("_id")
    .lean();

  return boards.map((board) => board._id);
}
