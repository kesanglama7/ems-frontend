"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";

import { uploadMyProfileImage } from "../api/employee-profile.api";
import { employeeKeys } from "../constants/employee.constants";

export function useUploadMyProfileImage() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadMyProfileImage,

    onSuccess: async (response) => {
      await queryClient.invalidateQueries({
        queryKey: employeeKeys.me(),
      });

      toast.success(
        response.message ??
          "Profile image uploaded successfully.",
      );
    },

    onError: (error) => {
      toast.error(
        getApiErrorMessage(error),
      );
    },
  });
}
