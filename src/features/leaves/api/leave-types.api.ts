import { api } from "@/lib/api";
import type {
  CreateLeaveTypePayload,
  CreateLeaveTypeResponse,
  DeleteLeaveTypeResponse,
  LeaveTypeListResponse,
  UpdateLeaveTypePayload,
  UpdateLeaveTypeResponse,
} from "../types/leave.types";

export async function getLeaveTypes(): Promise<LeaveTypeListResponse> {
  const response = await api.get<LeaveTypeListResponse>("/leave-types");
  return response.data;
}

export async function createLeaveType(
  payload: CreateLeaveTypePayload,
): Promise<CreateLeaveTypeResponse> {
  const response = await api.post<CreateLeaveTypeResponse>(
    "/leave-types",
    payload,
  );
  return response.data;
}

export async function updateLeaveType({
  leaveTypeId,
  payload,
}: {
  leaveTypeId: string;
  payload: UpdateLeaveTypePayload;
}): Promise<UpdateLeaveTypeResponse> {
  const response = await api.patch<UpdateLeaveTypeResponse>(
    `/leave-types/${leaveTypeId}`,
    payload,
  );
  return response.data;
}

export async function deleteLeaveType(
  leaveTypeId: string,
): Promise<DeleteLeaveTypeResponse> {
  const response = await api.delete<DeleteLeaveTypeResponse>(
    `/leave-types/${leaveTypeId}`,
  );
  return response.data;
}
