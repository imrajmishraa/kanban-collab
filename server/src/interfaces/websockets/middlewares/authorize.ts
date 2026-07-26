import { Types } from "mongoose";

import {
  BoardModel,
  WorkspaceModel,
} from "../../../infrastructure/db/mongoose/schemas";

export async function authorize(
  userId: string,
  boardId: string,
): Promise<void> {
  const board = await BoardModel.findById(boardId);

  if (!board) {
    throw new Error("Board not found.");
  }

  const workspace = await WorkspaceModel.findOne({
    _id: board.workspaceId,
    "members.userId": new Types.ObjectId(userId),
  });

  if (!workspace) {
    throw new Error("Forbidden.");
  }
}
