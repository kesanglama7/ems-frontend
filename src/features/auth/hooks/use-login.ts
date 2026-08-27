"use client";

import { useRouter } from "next/navigation";
import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { useAuthStore } from "@/stores/auth.store";

import { login } from "../api/auth.api";
import { authKeys } from "../constants/auth.constants";

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const setUser = useAuthStore(
    (state) => state.setUser,
  );

  return useMutation({
    mutationFn: login,

    onSuccess: (user) => {
      setUser(user);

      queryClient.setQueryData(
        authKeys.me(),
        user,
      );

      toast.success("Signed in successfully.");

      if (user.role === "ADMIN") {
        router.replace("/admin");
        return;
      }

      router.replace("/employee");
    },

    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}