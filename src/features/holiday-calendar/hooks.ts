"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuthStore } from "@/stores/auth.store";
import type { HolidayFormValues } from "./schema";
import { deleteHoliday, getHolidays, saveHoliday } from "./holiday-calendar.api";

export function useHolidays(year: number) {
  const userId = useAuthStore((state) => state.user?.id);

  return useQuery({
    queryKey: ["office-holidays", userId, year],
    queryFn: ({ signal }) => getHolidays(year, signal),
    enabled: Boolean(userId),
    staleTime: 30_000,
    refetchInterval: 60_000,
  });
}

function useInvalidateOfficeCalendar() {
  const queryClient = useQueryClient();
  return async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["office-holidays"] }),
      queryClient.invalidateQueries({ queryKey: ["leaves"] }),
    ]);
  };
}

export function useSaveHoliday() {
  const invalidate = useInvalidateOfficeCalendar();

  return useMutation({
    mutationFn: ({
      values,
      id,
    }: {
      values: HolidayFormValues;
      id?: string;
    }) => saveHoliday(values, id),
    onSuccess: async () => {
      await invalidate();
      toast.success("Calendar saved.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}

export function useDeleteHoliday() {
  const invalidate = useInvalidateOfficeCalendar();

  return useMutation({
    mutationFn: deleteHoliday,
    onSuccess: async () => {
      await invalidate();
      toast.success("Calendar entry removed.");
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
