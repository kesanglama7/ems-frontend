import type { AnnouncementPriority, AnnouncementStatus } from "./types";
export const priorityLabel: Record<AnnouncementPriority, string> = { NORMAL: "Standard", IMPORTANT: "Important", URGENT: "Urgent" };
export const statusLabel: Record<AnnouncementStatus, string> = { DRAFT: "Draft", SCHEDULED: "Scheduled", PUBLISHED: "Published", ARCHIVED: "Archived" };
export function formatNoticeDate(value: string | null | undefined) {
  return value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(new Date(value)) : "—";
}
export function localDateTime(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  const adjusted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return adjusted.toISOString().slice(0, 16);
}
