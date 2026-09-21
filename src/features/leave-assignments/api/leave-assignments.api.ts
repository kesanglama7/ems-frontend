import { api } from "@/lib/api";
import type {
  AssignmentLeaveType,
  AssignLeavePayload,
  AssignmentResponse,
  RemoveAssignmentPayload,
} from "../types/leave-assignment.types";
export async function getAssignmentLeaveTypes() {
  return (
    await api.get<{ success: boolean; data: AssignmentLeaveType[] }>(
      "/leave-types",
    )
  ).data;
}
export async function assignLeaveEmployees(
  leaveTypeId: string,
  payload: AssignLeavePayload,
) {
  return (
    await api.post<AssignmentResponse>(
      `/leave-types/${leaveTypeId}/assignments`,
      payload,
    )
  ).data;
}
export async function removeLeaveEmployees(
  leaveTypeId: string,
  payload: RemoveAssignmentPayload,
) {
  return (
    await api.delete<AssignmentResponse>(
      `/leave-types/${leaveTypeId}/assignments`,
      { data: payload },
    )
  ).data;
}

export async function getLeaveAssignments(leaveTypeId: string) {
  return (
    await api.get<{
      success: boolean;
      data: import("../types/leave-assignment.types").LeaveTypeAssignment[];
    }>(`/leave-types/${leaveTypeId}/assignments`)
  ).data;
}
