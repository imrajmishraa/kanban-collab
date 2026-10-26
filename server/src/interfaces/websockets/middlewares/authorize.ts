import { Types } from "mongoose";

import {
  BoardModel,
  WorkspaceModel,
} from "../../../infrastructure/db/mongoose/schemas";

import {
  boardAccessDeniedError,
  boardNotFoundError,
} from "../../../shared/errors/board/board";

import { notWorkspaceMemberError } from "../../../shared/errors/workspace/workspace";

import { invalidObjectIdError } from "../../../shared/errors/handler/generic";

export interface BoardAuthorization {
  /** The caller's role in the board's workspace. */
  role: string;
  /** False for read-only roles (guests) — they must not mutate the document. */
  canWrite: boolean;
}

/**
 * Authorise a WebSocket upgrade for a board (H-3).
 *
 * Enforces, in order:
 *   1. The ids are valid ObjectIds.
 *   2. The board exists.
 *   3. The user is a member of the board's workspace.
 *   4. The board's visibility allows this role — a `private` board is not
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
    .select("members.userId members.role")
    .lean();

  if (!workspace) {
    throw notWorkspaceMemberError();
  }

  const member = workspace.members.find((m) => m.userId.toString() === userId);

  if (!member) {
    throw notWorkspaceMemberError();
  }

  const role = member.role;

  // `private` boards are not exposed to guests, even inside the workspace.
  if (board.visibility === "private" && role === "guest") {
    throw boardAccessDeniedError();
  }

  return {
    role,
    canWrite: role !== "guest",
  };
}
