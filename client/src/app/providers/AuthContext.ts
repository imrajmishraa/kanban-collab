import { createContext } from "react";

import type { AuthStatus, AuthUser } from "@/types/api/auth/auth";

export interface AuthContextValue {
  status: AuthStatus;

  user: AuthUser | null;

  accessToken: string | null;

  isAuthenticated: boolean;
  isLoading: boolean;

  register: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<void>;

  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;

  logout: () => Promise<void>;

  refresh: () => Promise<boolean>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
