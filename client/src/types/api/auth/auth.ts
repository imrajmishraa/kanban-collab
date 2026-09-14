export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export type AuthProvider = "password" | "google" | "github";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  emailVerified?: boolean;
}

export interface AuthProviderLink {
  provider: AuthProvider;
  linkedAt: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface RefreshResponse {
  accessToken: string;
  expiresIn: number;
  user: AuthUser;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  fullName: string;
  emailVerified: boolean;
}

export interface MeResponse {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  emailVerified: boolean;
  authProviders: AuthProviderLink[];
}
