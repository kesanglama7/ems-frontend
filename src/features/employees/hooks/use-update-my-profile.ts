"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";

import { updateMyEmployeeProfile } from "../api/employee-profile.api";
import { employeeKeys } from "../constants/employee.constants";

export function useUpdateMyProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateMyEmployeeProfile,

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: employeeKeys.me(),
      });

      toast.success(
        response.message ??
          "Profile updated successfully.",
      );
    },

    onError: (error) => {
      toast.error(
        getApiErrorMessage(error),
      );
    },
  });
}
