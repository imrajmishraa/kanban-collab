import type { RouteObject } from "react-router-dom";

import { WorkspaceScope } from "../WorkspaceScope";
import {
  ActivityLogsPage,
  BoardPage,
  MainBoard,
  MemberPage,
  NotesPage,
} from "./pages";

/**
 * Pages that only exist inside a workspace. The workspace is in the path, so a
 * link is self-contained and survives a reload; `WorkspaceScope` keeps the
 * store in step with it.
 */
export const workspaceScopedRoutes: RouteObject[] = [
  {
    element: <WorkspaceScope />,
    children: [
      { path: "/workspaces/:workspaceId/boards", element: <BoardPage /> },
      {
        path: "/workspaces/:workspaceId/boards/:boardId",
        element: <MainBoard />,
      },
      { path: "/workspaces/:workspaceId/notes", element: <NotesPage /> },
      { path: "/workspaces/:workspaceId/members", element: <MemberPage /> },
      {
        path: "/workspaces/:workspaceId/activity",
        element: <ActivityLogsPage />,
      },
    ],
  },
];
