import { Routes, Route } from 'react-router-dom'
import LoginPage from '@/features/auth/pages/LoginPage'
import RegisterPage from '@/features/auth/pages/RegisterPage'
import { DashboardPage } from '@/features/workspaces/pages/DashboardPage'
import { WorkspacePage } from '@/features/workspaces/pages/WorkspacePage'
import { BoardPage }     from '@/features/boards/pages/BoardPage'
import NotFoundPage   from '@/components/feedback/NotFoundPage'
import LandingPage from "@/features/landing/LandingPage";
import ProtectedRoute from './ProtectedRoute'
import ProfilePage from '#components/layout/user/Profile'
import SettingPage from '@components/layout/user/SettingPage'
import FeaturesPage from '@/features/landing/FeaturesPage'
import HowItWorksPage from '@/features/landing/HowItWorksPage'
import GuestRoute from './GuestRoute'

/**
 * Application routes.
 *
 * Auth-guarded routes live inside ProtectedRoute (to be wired later).
 * For now every route renders its placeholder page.
 */
export function AppRouter() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<LandingPage />} />

      {/* Guest only */}
      <Route element={<GuestRoute />}>
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
      </Route>

      {/* Authenticated only */}
      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/boards/:boardId" element={<BoardPage />} />
      </Route>

      {/* Not found */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}
