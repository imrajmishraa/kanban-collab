import type { RouteObject } from "react-router-dom";

import DocsLayout from "@/layouts/DocsLayout";
import {
  DocsIntroPage,
  DocsActivateLicensePage,
  DocsLicenseTroubleshootingPage,
} from "./pages";

/**
 * The documentation surface. Public, no session, its own shell — the marketing
 * layout is a single column of full-width bands, which is the wrong shape for
 * something you read.
 *
 * One child today. Every page added under `/docs` hangs off the same layout, so
 * the sidebar and the table of contents come for free.
 */
export const docsRoutes: RouteObject[] = [
  {
    element: <DocsLayout />,
    children: [
      { path: "/docs", element: <DocsIntroPage /> },
      { path: "/docs/license/activate", element: <DocsActivateLicensePage /> },
      {
        path: "/docs/license/troubleshooting",
        element: <DocsLicenseTroubleshootingPage />,
      },
    ],
  },
];
