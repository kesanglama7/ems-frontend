"use client";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/auth.store";
import { getApiErrorMessage } from "@/lib/api-error";
import * as api from "./api";
import type { NotificationFilters } from "./types";
export const notificationKeys = { all: ["notifications"] as const };
function useIdentity() {
  const id = useAuthStore((s) => s.user?.id);
  const authenticated = useAuthStore((s) => s.isAuthenticated && s.hasHydrated);
  return { id, enabled: Boolean(id && authenticated) };
}
export function useNotifications(filters: NotificationFilters = {}, active = true) {
  const { id, enabled } = useIdentity();
  return useInfiniteQuery({
    queryKey: [...notificationKeys.all, id, "list", filters],
    queryFn: ({ pageParam, signal }) => api.getNotifications(filters, pageParam, signal),
    initialPageParam: undefined as string | undefined,
    getNextPageParam: (last) => last.pagination.hasMore ? last.pagination.nextCursor ?? undefined : undefined,
    enabled: enabled && active,
    refetchInterval: 30_000,
    staleTime: 15_000,
  });
}
export function useUnreadCount() {
  const { id, enabled } = useIdentity();
  return useQuery({ queryKey: [...notificationKeys.all, id, "count"], queryFn: ({ signal }) => api.getUnreadCount(signal), enabled, refetchInterval: 30_000, staleTime: 10_000 });
}
function useActions<T>(mutationFn: (variables: T) => Promise<unknown>, message?: string) {
  const qc = useQueryClient();
  const { id } = useIdentity();
  return useMutation({ mutationFn,
    onSuccess: () => { if (message && useAuthStore.getState().user?.id === id) toast.success(message); },
    onError: (error) => { if (useAuthStore.getState().user?.id === id) toast.error(getApiErrorMessage(error)); },
    onSettled: () => qc.invalidateQueries({ queryKey: [...notificationKeys.all, id] }),
  });
}
export function useMarkNotificationRead() { return useActions(api.markNotificationRead); }
export function useMarkAllNotificationsRead() { return useActions(api.markAllNotificationsRead, "All notifications marked as read."); }
export function useDeleteNotification() { return useActions(api.deleteNotification, "Notification deleted."); }
export function useClearNotifications() { return useActions(api.clearNotifications, "Notifications cleared."); }
