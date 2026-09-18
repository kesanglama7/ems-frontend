import type { UserRole } from "@/features/auth/types/auth.types";
import type { Notification, NotificationCategory } from "./types";
export const categoryLabels: Record<NotificationCategory, string> = { RESOURCE: "Resources", LEAVE: "Leave", REQUEST: "Requests", DOCUMENT: "Documents", ATTENDANCE: "Attendance", ANNOUNCEMENT: "Announcements" };
export function notificationHref(item: Pick<Notification, "entityType" | "entityId">, role: UserRole) {
  const root = role === "ADMIN" ? "/admin" : "/employee";
  switch (item.entityType) {
    case "RESOURCE_ASSIGNMENT": return `${root}/resources`;
    case "ANNOUNCEMENT": return role === "EMPLOYEE" ? `/employee/announcements/${encodeURIComponent(item.entityId)}` : "/admin/announcements";
    case "EMPLOYEE_REQUEST": return `${root}/requests`;
    case "DOCUMENT": return `${root}/documents`;
    case "ATTENDANCE": return `${root}/attendance`;
    case "LEAVE_BALANCE": return role === "ADMIN" ? "/admin/leaves/balance" : "/employee/leaves";
    case "LEAVE_REQUEST": return role === "ADMIN" ? "/admin/leaves/requests" : "/employee/leaves";
    default: return `${root}/notifications`;
  }
}
export function visibleNotifications(pages: { data: Notification[] }[] | undefined, now = Date.now()) {
  const seen = new Set<string>();
  return (pages ?? []).flatMap((page) => page.data).filter((item) => {
    if (seen.has(item.id) || Date.parse(item.expiresAt) <= now) return false;
    seen.add(item.id); return true;
  });
}
