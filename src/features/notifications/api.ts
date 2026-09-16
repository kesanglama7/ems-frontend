import { api } from "@/lib/api";
import type { Notification, NotificationFilters, NotificationsResponse } from "./types";
export async function getNotifications(filters: NotificationFilters = {}, cursor?: string, signal?: AbortSignal) {
  return (await api.get<NotificationsResponse>("/notifications", { params: { ...filters, cursor, limit: 20 }, signal })).data;
}
export async function getUnreadCount(signal?: AbortSignal) {
  return (await api.get<{ success: boolean; data: { unreadCount: number } }>("/notifications/unread-count", { signal })).data;
}
export async function markNotificationRead(id: string) {
  return (await api.patch<{ success: boolean; data: Notification }>(`/notifications/${encodeURIComponent(id)}/read`)).data;
}
export async function markAllNotificationsRead() { return (await api.patch("/notifications/read-all")).data; }
export async function deleteNotification(id: string) { return (await api.delete(`/notifications/${encodeURIComponent(id)}`)).data; }
export async function clearNotifications() { return (await api.delete("/notifications")).data; }
