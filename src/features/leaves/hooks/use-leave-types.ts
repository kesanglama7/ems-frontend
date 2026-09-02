import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  getLeaveTypes,
  createLeaveType,
  updateLeaveType,
  deleteLeaveType,
} from "../api/leave-types.api";
import { leaveKeys } from "../constants/leave.constants";

export function useLeaveTypes() {
  return useQuery({
    queryKey: leaveKeys.types(),
    queryFn: getLeaveTypes,
  });
}

export function useCreateLeaveType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createLeaveType,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: leaveKeys.types(),
      });
      toast.success(data.message || "Leave type created successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useUpdateLeaveType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateLeaveType,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: leaveKeys.types(),
      });
      toast.success(data.message || "Leave type updated successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useDeactivateLeaveType() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteLeaveType,
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: leaveKeys.types(),
      });
      toast.success(data.message || "Leave type deactivated successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}

export function useToggleLeaveTypeActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      leaveTypeId,
      isActive,
    }: {
      leaveTypeId: string;
      isActive: boolean;
    }) => {
      const response = await updateLeaveType({
        leaveTypeId,
        payload: { isActive },
      });
      return response;
    },
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: leaveKeys.types(),
      });
      toast.success(data.message || "Leave type updated successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
