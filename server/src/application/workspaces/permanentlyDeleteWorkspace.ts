import {
  WorkspaceModel,
  BoardModel,
  ColumnModel,
  CardModel,
  CommentModel,
  ActivityLogModel,
  YjsUpdateModel,
} from "../../infrastructure/db/mongoose/schemas";

import {
  transitionWorkspace,
  type WorkspaceStatus,
} from "./workspaceLifecycle";

export const permanentlyDeleteWorkspace = async (
  workspaceId: string,
): Promise<void> => {
  /*
   * Guard the destructive path with the state machine before touching anything.
   *
   * The cron job already filters on `deletion_pending` + elapsed date, but this
   * function is also called directly (scripts, tests, future admin tooling).
   * Without the guard, one call on an `active` workspace would cascade-delete
   * boards, cards and comments and then leave the workspace itself alive
   * (the final deleteOne is filtered on `status: "deletion_pending"`).
   */
  const target = await WorkspaceModel.findById(workspaceId)
    .select("status deletionRequestedAt deletionScheduledFor")
    .lean();

  // Already gone — nothing to do, and not an error for the caller.
  if (!target) return;

  const allowed = transitionWorkspace(
    {
      status: target.status as WorkspaceStatus,
      deletionRequestedAt: target.deletionRequestedAt ?? null,
      deletionScheduledFor: target.deletionScheduledFor ?? null,
    },
    { type: "PURGE", now: new Date() },
  );

  if (!allowed.ok) {
    throw new Error(
      `Refusing to purge workspace ${workspaceId}: ${allowed.reason}.`,
    );
  }
  // 1. Find all boards belonging to the workspace
  const boards = await BoardModel.find(
    {
      workspaceId,
    },
    {
      _id: 1,
    },
  ).lean();

  const boardIds = boards.map((board) => board._id);

  if (boardIds.length > 0) {
    // 2. Find all columns belonging to those boards
    const columns = await ColumnModel.find(
      {
        workspaceId,
      },
      {
        _id: 1,
      },
    ).lean();

    const columnIds = columns.map((column) => column._id);

    // 3. Find cards belonging to those columns
    const cards = await CardModel.find(
      {
        columnId: { $in: columnIds },
      },
      {
        _id: 1,
      },
    ).lean();

    const cardIds = cards.map((card) => card._id);

    // 4. Delete comments
    if (cardIds.length > 0) {
      await CommentModel.deleteMany({
        cardId: { $in: cardIds },
      });
    }

    // 5. Delete cards
    if (cardIds.length > 0) {
      await CardModel.deleteMany({
        _id: { $in: cardIds },
      });
    }

    // 6. Delete columns
    if (columnIds.length > 0) {
      await ColumnModel.deleteMany({
        _id: { $in: columnIds },
      });
    }

    // 7. Delete activity logs
    await ActivityLogModel.deleteMany({
      boardId: { $in: boardIds },
    });

    // 8. Delete Yjs documents
    await YjsUpdateModel.deleteMany({
      docName: {
        $in: boardIds.map((id) => id.toString()),
      },
    });

    // 9. Delete boards
    await BoardModel.deleteMany({
      _id: { $in: boardIds },
    });
  }

  // 10. Finally delete the workspace
  await WorkspaceModel.deleteOne({
    _id: workspaceId,
    status: "deletion_pending",
  });
};
