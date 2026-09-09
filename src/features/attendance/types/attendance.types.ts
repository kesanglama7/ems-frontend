export type AttendanceStatus = "OPEN" | "COMPLETED" | "MISSING_CHECKOUT";

export type AttendanceSource = "EMPLOYEE" | "ADMIN";

export type AttendanceAuditAction = "ADMIN_CREATE" | "ADMIN_UPDATE";

export interface AttendanceRecord {
  id: string;
  workDate: string;
  status: AttendanceStatus;
  source: AttendanceSource;
  checkInAt: string | null;
  checkOutAt: string | null;
  isLate: boolean;
  lateMinutes: number;
  earlyMinutes: number;
  afterHoursMinutes: number;
  totalMinutes: number | null;
  overtimeMinutes: number | null;
  scheduledMinutes: number;
  workModeSnapshot: "ON_FIELD" | "REMOTE" | null;
  checkInLatitude: number | null;
  checkInLongitude: number | null;
  checkInAccuracyMeters: number | null;
  checkInDistanceMeters: number | null;
  checkOutLatitude: number | null;
  checkOutLongitude: number | null;
  checkOutAccuracyMeters: number | null;
  checkOutDistanceMeters: number | null;
}

// --- Admin record (includes employee info) ---

export interface AdminAttendanceEmployeeSummary {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  workMode: "ON_FIELD" | "REMOTE";
  department: {
    id: string;
    name: string;
  } | null;
  user: {
    email: string;
    status: string;
  };
}

export interface AdminAttendanceEmployeeDetail extends AdminAttendanceEmployeeSummary {
  phone: string;
  jobTitle: string;
}

export interface AdminAttendanceRecord extends AttendanceRecord {
  employee: AdminAttendanceEmployeeSummary;
}

export interface AdminAttendanceDetailRecord extends AttendanceRecord {
  employee: AdminAttendanceEmployeeDetail;
  audits: AttendanceAudit[];
}

// --- Audit ---

export interface AttendanceAudit {
  id: string;
  action: AttendanceAuditAction;
  reason: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  adminUserId: string;
  createdAt: string;
}

// --- Employee history ---

export interface EmployeeAttendanceHistoryEmployee {
  id: string;
  employeeCode: string;
  firstName: string;
  lastName: string;
  jobTitle: string;
  workMode: "ON_FIELD" | "REMOTE";
  department: {
    id: string;
    name: string;
  } | null;
}

export interface EmployeeAttendanceHistoryData {
  employee: EmployeeAttendanceHistoryEmployee;
  attendance: AttendanceRecord[];
}

// --- DTOs / Payloads ---

export interface CheckInPayload {
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
}

export interface CheckOutPayload {
  latitude?: number;
  longitude?: number;
  accuracyMeters?: number;
}

export interface AdminCreateAttendancePayload {
  employeeId: string;
  checkInAt: string;
  checkOutAt?: string;
  reason: string;
}

export interface AdminUpdateAttendancePayload {
  checkInAt?: string;
  checkOutAt?: string;
  reason: string;
}

export interface MyAttendanceQueryParams {
  from?: string;
  to?: string;
}

export interface AdminAttendanceQueryParams {
  employeeId?: string;
  departmentId?: string;
  from?: string;
  to?: string;
  isLate?: boolean;
  status?: AttendanceStatus;
  workMode?: "ON_FIELD" | "REMOTE";
}

// --- Response wrappers ---

export interface AttendanceResponse {
  success: boolean;
  data: { attendance: AttendanceRecord | null; leave: { isOnLeave: boolean; duration?: "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF"; leaveType?: { id: string; name: string } }; canCheckIn: boolean };
}

export interface AttendanceListResponse {
  success: boolean;
  data: AttendanceRecord[];
}

export interface AdminAttendanceListResponse {
  success: boolean;
  data: AdminAttendanceRecord[];
}

export interface AdminAttendanceDetailResponse {
  success: boolean;
  data: AdminAttendanceDetailRecord;
}

export interface EmployeeAttendanceHistoryResponse {
  success: boolean;
  data: EmployeeAttendanceHistoryData;
}

export interface AttendanceActionResponse {
  success: boolean;
  message: string;
  data: AttendanceRecord;
}
