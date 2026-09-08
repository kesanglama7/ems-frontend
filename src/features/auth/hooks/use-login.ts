"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { getApiErrorMessage } from "@/lib/api-error";
import { useAuthStore } from "@/stores/auth.store";

import { login } from "../api/auth.api";
import { authKeys } from "../constants/auth.constants";

export function useLogin() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: login,
    onSuccess: (session) => {
      setSession(session);
      queryClient.setQueryData(authKeys.me(), session.user);
      toast.success("Signed in successfully.");
      router.replace(session.user.role === "ADMIN" ? "/admin" : "/employee");
    },
    onError: (error) => {
      toast.error(getApiErrorMessage(error));
    },
  });
}
