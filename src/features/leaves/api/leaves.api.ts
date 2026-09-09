import { api } from "@/lib/api";
import type {
  CancelLeaveRequestResponse,
  CreateLeaveRequestPayload,
  CreateLeaveRequestResponse,
  LeaveRequestDetailResponse,
  LeaveRequestListResponse,
  LeavePreviewResponse,
  MyLeaveBalanceResponse,
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

export async function previewLeaveRequest(payload: CreateLeaveRequestPayload): Promise<LeavePreviewResponse> {
  return (await api.post<LeavePreviewResponse>("/leaves/preview", payload)).data;
}

export async function getMyLeaveBalance(year: number): Promise<MyLeaveBalanceResponse> {
  return (await api.get<MyLeaveBalanceResponse>("/leaves/me/balance", { params: { year } })).data;
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
