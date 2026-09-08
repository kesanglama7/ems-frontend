"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/stores/auth.store";

import { getMe } from "../api/auth.api";
import { authKeys } from "../constants/auth.constants";

export function useMe() {
  const accessToken = useAuthStore((state) => state.accessToken);
  const refreshToken = useAuthStore((state) => state.refreshToken);
  const setUser = useAuthStore((state) => state.setUser);
  const clearAuth = useAuthStore((state) => state.clearAuth);
  const hasHydrated = useAuthStore((state) => state.hasHydrated);
  const hasSession = Boolean(accessToken || refreshToken);

  const query = useQuery({
    queryKey: authKeys.me(),
    queryFn: getMe,
    enabled: hasHydrated && hasSession,
    retry: false,
  });

  useEffect(() => {
    if (query.data) setUser(query.data);
  }, [query.data, setUser]);

  useEffect(() => {
    if (query.isError) clearAuth();
  }, [query.isError, clearAuth]);

  return {
    ...query,
    isLoading: !hasHydrated || query.isLoading,
  };
}
