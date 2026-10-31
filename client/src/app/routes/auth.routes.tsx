import { Navigate, type RouteObject } from "react-router-dom";

import GuestRoute from "../GuestRoute";
import AuthLayout from "@/layouts/AuthLayout";
import {
  ForgotPasswordPage,
  LoginPage,
  OAuthCallback,
  RegisterPage,
} from "./pages";

/** Sign in, sign up, reset, and the OAuth return. */
export const authRoutes: RouteObject[] = [
  /* The callback has to run whether or not a session already exists, so it
     sits outside the guest gate. */
  { path: "/auth/callback", element: <OAuthCallback /> },
  {
    element: <GuestRoute />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          { path: "/auth", element: <Navigate to="/auth/login" replace /> },
          { path: "/auth/login", element: <LoginPage /> },
          { path: "/auth/register", element: <RegisterPage /> },
          { path: "/auth/forgot-password", element: <ForgotPasswordPage /> },
        ],
      },
    ],
  },
];
