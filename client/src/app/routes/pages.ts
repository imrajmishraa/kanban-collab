import { lazy } from "react";

/**
 * Every page the router mounts, wrapped in `lazy` once.
 *
 * This file exists so the route modules can stay pure data: a route file that
 * declared its own `const Page = lazy(...)` would be exporting an array while
 * declaring a component locally, which is exactly what
 * react-refresh/only-export-components reports. Here the exports are all
 * components, so there is nothing for the rule to complain about.
 */

/* Public */
export const LandingPage = lazy(() => import("@/features/landing/LandingPage"));
export const FeaturesPage = lazy(
  () => import("@/features/marketing/pages/FeaturesPage"),
);
export const HowItWorksPage = lazy(
  () => import("@/features/marketing/pages/HowItWorksPage"),
);

/* Auth */
export const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
export const RegisterPage = lazy(
  () => import("@/features/auth/pages/RegisterPage"),
);
export const ForgotPasswordPage = lazy(
  () => import("@/features/auth/pages/ForgotPasswordPage"),
);
export const OAuthCallback = lazy(
  () => import("@/features/auth/OAuthCallback"),
);

/* Workspaces */
export const DashboardPage = lazy(
  () => import("@/features/dashboard/pages/DashboardPage"),
);
export const WorkspacePage = lazy(() =>
  import("@/features/workspaces/pages/WorkspacePage").then((m) => ({
    default: m.WorkspacePage,
  })),
);
export const BoardPage = lazy(() =>
  import("@/features/boards/pages/BoardPage").then((m) => ({
    default: m.BoardPage,
  })),
);
export const MainBoard = lazy(
  () => import("@/features/boards/pages/MainBoard"),
);
export const NotesPage = lazy(() => import("@/features/notes/pages/NotesPage"));
export const MemberPage = lazy(
  () => import("@components/layout/dashboard/members/MemberPage"),
);
export const ActivityLogsPage = lazy(
  () => import("@/features/activity/pages/ActivityLogsPage"),
);

/* Settings */
export const SettingsPage = lazy(
  () => import("@/features/settings/pages/SettingsPage"),
);
export const WorkspaceNotificationsPage = lazy(
  () => import("@/features/settings/pages/WorkspaceNotificationsPage"),
);
export const AccountNotificationsPage = lazy(
  () => import("@/features/settings/pages/AccountNotificationsPage"),
);
export const ProfilePage = lazy(() => import("@/features/user/ProfilePage"));

/* 404 */
export const NotFoundPage = lazy(
  () => import("@/components/feedback/NotFoundPage"),
);
