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

/**
 * PERFORMANCE NOTE — this function used to load every board document
 * (full docs, including column arrays) and every active card document,
 * just to compute counts. With 1,763 boards that meant shipping ~1,800
 * documents from Mongo to Node on every dashboard load (measured: 2.4 s).
 *
 * It now ships:
 *   - 6 workspace rows          (name only)
 *   - 1 board row per board     (workspaceId only — ~40 bytes each)
 *   - 6 recent board rows       (display fields only)
 *   - 8 activity rows           (unchanged)
 *   - a count per board WITH active cards (Mongo-side $group aggregate —
 *     in the measured case, 4 numbers)
 *   - board names for the activity rows it actually shows (≤ 8 rows)
 *
 * Return shape is identical to the previous version.
 */
export const getDashboard = async (
  userId: string,
): Promise<DashboardResponse> => {
  if (!Types.ObjectId.isValid(userId)) {
    throw new Error(`Invalid user ID: ${userId}`);
  }

  const userObjectId = new Types.ObjectId(userId);

  /*
   * ---------------------------------------------------------
   * 1. Workspaces — name only (the join key and display label)
   * ---------------------------------------------------------
   */

  const workspaces = await WorkspaceModel.find({
    "members.userId": userObjectId,
  })
    .select("name")
    .lean();

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

  const workspaceNameById = new Map(
    workspaces.map((workspace) => [workspace._id.toString(), workspace.name]),
  );

  /*
   * ---------------------------------------------------------
   * 2. Three independent queries in parallel:
   *      a) board → workspaceId pairs (ids only — never full boards)
   *      b) 6 most recently updated boards (display fields only)
   *      c) 8 most recent activity log rows
   * ---------------------------------------------------------
   */

  const [boardWorkspacePairs, recentBoardDocs, activityLogs] =
    await Promise.all([
      BoardModel.find({
        workspaceId: { $in: workspaceIds },
      })
        .select("workspaceId")
        .lean(),

      BoardModel.find({
        workspaceId: { $in: workspaceIds },
      })
        .sort({ updatedAt: -1 })
        .limit(6)
        .select("name backgroundColor updatedAt workspaceId")
        .lean(),

      ActivityLogModel.find({
        workspaceId: { $in: workspaceIds },
      })
        .sort({ createdAt: -1 })
        .limit(8)
        .lean(),
    ]);

  /*
   * ---------------------------------------------------------
   * 3. Roll up board counts per workspace from the id pairs
   * ---------------------------------------------------------
   */

  const workspaceIdByBoardId = new Map<string, string>();
  const boardCountByWorkspaceId = new Map<string, number>();

  for (const { _id, workspaceId } of boardWorkspacePairs) {
    const id = _id.toString();
    const wid = workspaceId.toString();

    workspaceIdByBoardId.set(id, wid);
    boardCountByWorkspaceId.set(
      wid,
      (boardCountByWorkspaceId.get(wid) ?? 0) + 1,
    );
  }

  /*
   * ---------------------------------------------------------
   * 4. Active task counts — grouped in Mongo, never shipped
   *    as documents. The result only contains boards that
   *    actually have active cards.
   * ---------------------------------------------------------
   */

  const activeTasksByBoard =
    boardWorkspacePairs.length > 0
      ? await CardModel.aggregate<{ _id: Types.ObjectId; count: number }>([
          {
            $match: {
              boardId: { $in: boardWorkspacePairs.map((board) => board._id) },
              isArchived: false,
            },
          },
          {
            $group: {
              _id: "$boardId",
              count: { $sum: 1 },
            },
          },
        ])
      : [];

  const activeTaskCountByWorkspaceId = new Map<string, number>();
  let activeTaskCount = 0;

  for (const { _id: boardId, count } of activeTasksByBoard) {
    const wid = workspaceIdByBoardId.get(boardId.toString());
    if (wid === undefined) continue;

    activeTaskCountByWorkspaceId.set(
      wid,
      (activeTaskCountByWorkspaceId.get(wid) ?? 0) + count,
    );
    activeTaskCount += count;
  }

  /*
   * ---------------------------------------------------------
   * 5. Workspaces read model
   * ---------------------------------------------------------
   */

  const dashboardWorkspaces: DashboardWorkspace[] = workspaces.map(
    (workspace) => {
      const id = workspace._id.toString();

      return {
        id,
        name: workspace.name,
        boardCount: boardCountByWorkspaceId.get(id) ?? 0,
        activeTaskCount: activeTaskCountByWorkspaceId.get(id) ?? 0,
      };
    },
  );

  /*
   * ---------------------------------------------------------
   * 6. Recent boards
   * ---------------------------------------------------------
   */

  const recentBoards: DashboardBoard[] = recentBoardDocs.map((board) => ({
    id: board._id.toString(),
    workspaceId: board.workspaceId.toString(),
    workspaceName:
      workspaceNameById.get(board.workspaceId.toString()) ??
      "Unknown workspace",
    name: board.name,
    backgroundColor: board.backgroundColor,
    updatedAt: board.updatedAt.toISOString(),
  }));

  /*
   * ---------------------------------------------------------
   * 7. Recent activity — fetch only the board names it shows,
   *    instead of having all 1,763 boards in memory to join
   *    against 8 rows.
   * ---------------------------------------------------------
   */

  const activityBoardIds = [...new Set(activityLogs.map((a) => a.boardId))];

  const activityBoards =
    activityBoardIds.length > 0
      ? await BoardModel.find({ _id: { $in: activityBoardIds } })
          .select("name")
          .lean()
      : [];

  const boardNameById = new Map(
    activityBoards.map((board) => [board._id.toString(), board.name]),
  );

  const recentActivity: DashboardActivity[] = activityLogs.map((activity) => ({
    id: activity._id.toString(),
    type: activity.actionType,
    message: createActivityMessage(
      activity.actionType,
      activity.details,
      boardNameById.get(activity.boardId.toString()),
    ),
    workspaceId: activity.workspaceId.toString(),
    workspaceName:
      workspaceNameById.get(activity.workspaceId.toString()) ??
      "Unknown workspace",
    boardId: activity.boardId.toString(),
    boardName:
      boardNameById.get(activity.boardId.toString()) ?? "Unknown board",
    userId: activity.userId.toString(),
    createdAt: activity.createdAt.toISOString(),
  }));

  /*
   * ---------------------------------------------------------
   * 8. Return dashboard read model
   * ---------------------------------------------------------
   */

  return {
    stats: {
      workspaceCount: workspaces.length,
      boardCount: boardWorkspacePairs.length,
      activeTaskCount,
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
    typeof detailsRecord["title"] === "string"
      ? detailsRecord["title"]
      : typeof detailsRecord["name"] === "string"
        ? detailsRecord["name"]
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
