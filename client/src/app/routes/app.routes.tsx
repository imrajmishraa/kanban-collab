import type { RouteObject } from "react-router-dom";

import ProtectedRoute from "../ProtectedRoute";
import AppLayout from "@/layouts/AppLayout";

import { workspaceOverviewRoutes } from "./workspaceOverview.routes";
import { workspaceScopedRoutes } from "./workspaceScoped.routes";
import { settingsRoutes } from "./settings.routes";
import { legacyRoutes } from "./legacy.routes";
import { devRoutes } from "./dev.routes";

/**
 * Everything behind the session and the app shell. The groups below are
 * independent: adding a page means editing one file, never this one.
 */
export const appRoutes: RouteObject[] = [
  /* Dev-only pages live outside the shell: the Allotment spike brings its own. */
  ...(import.meta.env.DEV ? devRoutes : []),
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
