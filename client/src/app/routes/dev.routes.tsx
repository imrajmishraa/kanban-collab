import type { RouteObject } from "react-router-dom";

import TooltipLabPage from "@/pages/TooltipLabPage";

/**
 * Dev-only routes.
 *
 * They exist while `import.meta.env.DEV` is true and are absent from a production build
 * entirely, so nothing here can be reached from a deployed app. Delete this file and its
 * line in `router.tsx` when the lab has done its job.
 */
export const devRoutes: RouteObject[] = import.meta.env.DEV
  ? [{ path: "/tooltip-lab", element: <TooltipLabPage /> }]
  : [];
