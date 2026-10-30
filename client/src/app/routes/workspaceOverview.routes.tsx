import { Navigate, type RouteObject } from "react-router-dom";

import { DashboardPage, WorkspacePage } from "./pages";

/** Every workspace, and one workspace's own overview. */
export const workspaceOverviewRoutes: RouteObject[] = [
  { path: "/workspaces", element: <DashboardPage /> },
  { path: "/dashboard", element: <Navigate to="/workspaces" replace /> },
  { path: "/workspaces/:workspaceId", element: <WorkspacePage /> },
];
