export interface AuthUser {
  id: string;
  email: string;
  fullName: string;
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




export type AuthStatus = "loading" | "authenticated" | "unauthenticated";
