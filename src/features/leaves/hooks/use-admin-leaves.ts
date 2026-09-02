import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  getAdminLeaves,
  getAdminLeaveDetail,
  approveLeave,
  rejectLeave,
} from "../api/admin-leaves.api";
import { leaveKeys } from "../constants/leave.constants";
import type { AdminLeaveQueryParams } from "../types/leave.types";

export function useAdminLeaves(params?: AdminLeaveQueryParams) {
  return useQuery({
    queryKey: leaveKeys.adminList(params ?? {}),
    queryFn: () => getAdminLeaves(params),
  });
}

export function useAdminLeaveDetail(leaveId: string) {
  return useQuery({
    queryKey: leaveKeys.adminDetail(leaveId),
    queryFn: () => getAdminLeaveDetail(leaveId),
    enabled: Boolean(leaveId),
  });
}

export function useApproveLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: approveLeave,
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: leaveKeys.admin(),
        }),
      ]);
      toast.success(data.message || "Leave request approved successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useRejectLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: rejectLeave,
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: leaveKeys.admin(),
        }),
      ]);
      toast.success(data.message || "Leave request rejected successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
