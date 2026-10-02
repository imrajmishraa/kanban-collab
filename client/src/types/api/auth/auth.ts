export type AuthStatus = "loading" | "authenticated" | "unauthenticated";

export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
  avatarUrl?: string | null;
  emailVerified?: boolean;
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

