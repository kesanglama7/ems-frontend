export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED";

// --- Leave Type ---

export interface LeaveType {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveTypeListResponse {
  success: boolean;
  data: LeaveType[];
}

export interface LeaveTypeResponse {
  success: boolean;
  data: LeaveType;
}

export interface CreateLeaveTypePayload {
  name: string;
  description?: string;
}

export interface CreateLeaveTypeResponse {
  success: boolean;
  message: string;
  data: LeaveType;
}

export interface UpdateLeaveTypePayload {
  name?: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateLeaveTypeResponse {
  success: boolean;
  message: string;
  data: LeaveType;
}

export interface DeleteLeaveTypeResponse {
  success: boolean;
  message: string;
  data: LeaveType;
}

// --- Leave Request ---

export interface LeaveRequestLeaveType {
  id: string;
  name: string;
}

export interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  reason: string | null;
  status: LeaveStatus;
  reviewedByUserId: string | null;
  reviewedAt: string | null;
  reviewNote: string | null;
  leaveType: LeaveRequestLeaveType;
  createdAt: string;
  updatedAt: string;
}

export interface AdminLeaveRequestEmployee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  jobTitle: string | null;
  department: { id: string; name: string };
  user: { email: string; status: string };
}

export interface AdminLeaveRequest extends LeaveRequest {
  employee: AdminLeaveRequestEmployee;
}

export interface LeaveRequestDetailLeaveType extends LeaveRequestLeaveType {
  description: string | null;
  isActive: boolean;
}

export interface LeaveRequestDetailEmployee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  jobTitle: string | null;
  dateOfJoining: string | null;
  department: { id: string; name: string };
  user: { email: string; status: string };
}

export interface LeaveRequestDetail extends LeaveRequest {
  leaveType: LeaveRequestDetailLeaveType;
  employee: LeaveRequestDetailEmployee;
}

export interface LeaveRequestListResponse {
  success: boolean;
  data: LeaveRequest[];
}

export interface AdminLeaveRequestListResponse {
  success: boolean;
  data: AdminLeaveRequest[];
}

export interface LeaveRequestDetailResponse {
  success: boolean;
  data: LeaveRequestDetail;
}

export interface CreateLeaveRequestPayload {
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  reason?: string;
}

export interface CreateLeaveRequestResponse {
  success: boolean;
  message: string;
  data: LeaveRequest;
}

export interface CancelLeaveRequestResponse {
  success: boolean;
  message: string;
  data: LeaveRequest;
}

export interface ReviewLeavePayload {
  note?: string;
}

export interface ReviewLeaveResponse {
  success: boolean;
  message: string;
  data: AdminLeaveRequest;
}

// --- Query Params ---

export interface AdminLeaveQueryParams {
  employeeId?: string;
  departmentId?: string;
  status?: LeaveStatus;
  leaveTypeId?: string;
  from?: string;
  to?: string;
}
