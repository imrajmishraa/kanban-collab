import { Route, Routes } from "react-router-dom";

import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";

import PublicLayout from "./layouts/PublicLayout";
import AppLayout from "./layouts/AppLayout";

import NotFoundPage from "@/components/feedback/NotFoundPage";

import FeaturesPage from "@/features/marketing/pages/FeaturesPage";
import HowItWorksPage from "@/features/marketing/pages/HowItWorksPage";
import LandingPage from "@/features/landing/LandingPage";

import LoginPage from "@/features/auth/pages/LoginPage";
import RegisterPage from "@/features/auth/pages/RegisterPage";

import { BoardPage } from "@/features/boards/pages/BoardPage";
import DashboardPage from "@/features/dashboard/pages/DashboardPage";
import { WorkspacePage } from "@/features/workspaces/pages/WorkspacePage";

import ProfilePage from "@/features/user/ProfilePage";
import MemberPage from "@components/layout/dashboard/members/MemberPage";
import SettingsPage from "@/features/settings/SettingsPage";
import MainBoard from "@/features/boards/pages/MainBoard";

export function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/features" element={<FeaturesPage />} />
        <Route path="/how-it-works" element={<HowItWorksPage />} />

        {/* Guest */}
        <Route element={<GuestRoute />}>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route path="/auth/register" element={<RegisterPage />} />
        </Route>
      </Route>

      {/* Authenticated */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/user/profile" element={<ProfilePage />} />
          <Route path="/settings" element={<SettingsPage />} />

          <Route path="/dashboard" element={<DashboardPage />} />

          <Route path="/members" element={<MemberPage />} />

          <Route path="/workspace/:workspaceId" element={<WorkspacePage />} />

          <Route path="/boards" element={<MainBoard />} />

          <Route path="/boards/:boardId" element={<BoardPage />} />
        </Route>
      </Route>

      {/* Not found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
