import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api.types";

import type {
  AuthUser,
  ChangePasswordPayload,
  LoginPayload,
} from "../types/auth.types";

export async function login(
  payload: LoginPayload,
): Promise<AuthUser> {
  const response = await api.post<
    ApiResponse<AuthUser>
  >("/auth/login", payload);

  return response.data.data;
}

export async function getMe(): Promise<AuthUser> {
  const response = await api.get<
    ApiResponse<AuthUser>
  >("/auth/me");

  return response.data.data;
}

export async function logout(): Promise<void> {
  await api.post("/auth/logout");
}

export async function changePassword(
  payload: ChangePasswordPayload,
): Promise<ApiResponse<null>> {
  const response = await api.post<
    ApiResponse<null>
  >("/auth/change-password", payload);

  return response.data;
}
