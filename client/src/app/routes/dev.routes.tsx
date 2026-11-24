import type { RouteObject } from "react-router-dom";

import LayoutSpikePage from "@/pages/LayoutSpikePage";

/**
 * Dev-only pages, outside the app shell.
 *
 * The spike mounts its own `Allotment` group and the real rail and column
 * inside it, so it cannot sit under `AppLayout`: two shells fighting over the
 * same `fixed` edges would measure the wrong thing. Mounted only while
 * `import.meta.env.DEV`, so a production build has no route and no chunk.
 */
export const devRoutes: RouteObject[] = [
  { path: "/layout-spike", element: <LayoutSpikePage /> },
];
