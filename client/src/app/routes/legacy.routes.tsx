import { Navigate, type RouteObject } from "react-router-dom";

import { RequireWorkspace } from "../RequireWorkspace.tsx";
import { LegacyBoardPath } from "./LegacyBoardPath";

/**
 * The old, unscoped paths. Nothing links here any more, but bookmarks and
 * anything already shared keep working: a workspace page forwards once a
 * workspace is selected, and settings, which no longer need one, forward
 * straight away.
 */
export const legacyRoutes: RouteObject[] = [
  { path: "/boards", element: <RequireWorkspace to="/boards" /> },
  { path: "/boards/:boardId", element: <LegacyBoardPath /> },
  { path: "/notes", element: <RequireWorkspace to="/notes" /> },
  { path: "/members", element: <RequireWorkspace to="/members" /> },
  { path: "/activity", element: <RequireWorkspace to="/activity" /> },

  {
    path: "/settings",
    element: <Navigate to="/workspaces/~/settings/general" replace />,
  },
  {
    path: "/workspaces/:workspaceId/settings",
    element: <Navigate to="/workspaces/~/settings/general" replace />,
  },
  {
    path: "/workspaces/:workspaceId/settings/general",
    element: <Navigate to="/workspaces/~/settings/general" replace />,
  },
  {
    path: "/workspaces/:workspaceId/settings/notifications",
    element: <Navigate to="/workspaces/~/settings/notifications" replace />,
  },
  {
    path: "/user/profile",
    element: <Navigate to="/account/settings/profile" replace />,
  },
];
