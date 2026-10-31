import { create } from "zustand";

import {
  loginRequest,
  logoutRequest,
  refreshRequest,
  registerRequest,
} from "@/features/auth/api/authApi";

import type { AuthStatus, AuthUser } from "@/types/auth";

interface AuthState {
  status: AuthStatus;
  user: AuthUser | null;
  accessToken: string | null;

  setAuth: (token: string, user: AuthUser) => void;
  clearAuth: () => void;

  login: (
    email: string,
    password: string,
    rememberMe?: boolean,
  ) => Promise<void>;
  register: (
    fullName: string,
    email: string,
    password: string,
  ) => Promise<void>;
  logout: () => Promise<void>;
  refresh: () => Promise<boolean>;
  restoreSession: () => Promise<void>;
}

/**
 * Drops the selected workspace. Imported lazily because `activeWorkspace`
 * imports this store, and a static import would be a cycle.
 */
async function clearActiveWorkspace(): Promise<void> {
  const { useActiveWorkspace } = await import("@/stores/activeWorkspace");
  useActiveWorkspace.getState().clearActiveWorkspace();
}

export const useAuthStore = create<AuthState>()((set, get) => ({
  status: "loading",
  user: null,
  accessToken: null,

  setAuth: (token, user) =>
    set({ status: "authenticated", user, accessToken: token }),

  clearAuth: () =>
    set({ status: "unauthenticated", user: null, accessToken: null }),

  login: async (email, password, rememberMe = false) => {
    const response = await loginRequest({ email, password, rememberMe });

    if (!response.success || !response.data) {
      throw new Error(response.message || "Login failed.");
    }

    const { accessToken, user } = response.data;
    set({ status: "authenticated", user, accessToken });

    /* A fresh login starts with nothing selected: the sidebar opens on the
       account view and the navbar shows no workspace. */
    await clearActiveWorkspace();
  },

  register: async (fullName, email, password) => {
    const response = await registerRequest({ fullName, email, password });

    if (!response.success || !response.data) {
      throw new Error(response.message || "Registration failed.");
    }

    await clearActiveWorkspace();
  },

  logout: async () => {
    try {
      await logoutRequest();
    } finally {
      await clearActiveWorkspace();
      set({ status: "unauthenticated", user: null, accessToken: null });
    }
  },

  refresh: async () => {
    try {
      const response = await refreshRequest();

      if (!response.success || !response.data) {
        set({ status: "unauthenticated", user: null, accessToken: null });
        return false;
      }

      const { accessToken, user } = response.data;
      set({ status: "authenticated", user, accessToken });
      return true;
    } catch {
      set({ status: "unauthenticated", user: null, accessToken: null });
      return false;
    }
  },

  restoreSession: async () => {
    const ok = await get().refresh();
    if (!ok) {
      set({ status: "unauthenticated" });
    }
  },
}));
