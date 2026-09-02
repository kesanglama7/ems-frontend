import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  createLeaveRequest,
  getMyLeaves,
  getMyLeaveDetail,
  cancelLeave,
} from "../api/leaves.api";
import { leaveKeys } from "../constants/leave.constants";

export function useMyLeaves() {
  return useQuery({
    queryKey: leaveKeys.my(),
    queryFn: getMyLeaves,
  });
}

export function useMyLeaveDetail(leaveId: string) {
  return useQuery({
    queryKey: leaveKeys.myDetail(leaveId),
    queryFn: () => getMyLeaveDetail(leaveId),
    enabled: Boolean(leaveId),
  });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLeaveRequest,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: leaveKeys.my(),
      });
      toast.success(data.message || "Leave request submitted successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useCancelLeave() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: cancelLeave,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: leaveKeys.my(),
      });
      toast.success(data.message || "Leave request cancelled successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
