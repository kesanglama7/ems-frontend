import { api } from "@/lib/api";
import type { ApiResponse } from "@/types/api.types";
import type {
  OfficeSetting,
  UpdateOfficeSettingPayload,
} from "../types/office-settings.types";

export async function getOfficeSettings(): Promise<OfficeSetting> {
  const response = await api.get<ApiResponse<OfficeSetting>>(
    "/office-settings",
  );
  return response.data.data;
}

export async function updateOfficeSettings(
  payload: UpdateOfficeSettingPayload,
): Promise<OfficeSetting> {
  const response = await api.patch<ApiResponse<OfficeSetting>>(
    "/office-settings",
    payload,
  );
  return response.data.data;
}
