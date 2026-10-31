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
export const LandingPage = lazy(() => import("@/pages/LandingPage"));
export const FeaturesPage = lazy(() => import("@/pages/FeaturesPage"));
export const HowItWorksPage = lazy(() => import("@/pages/HowItWorksPage"));

/* Auth */
export const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
export const RegisterPage = lazy(() => import("@/pages/auth/RegisterPage"));
export const ForgotPasswordPage = lazy(
  () => import("@/pages/auth/ForgotPasswordPage"),
);
export const OAuthCallback = lazy(() => import("@/pages/auth/OAuthCallback"));

/* Workspaces */
export const DashboardPage = lazy(
  () => import("@/pages/workspaces/DashboardPage"),
);
export const WorkspacePage = lazy(() =>
  import("@/pages/workspaces/workspaceId/WorkspacePage").then((m) => ({
    default: m.WorkspacePage,
  })),
);
export const BoardPage = lazy(() =>
  import("@/pages/workspaces/workspaceId/boards/BoardPage").then((m) => ({
    default: m.BoardPage,
  })),
);
export const MainBoard = lazy(
  () => import("@/pages/workspaces/workspaceId/boards/boardId/MainBoard"),
);
export const NotesPage = lazy(
  () => import("@/pages/workspaces/workspaceId/NotesPage"),
);
export const MemberPage = lazy(
  () => import("@/pages/workspaces/workspaceId/MemberPage"),
);
export const ActivityLogsPage = lazy(
  () => import("@/pages/workspaces/workspaceId/ActivityLogsPage"),
);

/* Settings */
export const SettingsPage = lazy(
  () => import("@/pages/workspaces/workspaceId/settings/SettingsPage"),
);
export const WorkspaceNotificationsPage = lazy(
  () =>
    import("@/pages/workspaces/workspaceId/settings/WorkspaceNotificationsPage"),
);
export const AccountNotificationsPage = lazy(
  () => import("@/pages/account/settings/AccountNotificationsPage"),
);
export const ProfilePage = lazy(
  () => import("@/pages/account/settings/ProfilePage"),
);

/* 404 */
export const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));
