import {
  WorkspaceModel,
  BoardModel,
  ColumnModel,
  CardModel,
  CommentModel,
  ActivityLogModel,
  YjsUpdateModel,
} from "../../infrastructure/db/mongoose/schemas";

export const permanentlyDeleteWorkspace = async (workspaceId: string): Promise<void> => {
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
        cardId: { $in: cardIds },
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

    // 10. Finally delete the workspace
    await WorkspaceModel.deleteOne({
      _id: workspaceId,
      status: "deletion_pending",
    });
  }
}