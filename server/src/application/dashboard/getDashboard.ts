import { Types } from "mongoose";

import {
  ActivityLogModel,
  BoardModel,
  CardModel,
  WorkspaceModel,
} from "../../infrastructure/db/mongoose/schemas";

export interface DashboardWorkspace {
  id: string;
  name: string;
  boardCount: number;
  activeTaskCount: number;
}

export interface DashboardBoard {
  id: string;
  workspaceId: string;
  workspaceName: string;
  name: string;
  backgroundColor: string;
  updatedAt: string;
}

export interface DashboardActivity {
  id: string;
  type: string;
  message: string;
  workspaceId: string;
  workspaceName: string;
  boardId: string;
  boardName: string;
  userId: string;
  createdAt: string;
}

export interface DashboardResponse {
  stats: {
    workspaceCount: number;
    boardCount: number;
    activeTaskCount: number;
  };

  workspaces: DashboardWorkspace[];

  recentBoards: DashboardBoard[];

  recentActivity: DashboardActivity[];
}

export const getDashboard = async (
  userId: string,
): Promise<DashboardResponse> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error(`Invalid user ID: ${userId}`);
  }

  const userObjectId = new Types.ObjectId(userId);

  /*
   * ---------------------------------------------------------
   * 1. Get user's workspaces
   * ---------------------------------------------------------
   */

  const workspaces = await WorkspaceModel.find({
    "members.userId": userObjectId,
  }).lean();

  if (workspaces.length === 0) {
    return {
      stats: {
        workspaceCount: 0,
        boardCount: 0,
        activeTaskCount: 0,
      },

      workspaces: [],

      recentBoards: [],

      recentActivity: [],
    };
  }

  const workspaceIds = workspaces.map((workspace) => workspace._id);

  /*
   * ---------------------------------------------------------
   * 2. Get boards
   * ---------------------------------------------------------
   */

  const boards = await BoardModel.find({
    workspaceId: {
      $in: workspaceIds,
    },
  })
    .sort({
      updatedAt: -1,
    })
    .lean();

  const boardIds = boards.map((board) => board._id);

  /*
   * ---------------------------------------------------------
   * 3. Get active tasks
   * ---------------------------------------------------------
   */

  const activeTasks =
    boardIds.length > 0
      ? await CardModel.find({
          boardId: {
            $in: boardIds,
          },

          isArchived: false,
        }).lean()
      : [];

  /*
   * ---------------------------------------------------------
   * 4. Build workspace dashboard data
   * ---------------------------------------------------------
   */

  const dashboardWorkspaces: DashboardWorkspace[] = workspaces.map(
    (workspace) => {
      const workspaceId = workspace._id.toString();

      const workspaceBoards = boards.filter(
        (board) => board.workspaceId.toString() === workspaceId,
      );

      const workspaceBoardIds = new Set(
        workspaceBoards.map((board) => board._id.toString()),
      );

      const workspaceActiveTasks = activeTasks.filter((task) =>
        workspaceBoardIds.has(task.boardId.toString()),
      );

      return {
        id: workspaceId,
        name: workspace.name,
        boardCount: workspaceBoards.length,
        activeTaskCount: workspaceActiveTasks.length,
      };
    },
  );

  /*
   * ---------------------------------------------------------
   * 5. Recent boards
   * ---------------------------------------------------------
   */

  const recentBoards: DashboardBoard[] = boards.slice(0, 6).map((board) => {
    const workspace = workspaces.find(
      (item) => item._id.toString() === board.workspaceId.toString(),
    );

    return {
      id: board._id.toString(),

      workspaceId: board.workspaceId.toString(),

      workspaceName: workspace?.name ?? "Unknown workspace",

      name: board.name,

      backgroundColor: board.backgroundColor,

      updatedAt: board.updatedAt.toISOString(),
    };
  });

  /*
   * ---------------------------------------------------------
   * 6. Recent activity
   * ---------------------------------------------------------
   */

  const activityLogs = await ActivityLogModel.find({
    workspaceId: {
      $in: workspaceIds,
    },
  })
    .sort({
      createdAt: -1,
    })
    .limit(8)
    .lean();

  const recentActivity: DashboardActivity[] = activityLogs.map((activity) => {
    const workspace = workspaces.find(
      (item) => item._id.toString() === activity.workspaceId.toString(),
    );

    const board = boards.find(
      (item) => item._id.toString() === activity.boardId.toString(),
    );

    return {
      id: activity._id.toString(),

      type: activity.actionType,

      message: createActivityMessage(
        activity.actionType,
        activity.details,
        board?.name,
      ),

      workspaceId: activity.workspaceId.toString(),

      workspaceName: workspace?.name ?? "Unknown workspace",

      boardId: activity.boardId.toString(),

      boardName: board?.name ?? "Unknown board",

      userId: activity.userId.toString(),

      createdAt: activity.createdAt.toISOString(),
    };
  });

  /*
   * ---------------------------------------------------------
   * 7. Return dashboard read model
   * ---------------------------------------------------------
   */

  return {
    stats: {
      workspaceCount: workspaces.length,

      boardCount: boards.length,

      activeTaskCount: activeTasks.length,
    },

    workspaces: dashboardWorkspaces,

    recentBoards,

    recentActivity,
  };
};

/**
 * Creates a human-readable activity message.
 *
 * `details` intentionally remains flexible because
 * ActivityLog currently uses Mixed for this field.
 */
function createActivityMessage(
  actionType: string,
  details: unknown,
  boardName?: string,
): string {
  const detailsRecord =
    typeof details === "object" && details !== null
      ? (details as Record<string, unknown>)
      : {};

  const title =
    typeof detailsRecord.title === "string"
      ? detailsRecord.title
      : typeof detailsRecord.name === "string"
        ? detailsRecord.name
        : undefined;

  switch (actionType) {
    case "BOARD_CREATE":
    case "BOARD_CREATED":
      return `Created board "${boardName ?? title ?? "Untitled"}"`;

    case "BOARD_UPDATE":
    case "BOARD_UPDATED":
      return `Updated board "${boardName ?? title ?? "Untitled"}"`;

    case "CARD_CREATE":
    case "CARD_CREATED":
      return `Created card "${title ?? "Untitled"}"`;

    case "CARD_UPDATE":
    case "CARD_UPDATED":
      return `Updated card "${title ?? "Untitled"}"`;

    case "CARD_MOVE":
      return `Moved card "${title ?? "Untitled"}"`;

    case "CARD_DELETE":
    case "CARD_DELETED":
      return `Deleted card "${title ?? "Untitled"}"`;

    default:
      return actionType.toLowerCase().replace(/_/g, " ");
  }
}
