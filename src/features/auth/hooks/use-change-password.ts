"use client";

import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";

import { changePassword } from "../api/auth.api";

export function useChangePassword() {
  return useMutation({
    mutationFn: changePassword,

    onSuccess: (response) => {
      toast.success(
        response.message ??
          "Password changed successfully.",
      );
    },

    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
