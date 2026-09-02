"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  checkIn as checkInApi,
  checkOut as checkOutApi,
  createAdminAttendance as createAdminAttendanceApi,
  getAdminAttendance as getAdminAttendanceApi,
  getAdminAttendanceDetails as getAdminAttendanceDetailsApi,
  getEmployeeAttendanceHistory as getEmployeeAttendanceHistoryApi,
  getMyAttendanceHistory as getMyAttendanceHistoryApi,
  getTodayAttendance as getTodayAttendanceApi,
  updateAdminAttendance as updateAdminAttendanceApi,
} from "../api/attendance.api";
import type {
  AdminAttendanceQueryParams,
  AdminCreateAttendancePayload,
  AdminUpdateAttendancePayload,
  CheckInPayload,
  CheckOutPayload,
  MyAttendanceQueryParams,
} from "../types/attendance.types";
import { attendanceKeys } from "../constants/attendance.constants";

// ─── Employee Hooks ─────────────────────────────────────────────────────────

export function useTodayAttendance() {
  return useQuery({
    queryKey: attendanceKeys.today(),
    queryFn: getTodayAttendanceApi,
  });
}

export function useCheckIn() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: CheckInPayload) => checkInApi(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.today() });
      toast.success(data.message || "Checked in successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useCheckOut() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload?: CheckOutPayload) => checkOutApi(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.today() });
      toast.success(data.message || "Checked out successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useMyAttendanceHistory(params?: MyAttendanceQueryParams) {
  return useQuery({
    queryKey: [...attendanceKeys.me(), params],
    queryFn: () => getMyAttendanceHistoryApi(params),
  });
}

// ─── Admin Hooks ────────────────────────────────────────────────────────────

export function useAdminAttendance(params?: AdminAttendanceQueryParams) {
  return useQuery({
    queryKey: [...attendanceKeys.admin(), params],
    queryFn: () => getAdminAttendanceApi(params),
  });
}

export function useAdminAttendanceDetail(attendanceId: string) {
  return useQuery({
    queryKey: [...attendanceKeys.admin(), "detail", attendanceId],
    queryFn: () => getAdminAttendanceDetailsApi(attendanceId),
    enabled: Boolean(attendanceId),
  });
}

export function useEmployeeAttendanceHistory(
  employeeId: string,
  params?: MyAttendanceQueryParams,
) {
  return useQuery({
    queryKey: [...attendanceKeys.adminEmployee(employeeId), params],
    queryFn: () => getEmployeeAttendanceHistoryApi(employeeId, params),
    enabled: Boolean(employeeId),
  });
}

export function useCreateAdminAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AdminCreateAttendancePayload) =>
      createAdminAttendanceApi(payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.admin() });
      toast.success(data.message || "Attendance created successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateAdminAttendance() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      attendanceId,
      payload,
    }: {
      attendanceId: string;
      payload: AdminUpdateAttendancePayload;
    }) => updateAdminAttendanceApi(attendanceId, payload),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: attendanceKeys.admin() });
      toast.success(data.message || "Attendance corrected successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
