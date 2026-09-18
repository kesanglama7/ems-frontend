export interface AssignmentLeaveType {
  id: string;
  name: string;
  isActive: boolean;
  audience: "ALL" | "SELECTED";
  eligibleGender: "MALE" | "FEMALE" | "OTHER" | null;
}
export interface AssignmentPayload {
  employeeIds: string[];
}
export interface AssignmentVariables extends AssignmentPayload {
  leaveTypeId: string;
  action: "assign" | "remove";
}
export interface AssignmentResponse {
  success: boolean;
  message: string;
  data: {
    leaveTypeId: string;
    employeeIds: string[];
    requestedCount: number;
    assignedCount?: number;
    alreadyAssignedCount?: number;
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
  employee: AssignedEmployee;
}
