import { Navigate, type RouteObject } from "react-router-dom";

import {
  AccountNotificationsPage,
  ProfilePage,
  SettingsPage,
  WorkspaceNotificationsPage,
} from "./pages";

/**
 * Two settings surfaces, split by what they belong to.
 *
 * Workspace settings read the same for every workspace, so they live on a
 * workspace-independent path. `~` is a static segment, so it outranks
 * `:workspaceId` and these routes deliberately sit outside `WorkspaceScope`.
 *
 * Account settings belong to the person, so they are not scoped at all.
 */
export const settingsRoutes: RouteObject[] = [
  {
    path: "/workspaces/~",
    element: <Navigate to="settings/general" replace />,
  },
  {
    path: "/workspaces/~/settings",
    element: <Navigate to="general" replace />,
  },
  { path: "/workspaces/~/settings/general", element: <SettingsPage /> },
  {
    path: "/workspaces/~/settings/notifications",
    element: <WorkspaceNotificationsPage />,
  },

  { path: "/account/settings", element: <Navigate to="profile" replace /> },
  { path: "/account/settings/profile", element: <ProfilePage /> },
  {
    path: "/account/settings/notifications",
    element: <AccountNotificationsPage />,
  },
];
