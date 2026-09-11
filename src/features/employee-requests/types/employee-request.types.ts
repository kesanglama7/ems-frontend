export type RequestCategory =
  | "ATTENDANCE_CORRECTION"
  | "PROFILE_UPDATE"
  | "DOCUMENT"
  | "LEAVE"
  | "PAYROLL"
  | "TECHNICAL_SUPPORT"
  | "WORKPLACE_CONCERN"
  | "GENERAL_QUESTION"
  | "OTHER";

export type RequestStatus =
  | "OPEN"
  | "IN_PROGRESS"
  | "RESOLVED"
  | "REJECTED"
  | "DISMISSED"
  | "CANCELLED";

export type RequestPriority = "LOW" | "NORMAL" | "HIGH" | "URGENT";
export type RequestActivityAction =
  | "CREATED"
  | "STATUS_CHANGED"
  | "ASSIGNED"
  | "ADMIN_NOTE_UPDATED"
  | "DISMISSED"
  | "CANCELLED";
export type RequestDismissalReason =
  | "SPAM_OR_INAPPROPRIATE"
  | "DUPLICATE"
  | "INVALID_REQUEST"
  | "INSUFFICIENT_INFORMATION"
  | "OTHER";
export type RequestSortBy = "createdAt" | "updatedAt" | "priority" | "resolvedAt";
export type SortOrder = "asc" | "desc";

export interface RequestActivity {
  id: string;
  action: RequestActivityAction;
  fromStatus: RequestStatus | null;
  toStatus: RequestStatus | null;
  performedByUserId: string | null;
  createdAt: string;
}

export interface RequestEmployee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  profileImageUrl: string | null;
  department: { id: string; name: string } | null;
}

export interface EmployeeRequest {
  id: string;
  requestNumber: number;
  category: RequestCategory;
  subject: string;
  description: string;
  status: RequestStatus;
  priority: RequestPriority;
  attendanceId: string | null;
  assignedAdminId?: string | null;
  resolvedByAdminId?: string | null;
  adminNote?: string | null;
  resolutionNote: string | null;
  dismissalReason: RequestDismissalReason | null;
  dismissalNote: string | null;
  dismissedAt: string | null;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
  employee: RequestEmployee;
  attendance: {
    id: string;
    workDate: string;
    status: string;
    checkInAt: string | null;
    checkOutAt: string | null;
  } | null;
  activities?: RequestActivity[];
}

export interface RequestQuery {
  search?: string;
  category?: RequestCategory;
  status?: RequestStatus;
  priority?: RequestPriority;
  employeeId?: string;
  departmentId?: string;
  assignedAdminId?: string;
  createdFrom?: string;
  createdTo?: string;
  sortBy?: RequestSortBy;
  sortOrder?: SortOrder;
  page?: number;
  limit?: number;
}

export interface RequestListResponse {
  success: boolean;
  data: EmployeeRequest[];
  pagination: { page: number; limit: number; total: number; totalPages: number };
}

export interface RequestResponse {
  success: boolean;
  message?: string;
  data: EmployeeRequest;
}

export interface RequestSummaryResponse {
  success: boolean;
  data: { counts: Record<RequestStatus, number> };
}

export interface CreateRequestPayload {
  category: RequestCategory;
  subject: string;
  description: string;
  priority?: RequestPriority;
  attendanceId?: string;
}

export interface DismissRequestPayload {
  reason: RequestDismissalReason;
  note?: string;
}
