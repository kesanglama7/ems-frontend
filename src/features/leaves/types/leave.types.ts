export type LeaveStatus = "PENDING" | "APPROVED" | "REJECTED" | "CANCELLED" | "AUTO_REJECTED";
export type LeaveDuration = "FULL_DAY" | "FIRST_HALF" | "SECOND_HALF";
export type LeaveSource = "EMPLOYEE" | "ADMIN";

export interface LeaveType { id: string; name: string; description: string | null; isActive: boolean; yearlyAllowance: number; hasLimitedBalance: boolean; allowHalfDay: boolean; isEmployeeRequestable: boolean; isPaid: boolean; isSystem: boolean; createdAt: string; updatedAt: string }
export interface LeaveTypeListResponse { success: boolean; data: LeaveType[] }
export interface LeaveTypeResponse { success: boolean; data: LeaveType }
export interface CreateLeaveTypePayload { name: string; description?: string; yearlyAllowance?: number; hasLimitedBalance?: boolean; allowHalfDay?: boolean; isEmployeeRequestable?: boolean; isPaid?: boolean }
export interface CreateLeaveTypeResponse { success: boolean; message: string; data: LeaveType }
export interface UpdateLeaveTypePayload extends Partial<CreateLeaveTypePayload> { isActive?: boolean }
export interface UpdateLeaveTypeResponse { success: boolean; message: string; data: LeaveType }
export interface DeleteLeaveTypeResponse { success: boolean; message: string; data: LeaveType }

export interface LeaveRequestLeaveType { id: string; name: string; description?: string | null; isPaid?: boolean }
export interface LeaveRequest { id: string; startDate: string; endDate: string; duration: LeaveDuration; requestedDays: number; reason: string | null; status: LeaveStatus; source: LeaveSource; reviewDeadlineAt: string | null; reviewedByUserId: string | null; reviewedAt: string | null; reviewNote: string | null; autoRejectedAt: string | null; leaveType: LeaveRequestLeaveType; createdAt: string; updatedAt: string }
export interface AdminLeaveRequestEmployee { id: string; employeeCode: string; firstName: string; lastName: string; jobTitle: string | null; department: { id: string; name: string } | null; user: { email: string; status: string } }
export interface AdminLeaveRequest extends LeaveRequest { employee: AdminLeaveRequestEmployee }
export interface LeaveRequestDetailEmployee extends AdminLeaveRequestEmployee { phone: string | null; dateOfJoining: string | null }
export interface LeaveRequestDetail extends LeaveRequest { employee: LeaveRequestDetailEmployee }
export interface LeaveRequestListResponse { success: boolean; data: LeaveRequest[] }
export interface AdminLeaveRequestListResponse { success: boolean; data: AdminLeaveRequest[] }
export interface LeaveRequestDetailResponse { success: boolean; data: LeaveRequestDetail }
export interface CreateLeaveRequestPayload { leaveTypeId: string; startDate: string; endDate: string; duration: LeaveDuration; reason?: string }
export interface CreateLeaveRequestResponse { success: boolean; message: string; data: LeaveRequest }
export interface CancelLeaveRequestResponse { success: boolean; message: string; data: LeaveRequest }
export interface ReviewLeavePayload { note?: string }
export interface ReviewLeaveResponse { success: boolean; message: string; data: LeaveRequest }
export interface LeavePreview { requestedDays: number; limited: boolean; reviewDeadlineAt: string; canRequest: boolean; currentBalance?: number; usedDays?: number; pendingDays?: number; remainingDays?: number; remainingAfterRequest?: number }
export interface LeavePreviewResponse { success: boolean; data: LeavePreview }
export interface LeaveBalance { leaveTypeId: string; name: string; year: number; limited: boolean; totalDays: number | null; usedDays: number | null; pendingDays: number | null; remainingDays: number | null }
export interface MyLeaveBalanceResponse { success: boolean; data: { year: number; balances: LeaveBalance[] } }
export interface AdminBalanceEmployee { id: string; employeeCode: string; firstName: string; lastName: string; department: { id: string; name: string } | null; balances: LeaveBalance[] }
export interface AdminBalancesResponse { success: boolean; data: { year: number; employees: AdminBalanceEmployee[] } }
export interface AdminLeaveSummaryResponse { success: boolean; data: { pendingRequests: number; approvedThisMonth: number; employeesOnLeaveToday: number; autoRejectedThisMonth: number } }
export interface AdminCreateLeavePayload extends CreateLeaveRequestPayload { employeeId: string; reason: string }
export interface InitializeBalancesResponse { success: boolean; message: string; data: { year: number; created: number } }
export interface AdjustBalancePayload { employeeId: string; leaveTypeId: string; year: number; adjustmentDays: number; reason: string }
export interface AdminLeaveQueryParams { employeeId?: string; departmentId?: string; status?: LeaveStatus; leaveTypeId?: string; from?: string; to?: string }
