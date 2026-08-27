"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";

import { deleteMyProfileImage } from "../api/employee-profile.api";
import { employeeKeys } from "../constants/employee.constants";

export function useDeleteMyProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteMyProfileImage,

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: employeeKeys.me(),
      });

      toast.success(
        response.message ??
          "Profile image deleted successfully.",
      );
    },

    onError: (error) => {
      toast.error(
        getApiErrorMessage(error),
      );
    },
  });
}
