"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { useAuthStore } from "@/stores/auth.store";

import { logout } from "../api/auth.api";
import { authKeys } from "../constants/auth.constants";
import { unregisterCurrentPushDevice } from "@/features/push-notifications/push-notifications";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const clearAuth = useAuthStore((state) => state.clearAuth);

  return useMutation({
    mutationFn: async () => {
      await unregisterCurrentPushDevice().catch(() => undefined);
      return logout();
    },
    onSuccess: () => {
      toast.success("Signed out successfully.");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
    onSettled: () => {
      clearAuth();
      queryClient.removeQueries({ queryKey: authKeys.all });
      router.replace("/login");
    },
  });
}
