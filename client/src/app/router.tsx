import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";

import PublicLayout from "./layouts/PublicLayout";
import AppLayout from "./layouts/AppLayout";
import AuthLayout from "./layouts/AuthLayout";

import LoadingScreen from "@components/feedback/LoadingScreen";

// Public / marketing
const LandingPage = lazy(() => import("@/features/landing/LandingPage"));
const FeaturesPage = lazy(
  () => import("@/features/marketing/pages/FeaturesPage"),
);
const HowItWorksPage = lazy(
  () => import("@/features/marketing/pages/HowItWorksPage"),
);

// Auth
const LoginPage = lazy(() => import("@/features/auth/pages/LoginPage"));
const RegisterPage = lazy(() => import("@/features/auth/pages/RegisterPage"));
const ForgotPasswordPage = lazy(
  () => import("@/features/auth/pages/ForgotPasswordPage"),
);
const OAuthCallback = lazy(() => import("@/features/auth/OAuthCallback"));

// App shell
const DashboardPage = lazy(
  () => import("@/features/dashboard/pages/DashboardPage"),
);
const WorkspacePage = lazy(() =>
  import("@/features/workspaces/pages/WorkspacePage").then((m) => ({
    default: m.WorkspacePage,
  })),
);
const BoardPage = lazy(() =>
  import("@/features/boards/pages/BoardPage").then((m) => ({
    default: m.BoardPage,
  })),
);
const MainBoard = lazy(() => import("@/features/boards/pages/MainBoard"));
const MemberPage = lazy(
  () => import("@components/layout/dashboard/members/MemberPage"),
);
const ProfilePage = lazy(() => import("@/features/user/ProfilePage"));
const SettingsPage = lazy(() => import("@/features/settings/SettingsPage"));

// 404
const NotFoundPage = lazy(() => import("@/components/feedback/NotFoundPage"));

export function AppRouter() {
  return (
    <Suspense fallback={<LoadingScreen message="Loading…" />}>
      <Routes>
        {/* Public — landing, marketing, no auth required */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/features" element={<FeaturesPage />} />
          <Route path="/how-it-works" element={<HowItWorksPage />} />
        </Route>

        {/* OAuth callback — must run in BOTH states */}
        <Route path="/auth/callback" element={<OAuthCallback />} />

        {/* Guest-only — login, register, password reset */}
        <Route element={<GuestRoute />}>
          <Route element={<AuthLayout />}>
            <Route
              path="/auth"
              element={<Navigate to="/auth/login" replace />}
            />
            <Route path="/auth/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route
              path="/auth/forgot-password"
              element={<ForgotPasswordPage />}
            />
          </Route>
        </Route>

        {/* Authenticated — everything inside the app shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/workspace/:workspaceId" element={<WorkspacePage />} />
            <Route path="/boards" element={<BoardPage />} />
            <Route path="/board/:boardId" element={<MainBoard />} />
            <Route path="/members" element={<MemberPage />} />
            <Route path="/user/profile" element={<ProfilePage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        {/* 404 */}
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
