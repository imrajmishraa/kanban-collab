import { AuthenticatedRequest } from "../../middleware/auth.middleware";
import { asyncHandler } from "../../../../shared/utils/asyncHandler";
import { BoardModel, CardModel, ColumnModel, WorkspaceModel } from "../../../../infrastructure/db/mongoose/schemas";
import { ApiResponse } from "../../../../shared/utils/ApiResponse";
import { Types } from "mongoose";

import { getCacheClient }  from "../../../../infrastructure/cache/redis";
import { boardControllerLogger } from "../../../../infrastructure/logging/childLogger";
import { notWorkspaceMemberError, workspaceIdRequiredError } from "../../../../shared/errors/workspace/workspace";
import { boardNotFoundError, boardAccessDeniedError, guestCannotModifyBoardError } from "../../../../shared/errors/board/board";



const createBoard = asyncHandler(async (req: AuthenticatedRequest, res ) => {
  const { workspaceId, name, backgroundColor, visibility } = req.body;
  const userId = req.user!.userId;
  try {

    // Verify workspace membership
    const workspace = await WorkspaceModel.findOne({
      _id: workspaceId,
      "members.userId": new Types.ObjectId(userId),
    });

    if(!workspace) {
      throw notWorkspaceMemberError();
    }

      const member = workspace.members.find(
        (m) => m.userId.toString() === userId,
      );

      if(!member|| member.role === 'guest') {
          throw guestCannotModifyBoardError();
      }

      const board = await BoardModel.create({
        workspaceId: new Types.ObjectId(workspaceId as string),
        name,
        backgroundColor: backgroundColor || "#2b6cb0",
        visibility: visibility || 'workspace'
      });

      boardControllerLogger.info(
        {
          boardId: board._id,
          workspaceId,
          userId,
        },
        "Board created",
      );
      return res.status(201).json(
          new ApiResponse(201, 'Board created successfully', {
              data: board
          })
      )
  } catch (error) {
    boardControllerLogger.error(
      {
        err: error,
        userId,
        workspaceId,
      },
      "Create board failed",
    );
    throw error;
  }
});

const listBoards = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const { workspaceId, page = "1", limit = "10" } = req.query;
  const userId = req.user!.userId;  
  try {
    if (!workspaceId) {
      throw workspaceIdRequiredError();
    }

    // Verify workspace membership
    const workspace = await WorkspaceModel.findOne({
      _id: workspaceId as string,
      "members.userId": new Types.ObjectId(userId),
    });

    if (!workspace) {
      throw notWorkspaceMemberError();
    }

    const currentPage = Math.max(Number(page) || 1, 1);
    const pageLimit = Math.min(Math.max(Number(limit) || 10, 1), 50);

    const skip = (currentPage - 1) * pageLimit;

    const boardFilter = {
      workspaceId: new Types.ObjectId(workspaceId as string),
    };

    // Fetch boards + total count
    const [boards, totalBoards] = await Promise.all([
      BoardModel.find(boardFilter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(pageLimit),

      BoardModel.countDocuments(boardFilter),
    ]);

     const totalPages = Math.ceil(totalBoards / pageLimit);

     boardControllerLogger.info(
       {
         workspaceId,
         userId,
         boardCount: boards.length,
         page: currentPage,
         limit: pageLimit,
         totalBoards,
       },
       "Boards listed",
     );
    return res.status(200).json(
      new ApiResponse(200, "Boards fetched successfully", {
        boards,
        pagination: {
          page: currentPage,
          limit: pageLimit,
          totalBoards,
          totalPages,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
        },
      }),
    );
  } catch (error) {
        boardControllerLogger.error(
          {
            err: error,
            workspaceId,
            userId,
          },
          "List boards failed",
        );
        throw error;
    }
});

