import { Suspense } from "react";
import { Navigate, useRoutes, type RouteObject } from "react-router-dom";

import SplashSignal from "@/components/feedback/SplashSignal";

import { NotFoundPage } from "./routes/pages";
import { publicRoutes } from "./routes/public.routes";
import { authRoutes } from "./routes/auth.routes";
import { appRoutes } from "./routes/app.routes";
import { docsRoutes } from "./routes/docs.routes";
import { labRoutes } from "./routes/lab.routes";

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
  /*
   * Dev only. `import.meta.env.DEV` is replaced by `false` at build time, so
   * neither the route nor its chunk exists in a production bundle.
   */
  ...(import.meta.env.DEV ? labRoutes : []),
  {
    path: "/",
    element: <Navigate to="/home" replace />,
  },
  { path: "*", element: <NotFoundPage /> },
];

export function AppRouter() {
  const element = useRoutes(routes);

  return (
    <Suspense fallback={<SplashSignal phase="boot" />}>{element}</Suspense>
  );
}
