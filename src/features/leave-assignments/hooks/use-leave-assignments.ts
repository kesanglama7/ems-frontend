"use client";
import {
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { getEmployees } from "@/features/employees/api/employee.api";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  assignLeaveEmployees,
  removeLeaveEmployees,
  getAssignmentLeaveTypes,
  getLeaveAssignments,
} from "../api/leave-assignments.api";
import type { AssignmentVariables } from "../types/leave-assignment.types";
export function useAssignmentLeaveTypes() {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: ["leaves", "assignment-types", userId],
    queryFn: getAssignmentLeaveTypes,
    enabled: Boolean(userId),
  });
}
export function useManageLeaveAssignments() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ leaveTypeId, employeeIds, action }: AssignmentVariables) =>
      action === "assign"
        ? assignLeaveEmployees(leaveTypeId, { employeeIds })
        : removeLeaveEmployees(leaveTypeId, { employeeIds }),
    onSuccess: (response) => {
      toast.success(response.message);
      void client.invalidateQueries({ queryKey: ["leaves"] });
      void client.invalidateQueries({ queryKey: ["leave-assignments"] });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useLeaveAssignments(leaveTypeId: string) {
  const userId = useAuthStore((state) => state.user?.id);
  return useQuery({
    queryKey: ["leave-assignments", userId, leaveTypeId],
    queryFn: () => getLeaveAssignments(leaveTypeId),
    enabled: Boolean(userId && leaveTypeId),
  });
}
export function useAssignmentEmployees(search: string, enabled: boolean) {
  const userId = useAuthStore((state) => state.user?.id);
  return useInfiniteQuery({
    queryKey: ["leave-assignment-employees", userId, search],
    initialPageParam: 1,
    queryFn: ({ pageParam }) =>
      getEmployees({ page: pageParam, limit: 20, search: search || undefined }),
    getNextPageParam: (last) =>
      last.meta.page < last.meta.totalPages ? last.meta.page + 1 : undefined,
    enabled: Boolean(userId) && enabled,
  });
}
