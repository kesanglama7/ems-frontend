"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuthStore } from "@/stores/auth.store";

export interface Result<T> {
  success: boolean;
  data: T;
  message?: string;
}
export type Gender = "MALE" | "FEMALE" | "OTHER";
export interface Holiday {
  id: string;
  name: string;
  date: string;
  description: string | null;
  isOfficeClosed: boolean;
}
export interface Resource {
  id: string;
  name: string;
  description: string | null;
  totalQuantity: number;
  availableQuantity: number;
  isActive: boolean;
}
export interface Assignment {
  id: string;
  resourceId: string;
  employeeId: string;
  resource: Resource;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
  };
  quantity: number;
  assetTag: string | null;
  note: string | null;
  assignedAt: string;
  returnRequestedAt: string | null;
  returnRequestNote: string | null;
  returnedAt: string | null;
}
export interface ManagedCategory {
  id: string;
  name: string;
  description: string | null;
  isActive: boolean;
  legacyCategory: string | null;
}
export interface Birthday {
  employeeId: string;
  name: string;
  profileImageUrl: string | null;
  birthday: string;
  month: number;
  day: number;
  daysUntil: number;
  isToday: boolean;
}
export interface Greeting {
  showPopup: boolean;
  isBirthdayToday?: boolean;
  officeName?: string;
  message?: string;
  profileImageUrl?: string | null;
  celebrationKey?: string;
  confetti?: boolean;
}
export interface Attachment {
  id: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  url: string;
  expiresIn: number;
}
export interface LeaveAssignment {
  employeeId: string;
  leaveTypeId: string;
  assignedDays: number | string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    employeeCode: string;
  };
}

export function useOfficeQuery<T>(group: string, path: string, enabled = true) {
  const id = useAuthStore((s) => s.user?.id);
  return useQuery({
    queryKey: [group, id, path],
    queryFn: async ({ signal }) =>
      (await api.get<Result<T>>(path, { signal })).data,
    enabled: Boolean(id) && enabled,
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}
export const useHolidays = (year?: number) =>
  useOfficeQuery<Holiday[]>(
    "office-holidays",
    `/office-holidays${year ? `?year=${year}` : ""}`,
  );
export const useResources = (enabled = true) =>
  useOfficeQuery<Resource[]>("resources", "/resources", enabled);
export const useAssignments = () =>
  useOfficeQuery<Assignment[]>("resources", "/resources/assignments");
export const useRequestCategories = (enabled = true) =>
  useOfficeQuery<ManagedCategory[]>(
    "request-categories",
    "/request-categories",
    enabled,
  );
export function useOfficeMutation<T>(
  fn: (payload: T) => Promise<unknown>,
  message: string,
  groups: string[],
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: fn,
    onSuccess: async () => {
      toast.success(message);
      await Promise.all(
        groups.map((group) => qc.invalidateQueries({ queryKey: [group] })),
      );
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
export function formatOfficeDate(value: string) {
  const date = new Date(`${value.slice(0, 10)}T12:00:00`);
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
}
export function localDateInput(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}
