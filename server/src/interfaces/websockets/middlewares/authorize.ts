import { Types } from "mongoose";

import {
  BoardModel,
  WorkspaceModel,
} from "../../../infrastructure/db/mongoose/schemas";

import { boardNotFoundError } from "../../../shared/errors/board/board";

import { notWorkspaceMemberError } from "../../../shared/errors/workspace/workspace";

import { invalidObjectIdError } from "../../../shared/errors/handler/custom";

export async function authorize(
  userId: string,
  boardId: string,
): Promise<void> {
  if (!Types.ObjectId.isValid(userId) || !Types.ObjectId.isValid(boardId)) {
    throw invalidObjectIdError();
  }

  const board = await BoardModel.findById(boardId)
    .select("_id workspaceId")
    .lean();

  if (!board) {
    throw boardNotFoundError();
  }

  const workspace = await WorkspaceModel.findOne({
    _id: board.workspaceId,
    "members.userId": new Types.ObjectId(userId),
  })
    .select("_id")
    .lean();

  if (!workspace) {
    throw notWorkspaceMemberError();
  }
}
