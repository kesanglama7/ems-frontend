import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api.types";

import type {
  EmployeeProfile,
  ProfileImageUploadResult,
  UpdateMyProfilePayload,
} from "../types/employee-profile.types";

export async function getMyEmployeeProfile(): Promise<EmployeeProfile> {
  const response = await api.get<
    ApiResponse<EmployeeProfile>
  >("/employees/me");

  return response.data.data;
}

export async function updateMyEmployeeProfile(
  payload: UpdateMyProfilePayload,
): Promise<ApiResponse<EmployeeProfile>> {
  const response = await api.patch<
    ApiResponse<EmployeeProfile>
  >("/employees/me", payload);

  return response.data;
}

export async function uploadMyProfileImage(
  file: File,
): Promise<ApiResponse<ProfileImageUploadResult>> {
  const formData = new FormData();

  formData.append("file", file);

  const response = await api.post<
    ApiResponse<ProfileImageUploadResult>
  >(
    "/employees/me/profile-image",
    formData,
  );

  return response.data;
}

export async function deleteMyProfileImage(): Promise<ApiResponse<null>> {
  const response = await api.delete<
    ApiResponse<null>
  >("/employees/me/profile-image");

  return response.data;
}
