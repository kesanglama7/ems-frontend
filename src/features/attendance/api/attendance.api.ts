import { api } from "@/lib/api";
import type {
  AdminAttendanceDetailResponse,
  AdminAttendanceListResponse,
  AdminCreateAttendancePayload,
  AdminUpdateAttendancePayload,
  AttendanceActionResponse,
  AttendanceListResponse,
  AttendanceResponse,
  CheckInPayload,
  CheckOutPayload,
  EmployeeAttendanceHistoryResponse,
  MyAttendanceQueryParams,
  AdminAttendanceQueryParams,
} from "../types/attendance.types";

export async function checkIn(
  payload?: CheckInPayload,
): Promise<AttendanceActionResponse> {
  const response = await api.post<AttendanceActionResponse>(
    "/attendance/check-in",
    payload,
  );
  return response.data;
}

export async function checkOut(
  payload?: CheckOutPayload,
): Promise<AttendanceActionResponse> {
  const response = await api.post<AttendanceActionResponse>(
    "/attendance/check-out",
    payload,
  );
  return response.data;
}

export async function getTodayAttendance(): Promise<AttendanceResponse> {
  const response = await api.get<AttendanceResponse>("/attendance/me/today");
  return response.data;
}

export async function getMyAttendanceHistory(
  params?: MyAttendanceQueryParams,
): Promise<AttendanceListResponse> {
  const response = await api.get<AttendanceListResponse>("/attendance/me", { params });
  return response.data;
}

export async function getAdminAttendance(
  params?: AdminAttendanceQueryParams,
): Promise<AdminAttendanceListResponse> {
  const response = await api.get<AdminAttendanceListResponse>("/admin/attendance", {
    params,
  });
  return response.data;
}

export async function getAdminAttendanceDetails(
  attendanceId: string,
): Promise<AdminAttendanceDetailResponse> {
  const response = await api.get<AdminAttendanceDetailResponse>(
    `/admin/attendance/${attendanceId}`,
  );
  return response.data;
}

export async function createAdminAttendance(
  payload: AdminCreateAttendancePayload,
): Promise<AttendanceActionResponse> {
  const response = await api.post<AttendanceActionResponse>(
    "/admin/attendance",
    payload,
  );
  return response.data;
}

export async function updateAdminAttendance(
  attendanceId: string,
  payload: AdminUpdateAttendancePayload,
): Promise<AttendanceActionResponse> {
  const response = await api.patch<AttendanceActionResponse>(
    `/admin/attendance/${attendanceId}`,
    payload,
  );
  return response.data;
}

export async function getEmployeeAttendanceHistory(
  employeeId: string,
  params?: MyAttendanceQueryParams,
): Promise<EmployeeAttendanceHistoryResponse> {
  const response = await api.get<EmployeeAttendanceHistoryResponse>(
    `/admin/employees/${employeeId}/attendance`,
    { params },
  );
  return response.data;
}
