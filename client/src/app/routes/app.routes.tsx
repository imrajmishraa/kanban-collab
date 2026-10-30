import type { RouteObject } from "react-router-dom";

import ProtectedRoute from "../ProtectedRoute";
import AppLayout from "../layouts/AppLayout";

import { workspaceOverviewRoutes } from "./workspaceOverview.routes";
import { workspaceScopedRoutes } from "./workspaceScoped.routes";
import { settingsRoutes } from "./settings.routes";
import { legacyRoutes } from "./legacy.routes";

/**
 * Everything behind the session and the app shell. The groups below are
 * independent: adding a page means editing one file, never this one.
 */
export const appRoutes: RouteObject[] = [
  {
    element: <ProtectedRoute />,
    children: [
      {
        element: <AppLayout />,
        children: [
          ...workspaceOverviewRoutes,
          ...workspaceScopedRoutes,
          ...settingsRoutes,
          ...legacyRoutes,
        ],
      },
    ],
  },
];