const updateBoard = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const boardId = req.params.boardId || req.params.id;
  const { name, description, backgroundColor, coverImageUrl, visibility } = req.body;
  const userId = req.user!.userId;
  try {
    const board = await BoardModel.findById(boardId);
    if (!board) {
      throw boardNotFoundError();
    }

    const workspace = await WorkspaceModel.findOne({
      _id: board.workspaceId,
      "members.userId": new Types.ObjectId(userId),
    });

    if (!workspace) {
      throw boardAccessDeniedError();
    }

    const member = workspace.members.find(
      (m) => m.userId.toString() === userId,
    );

    if (!member || member.role === "guest") {
      throw guestCannotModifyBoardError();
    }

    if (name !== undefined) board.name = name;
    if (description !== undefined) board.description = description;
    if (backgroundColor !== undefined) board.backgroundColor = backgroundColor;
    if (coverImageUrl !== undefined) board.coverImageUrl = coverImageUrl;
    if (visibility !== undefined) board.visibility = visibility;

    await board.save();

    boardControllerLogger.info(
      {
        boardId: board._id,
        userId,
      },
      "Board updated",
    );

    return res.status(200).json(
      new ApiResponse(200, "Board updated successfully", {
        data: board,
      }),
    );
  } catch (error) {
    boardControllerLogger.error(
      {
        err: error,
        boardId: req.params.boardId || req.params.id,
        userId,
      },
      "Update board failed",
    );
    throw error;
  }
});

const getBoardDetails = asyncHandler(async (req: AuthenticatedRequest, res) => {
  const userId = req.user!.userId;
  const boardId = req.params.boardId || req.params.id;

  // Try cache
  const cacheKey = `board:${boardId}`;

  const cache = await getCacheClient();

  let cached: string | null = null;
  try {
    cached = await cache.get(cacheKey);
  } catch (err) {
    console.warn("Cache read error:", err);
  }

  if (cached) {
    return res.status(200).json(JSON.parse(cached));
  }

  // 1. Fetch board
  const board = await BoardModel.findById(boardId).lean();
  if (!board) {
    throw boardNotFoundError();
  }

  // 2. Verify workspace membership
  const workspace = await WorkspaceModel.findOne({
    _id: board.workspaceId,
    "members.userId": new Types.ObjectId(userId),
  }).lean();

  if (!workspace) {
    throw boardAccessDeniedError();
  }

  // 3. Fetch columns and cards in PARALLEL (both use indexes)
  const [columns, cards] = await Promise.all([
    ColumnModel.find({ boardId: board._id })
      .select("_id name orderIndex")
      .sort({ orderIndex: 1 })
      .lean(),
    CardModel.find({
      boardId: board._id,
      isArchived: false,
    })
      .select(
        "_id title description orderIndex dueDate labels checklists columnId",
      )
      .sort({ orderIndex: 1 })
      .lean(),
  ]);

  // 4. Assemble response (fast in‑memory)
  const responseColumns = columns.map((col) => ({
    id: col._id,
    name: col.name,
    orderIndex: col.orderIndex,
    cards: cards
      .filter((card) => card.columnId.equals(col._id))
      .map((card) => ({
        id: card._id,
        title: card.title,
        description: card.description,
        orderIndex: card.orderIndex,
        dueDate: card.dueDate,
        labels: card.labels,
        checklists: card.checklists,
      })),
  }));

  boardControllerLogger.info(
    { boardId: board._id, workspaceId: board.workspaceId, userId },
    "Board details retrieved",
  );

  const response = new ApiResponse(200, "Fetched board details", {
    data: {
      id: board._id,
      name: board.name,
      description: board.description,
      backgroundColor: board.backgroundColor,
      columns: responseColumns,
    },
  });

  try {
    await cache.setEx(cacheKey, 60, JSON.stringify(response));
  } catch (err) {
    console.warn("Cache write error:", err);
  }
  return res.status(200).json(response);
});

export { createBoard, updateBoard, listBoards, getBoardDetails };
