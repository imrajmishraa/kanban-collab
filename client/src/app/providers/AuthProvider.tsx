import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { loginRequest, logoutRequest, refreshRequest, signUpRequest } from "@/api/authApi";

import {
  clearAccessToken,
  getAccessToken,
  setAccessToken,
} from "@/stores/useAuthStore";

import type { AuthStatus, AuthUser } from "@/types/auth";

interface AuthContextValue {
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
  login: (email: string, password: string) => Promise<void>;

  logout: () => Promise<void>;

  refresh: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState<AuthStatus>("loading");

  const [user, setUser] = useState<AuthUser | null>(null);

  const [accessToken, setTokenState] = useState<string | null>(
    getAccessToken(),
  );

  /**
   * Update access token in both:
   * - Zustand/store
   * - React state
   */
  const updateToken = useCallback((token: string | null) => {
    if (token) {
      setAccessToken(token);
    } else {
      clearAccessToken();
    }

    setTokenState(token);
  }, []);

  /**
   * Mark the application as authenticated.
   */
  const authenticate = useCallback(
    (token: string, authenticatedUser: AuthUser) => {
      updateToken(token);

      setUser(authenticatedUser);
      setStatus("authenticated");
    },
    [updateToken],
  );

  /**
   * Clear the entire authentication state.
   */
  const clearAuthentication = useCallback(() => {
    clearAccessToken();

    setTokenState(null);
    setUser(null);
    setStatus("unauthenticated");
  }, []);

  /**
   * Refresh the access token using the HTTP-only
   * refresh-token cookie.
   */
  const refresh = useCallback(async (): Promise<boolean> => {
    try {
      const response = await refreshRequest();

      if (!response.success || !response.data) {
        clearAuthentication();
        return false;
      }

      const { accessToken: token, user: authenticatedUser } = response.data;

      authenticate(token, authenticatedUser);

      return true;
    } catch {
      clearAuthentication();

      return false;
    }
  }, [authenticate, clearAuthentication]);

  /**
   * register with fullName, email and password.
   */
  const register = useCallback(
    async (
      fullName: string,
      email: string,
      password: string,
    ): Promise<void> => {
      const response = await signUpRequest({
        fullName,
        email,
        password,
      });

      setUser(response.data.user);
      setStatus("authenticated");
    },
    [],
  );

  /**
   * Login with email and password.
   */
  const login = useCallback(
    async (email: string, password: string): Promise<void> => {
      const response = await loginRequest({
        email,
        password,
      });

      if (!response.success || !response.data) {
        throw new Error(response.message || "Login failed.");
      }

      const { accessToken: token, user: authenticatedUser } = response.data;

      authenticate(token, authenticatedUser);
    },
    [authenticate],
  );

  /**
   * Logout the current user.
   */
  const logout = useCallback(async (): Promise<void> => {
    try {
      await logoutRequest();
    } finally {
      clearAuthentication();
    }
  }, [clearAuthentication]);

  /**
   * Restore authentication when the SPA starts.
   *
   * The refresh token is stored in an HTTP-only cookie,
   * so the browser automatically sends it with this request.
   */
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      try {
        const response = await refreshRequest();

        if (cancelled) return;

        if (!response.success || !response.data) {
          clearAuthentication();
          return;
        }

        const { accessToken: token, user: authenticatedUser } = response.data;

        authenticate(token, authenticatedUser);
      } catch {
        if (cancelled) return;

        clearAuthentication();
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [authenticate, clearAuthentication]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      accessToken,

      isAuthenticated: status === "authenticated",

      isLoading: status === "loading",

      register,
      login,
      logout,
      refresh,
    }),
    [status, user, accessToken, login, logout, refresh],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Access authentication state and actions.
 */
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider.");
  }

  return context;
}

