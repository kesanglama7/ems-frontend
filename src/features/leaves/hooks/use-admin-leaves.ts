import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  getAdminLeaves,
  getAdminLeaveDetail,
  approveLeave,
  rejectLeave,
  getAdminLeaveSummary, getAdminBalances, initializeBalances, createAdminLeave,
  adjustBalance, cancelAdminLeave,
} from "../api/admin-leaves.api";
import { leaveKeys } from "../constants/leave.constants";
import type { AdminLeaveQueryParams } from "../types/leave.types";

export function useAdminLeaves(params?: AdminLeaveQueryParams) {
  return useQuery({
    queryKey: leaveKeys.adminList(params ?? {}),
    queryFn: () => getAdminLeaves(params),
  });
}

export function useAdminLeaveSummary(year: number) { return useQuery({ queryKey: leaveKeys.adminSummary(year), queryFn: () => getAdminLeaveSummary(year) }); }
export function useAdminBalances(year: number) { return useQuery({ queryKey: leaveKeys.adminBalances(year), queryFn: () => getAdminBalances(year) }); }

function useAdminMutation<T>(mutationFn: (value: T) => Promise<unknown>, successMessage: string) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn, onSuccess: async () => { await queryClient.invalidateQueries({ queryKey: leaveKeys.admin() }); toast.success(successMessage); }, onError: (error) => toast.error(getApiErrorMessage(error)) });
}
export function useInitializeBalances() { return useAdminMutation(initializeBalances, "Yearly balances initialized."); }
export function useCreateAdminLeave() { return useAdminMutation(createAdminLeave, "Employee leave created and approved."); }
export function useAdjustBalance() { return useAdminMutation(adjustBalance, "Leave balance adjusted."); }
export function useCancelAdminLeave() { return useAdminMutation(cancelAdminLeave, "Approved leave cancelled and balance restored."); }

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
