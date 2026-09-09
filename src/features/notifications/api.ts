import { api } from "@/lib/api";
import type { NotificationsResponse } from "./types";
export async function getNotifications() { return (await api.get<NotificationsResponse>("/notifications", { params: { page: 1, limit: 20 } })).data; }
export async function getUnreadCount() { return (await api.get<{success:boolean;data:{unreadCount:number}}>("/notifications/unread-count")).data; }
export async function markNotificationRead(id: string) { return (await api.patch(`/notifications/${id}/read`)).data; }
export async function markAllNotificationsRead() { return (await api.patch("/notifications/read-all")).data; }
