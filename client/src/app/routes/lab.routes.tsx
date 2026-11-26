import type { RouteObject } from "react-router-dom";

import { ToasterLabPage } from "./pages";

/**
 * The lab: pages that exist so a component can be looked at, not so they can be
 * shipped.
 *
 * Mounted only in a dev build — `app/router.tsx` spreads this array behind
 * `import.meta.env.DEV`, and `routes/pages.ts` puts the lazy import behind the
 * same flag, so neither the route nor its chunk reaches production. Outside
 * every layout on purpose: a lab wants the whole canvas and no navbar.
 */
export const labRoutes: RouteObject[] = [
  { path: "/lab/toasts", element: <ToasterLabPage /> },
];
