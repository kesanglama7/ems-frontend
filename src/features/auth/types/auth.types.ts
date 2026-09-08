export type UserRole = "ADMIN" | "EMPLOYEE";
export type UserStatus = "ACTIVE" | "INACTIVE";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  status?: UserStatus;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken: string;
  accessTokenExpiresIn: number;
  refreshTokenExpiresIn: number;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface RefreshTokenPayload {
  refreshToken: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
