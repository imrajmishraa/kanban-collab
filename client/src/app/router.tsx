import { Suspense } from "react";
import { Navigate, useRoutes, type RouteObject } from "react-router-dom";

import LoadingScreen from "@components/feedback/LoadingScreen";

import { NotFoundPage } from "./routes/pages";
import { publicRoutes } from "./routes/public.routes";
import { authRoutes } from "./routes/auth.routes";
import { appRoutes } from "./routes/app.routes";
import { docsRoutes } from "./routes/docs.routes";

/**
 * The route table is assembled here and nowhere else. Each group lives in its
 * own module under `app/routes`, so a change to one area is a change to one
 * file. React Router ranks the paths itself, so the order below is for reading,
 * not for matching.
 */
const routes: RouteObject[] = [
  ...publicRoutes,
  ...authRoutes,
  ...docsRoutes,
  ...appRoutes,
  {
    path: "/",
    element: <Navigate to="/home" replace />,
  },
  { path: "*", element: <NotFoundPage /> },
];

export function AppRouter() {
  const element = useRoutes(routes);

  return (
    <Suspense fallback={<LoadingScreen message="Loading…" />}>
      {element}
    </Suspense>
  );
}
