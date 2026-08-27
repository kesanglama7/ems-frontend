"use client";

import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuthStore } from "@/stores/auth.store";

import { getMe } from "../api/auth.api";
import { authKeys } from "../constants/auth.constants";

export function useMe() {
  const setUser = useAuthStore(
    (state) => state.setUser,
  );

  const clearUser = useAuthStore(
    (state) => state.clearUser,
  );

  const query = useQuery({
    queryKey: authKeys.me(),
    queryFn: getMe,
    retry: false,
  });

  useEffect(() => {
    if (query.data) {
      setUser(query.data);
    }
  }, [query.data, setUser]);

  useEffect(() => {
    if (query.isError) {
      clearUser();
    }
  }, [query.isError, clearUser]);

  return query;
}