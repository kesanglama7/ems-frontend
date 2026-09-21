export interface AssignmentLeaveType {
  id: string;
  name: string;
  isActive: boolean;
  audience: "ALL" | "SELECTED";
  eligibleGender: "MALE" | "FEMALE" | "OTHER" | null;
  allowHalfDay: boolean;
  hasLimitedBalance: boolean;
}
export interface LeaveAllocation {
  employeeId: string;
  days: number;
}
export interface AssignLeavePayload {
  assignments: LeaveAllocation[];
}
export interface RemoveAssignmentPayload {
  employeeIds: string[];
}
export interface AssignmentVariables {
  leaveTypeId: string;
  action: "assign" | "remove";
  employeeIds: string[];
  days?: number;
  assignments?: LeaveAllocation[];
}
export interface AssignmentResponse {
  success: boolean;
  message: string;
  data: {
    leaveTypeId: string;
    year?: number;
    assignments?: LeaveAllocation[];
    employeeIds?: string[];
    requestedCount: number;
    createdCount?: number;
    updatedCount?: number;
    removedCount?: number;
    notAssignedCount?: number;
  };
}

export interface AssignedEmployee {
  id: string;
  firstName: string;
  lastName: string;
  employeeCode: string;
}
export interface LeaveTypeAssignment {
  employeeId: string;
  leaveTypeId: string;
  assignedDays: number | string;
  employee: AssignedEmployee;
}
