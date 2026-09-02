import type { AttendanceStatus } from "../types/attendance.types";

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  OPEN: "Open",
  COMPLETED: "Completed",
  MISSING_CHECKOUT: "Missing Checkout",
};

export const ATTENDANCE_STATUS_COLORS: Record<
  AttendanceStatus,
  "default" | "secondary" | "destructive" | "outline"
> = {
  OPEN: "secondary",
  COMPLETED: "default",
  MISSING_CHECKOUT: "destructive",
};

export const attendanceKeys = {
  all: ["attendance"] as const,
  today: () => [...attendanceKeys.all, "today"] as const,
  me: () => [...attendanceKeys.all, "me"] as const,
  admin: () => [...attendanceKeys.all, "admin"] as const,
  adminEmployee: (employeeId: string) =>
    [...attendanceKeys.admin(), employeeId] as const,
};
