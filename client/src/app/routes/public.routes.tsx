import type { RouteObject } from "react-router-dom";

import PublicLayout from "@/layouts/PublicLayout";
import { FeaturesPage, HowItWorksPage, HomePage } from "./pages";

/** Marketing surfaces. Public, no auth, their own layout. */
export const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { path: "/home", element: <HomePage /> },
      { path: "/features", element: <FeaturesPage /> },
      { path: "/how-it-works", element: <HowItWorksPage /> },
    ],
  },
];
