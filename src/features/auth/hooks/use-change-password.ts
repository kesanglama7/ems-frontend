"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { useAuthStore } from "@/stores/auth.store";

import { changePassword } from "../api/auth.api";
import { authKeys } from "../constants/auth.constants";

export function useChangePassword() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: changePassword,
    onSuccess: (response) => {
      clearAuth();
      queryClient.removeQueries({ queryKey: authKeys.all });
      toast.success(response.message ?? "Password changed successfully. Please sign in again.");
      router.replace("/login");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
