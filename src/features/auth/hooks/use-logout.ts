"use client";

import { useRouter } from "next/navigation";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { useAuthStore } from "@/stores/auth.store";

import { logout } from "../api/auth.api";
import { authKeys } from "../constants/auth.constants";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const clearUser = useAuthStore(
    (state) => state.clearUser,
  );

  return useMutation({
    mutationFn: logout,

    onSuccess: () => {
      clearUser();

      queryClient.removeQueries({
        queryKey: authKeys.all,
      });

      toast.success("Signed out successfully.");

      router.replace("/login");
    },

    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}