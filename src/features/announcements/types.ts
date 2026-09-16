export type AnnouncementStatus = "DRAFT" | "SCHEDULED" | "PUBLISHED" | "ARCHIVED";
export type AnnouncementAudience = "ALL_EMPLOYEES" | "DEPARTMENT";
export type AnnouncementPriority = "NORMAL" | "IMPORTANT" | "URGENT";

export interface Announcement {
  id: string;
  title: string;
  body: string;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  departmentId: string | null;
  status: AnnouncementStatus;
  showOnLogin: boolean;
  acknowledgmentRequired: boolean;
  publishAt: string | null;
  publishedAt: string | null;
  expiresAt: string | null;
  archivedAt: string | null;
  authorId: string;
  createdAt: string;
  updatedAt: string;
  readAt?: string | null;
  acknowledgedAt?: string | null;
  _count?: { receipts: number };
  readCount?: number;
  acknowledgedCount?: number;
  recipientCount?: number;
}
export interface AnnouncementPayload {
  title: string;
  body: string;
  priority: AnnouncementPriority;
  audience: AnnouncementAudience;
  departmentId?: string;
  showOnLogin: boolean;
  acknowledgmentRequired: boolean;
  expiresAt?: string;
}
export interface ListResponse {
  success: boolean;
  data: Announcement[];
  pagination: { page: number; limit: number; total: number };
}
export interface OneResponse { success: boolean; data: Announcement }
export interface PendingResponse { success: boolean; data: Announcement[] }
