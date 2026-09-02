import { api } from "@/lib/api";
import type {
  AdminLeaveQueryParams,
  AdminLeaveRequestListResponse,
  LeaveRequestDetailResponse,
  ReviewLeavePayload,
  ReviewLeaveResponse,
} from "../types/leave.types";

export async function getAdminLeaves(
  params?: AdminLeaveQueryParams,
): Promise<AdminLeaveRequestListResponse> {
  const response = await api.get<AdminLeaveRequestListResponse>(
    "/admin/leaves",
    { params },
  );
  return response.data;
}

export async function getAdminLeaveDetail(
  leaveId: string,
): Promise<LeaveRequestDetailResponse> {
  const response = await api.get<LeaveRequestDetailResponse>(
    `/admin/leaves/${leaveId}`,
  );
  return response.data;
}

export async function approveLeave({
  leaveId,
  payload,
}: {
  leaveId: string;
  payload?: ReviewLeavePayload;
}): Promise<ReviewLeaveResponse> {
  const response = await api.patch<ReviewLeaveResponse>(
    `/admin/leaves/${leaveId}/approve`,
    payload,
  );
  return response.data;
}

export async function rejectLeave({
  leaveId,
  payload,
}: {
  leaveId: string;
  payload?: ReviewLeavePayload;
}): Promise<ReviewLeaveResponse> {
  const response = await api.patch<ReviewLeaveResponse>(
    `/admin/leaves/${leaveId}/reject`,
    payload,
  );
  return response.data;
}
