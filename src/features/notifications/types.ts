export type NotificationType = "LEAVE_REQUESTED" | "LEAVE_APPROVED" | "LEAVE_REJECTED" | "LEAVE_AUTO_REJECTED" | "LEAVE_CANCELLED" | "LEAVE_REMINDER" | "LEAVE_CREATED_BY_ADMIN";
export interface Notification { id: string; type: NotificationType; title: string; message: string; isRead: boolean; readAt: string | null; leaveRequestId: string | null; createdAt: string }
export interface NotificationsResponse { success: boolean; data: Notification[]; pagination: { page: number; limit: number; total: number } }
