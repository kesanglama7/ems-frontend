export type NotificationCategory = "LEAVE" | "REQUEST" | "DOCUMENT" | "ATTENDANCE" | "ANNOUNCEMENT";
export type NotificationEntityType = "LEAVE_REQUEST" | "EMPLOYEE_REQUEST" | "DOCUMENT" | "ATTENDANCE" | "LEAVE_BALANCE" | "ANNOUNCEMENT";
export interface Notification {
  id: string;
  type: string;
  category: NotificationCategory;
  entityType: NotificationEntityType;
  entityId: string;
  title: string;
  message: string;
  readAt: string | null;
  createdAt: string;
  expiresAt: string;
}
export interface NotificationFilters { category?: NotificationCategory; unread?: boolean }
export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  pagination: { hasMore: boolean; nextCursor: string | null };
}
