export type UserRole = "ADMIN" | "EMPLOYEE";

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
  status: string;
}

export interface LoginPayload {
  email: string;
  password: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}
