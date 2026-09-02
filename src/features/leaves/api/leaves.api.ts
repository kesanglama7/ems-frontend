import { api } from "@/lib/api";
import type {
  CancelLeaveRequestResponse,
  CreateLeaveRequestPayload,
  CreateLeaveRequestResponse,
  LeaveRequestDetailResponse,
  LeaveRequestListResponse,
} from "../types/leave.types";

export async function createLeaveRequest(
  payload: CreateLeaveRequestPayload,
): Promise<CreateLeaveRequestResponse> {
  const response = await api.post<CreateLeaveRequestResponse>(
    "/leaves",
    payload,
  );
  return response.data;
}

export async function getMyLeaves(): Promise<LeaveRequestListResponse> {
  const response = await api.get<LeaveRequestListResponse>("/leaves/me");
  return response.data;
}

export async function getMyLeaveDetail(
  leaveId: string,
): Promise<LeaveRequestDetailResponse> {
  const response = await api.get<LeaveRequestDetailResponse>(
    `/leaves/me/${leaveId}`,
  );
  return response.data;
}

export async function cancelLeave(
  leaveId: string,
): Promise<CancelLeaveRequestResponse> {
  const response = await api.patch<CancelLeaveRequestResponse>(
    `/leaves/me/${leaveId}/cancel`,
  );
  return response.data;
}
