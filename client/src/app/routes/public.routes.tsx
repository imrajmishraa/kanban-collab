import type { RouteObject } from "react-router-dom";

import PublicLayout from "@/layouts/PublicLayout";
import {
  CookiesPage,
  FeaturesPage,
  FeedbackPage,
  HelpPage,
  HomePage,
  HowItWorksPage,
  PricingPage,
  PrivacyPage,
  SolutionCategoryPage,
  SolutionsPage,
  TermsPage,
  TestimonialsPage,
  TourPage,
  UseCasesPage,
} from "./pages";

/** Marketing surfaces. Public, no auth, their own layout. */
export const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    children: [
      { path: "/home", element: <HomePage /> },
      { path: "/features", element: <FeaturesPage /> },
      { path: "/how-it-works", element: <HowItWorksPage /> },
      { path: "/tour", element: <TourPage /> },
      { path: "/use-cases", element: <UseCasesPage /> },
      { path: "/pricing", element: <PricingPage /> },
      { path: "/solutions", element: <SolutionsPage /> },
      {
        path: "/solutions/teams",
        element: <SolutionCategoryPage slug="teams" />,
      },
      {
        path: "/solutions/workflow",
        element: <SolutionCategoryPage slug="workflow" />,
      },
      /* The plural was in the nav before the page existed; keep it working. */
      {
        path: "/solutions/workflows",
        element: <SolutionCategoryPage slug="workflow" />,
      },
      {
        path: "/solutions/deployment",
        element: <SolutionCategoryPage slug="deployment" />,
      },
      {
        path: "/solutions/constraints",
        element: <SolutionCategoryPage slug="constraints" />,
      },
      { path: "/testimonials", element: <TestimonialsPage /> },
      { path: "/help", element: <HelpPage /> },
      { path: "/feedback", element: <FeedbackPage /> },
      { path: "/cookies", element: <CookiesPage /> },
      { path: "/terms", element: <TermsPage /> },
      { path: "/privacy", element: <PrivacyPage /> },
    ],
  },
];
