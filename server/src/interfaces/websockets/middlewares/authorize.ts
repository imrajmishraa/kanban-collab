import { Types } from "mongoose";

import {
  BoardModel,
  WorkspaceModel,
} from "../../../infrastructure/db/mongoose/schemas";

import {
  canReadBoard,
  canWriteBoard,
} from "../../../application/boards/boardAccess";

import {
  boardAccessDeniedError,
  boardNotFoundError,
} from "../../../shared/errors/board/board";

import {
  notWorkspaceMemberError,
  workspacePendingDeletionError,
} from "../../../shared/errors/workspace/workspace";

import { invalidObjectIdError } from "../../../shared/errors/handler/generic";

export interface BoardAuthorization {
  /**
   * The caller's role in the board's workspace, or `null` for someone who is
   * not in it at all and is reading a public board.
   */
  role: string | null;
  /** False for read-only roles (guests) — they must not mutate the document. */
  canWrite: boolean;
}

/**
 * Authorise a WebSocket upgrade for a board (H-3).
 *
 * Enforces, in order:
 *   1. The ids are valid ObjectIds.
 *   2. The board exists.
 *   3. The user is a member of the board's workspace, **or** the board is
 *      `public` — in which case the connection is read-only.
 *   4. The workspace is not scheduled for deletion (it would be read-only).
 *   5. The board's visibility allows this role — a `private` board is not
 *      exposed to `guest` members.
 *
 * Returns the caller's role so the connection can be made read-only for
 * guests (write attempts are dropped in the message handler).
 */
export async function authorize(
  userId: string,
  boardId: string,
): Promise<BoardAuthorization> {
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(boardId)) {
    throw invalidObjectIdError();
  }

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
    .select("members.userId members.role status")
    .lean();

  /*
   * Not a member. That used to be the end of it, which meant the public link
   * opened a page the socket then refused — the reader got a snapshot and no
   * cursors, no card moves, no sign that anyone else was there.
   *
   * A public board is now readable over the socket too, read-only: the caller
   * still needs an account (`authenticate` runs first), they just do not need to
   * be in the workspace. Anonymous viewers stay on the HTTP read, because the
   * socket's presence list is keyed by user id and inventing one would put
   * fictional people in front of real ones.
   */
  if (!workspace) {
    if (canReadBoard(board.visibility, null)) {
      return { role: null, canWrite: false };
    }

    throw notWorkspaceMemberError();
  }

  /* A workspace scheduled for deletion is read-only. Without this check the
     socket upgraded happily and every edit made in the grace window was thrown
     away by the purge job — the user saw a working board that was already
     doomed. */
  if (workspace.status !== "active") {
    throw workspacePendingDeletionError();
  }

  const member = workspace.members.find((m) => m.userId.toString() === userId);

  if (!member) {
    throw notWorkspaceMemberError();
  }

  const role = member.role;

  /*
   * One table decides both answers now — `application/boards/boardAccess.ts`.
   * The inline rule that used to live here (`private` + `guest` → deny) was the
   * only place in the codebase where visibility meant anything, and the HTTP
   * read path disagreed with it.
   */
  if (!canReadBoard(board.visibility, role)) {
    throw boardAccessDeniedError();
  }

  return {
    role,
    canWrite: canWriteBoard(role),
  };
}
