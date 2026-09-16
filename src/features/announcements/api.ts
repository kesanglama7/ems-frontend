import { api } from "@/lib/api";
import type { AnnouncementPayload, AnnouncementStatus, ListResponse, OneResponse, PendingResponse } from "./types";

const adminPath = "/admin/announcements";
const employeePath = "/announcements";
export const listAdminAnnouncements = (params: { page: number; limit: number; status?: AnnouncementStatus }, signal?: AbortSignal) =>
  api.get<ListResponse>(adminPath, { params, signal }).then((response) => response.data);
export const getAdminAnnouncement = (id: string, signal?: AbortSignal) =>
  api.get<OneResponse>(`${adminPath}/${encodeURIComponent(id)}`, { signal }).then((response) => response.data);
export const createAnnouncement = (payload: AnnouncementPayload) =>
  api.post<OneResponse>(adminPath, payload).then((response) => response.data);
export const updateAnnouncement = (id: string, payload: AnnouncementPayload) =>
  api.patch<OneResponse>(`${adminPath}/${encodeURIComponent(id)}`, payload).then((response) => response.data);
export const publishAnnouncement = (id: string) =>
  api.post<OneResponse>(`${adminPath}/${encodeURIComponent(id)}/publish`).then((response) => response.data);
export const scheduleAnnouncement = (id: string, publishAt: string) =>
  api.post<OneResponse>(`${adminPath}/${encodeURIComponent(id)}/schedule`, { publishAt }).then((response) => response.data);
export const archiveAnnouncement = (id: string) =>
  api.post(`${adminPath}/${encodeURIComponent(id)}/archive`).then((response) => response.data);
export const listMyAnnouncements = (params: { page: number; limit: number }, signal?: AbortSignal) =>
  api.get<ListResponse>(employeePath, { params, signal }).then((response) => response.data);
export const getMyAnnouncement = (id: string, signal?: AbortSignal) =>
  api.get<OneResponse>(`${employeePath}/${encodeURIComponent(id)}`, { signal }).then((response) => response.data);
export const getLoginPending = (signal?: AbortSignal) =>
  api.get<PendingResponse>(`${employeePath}/login-pending`, { signal }).then((response) => response.data);
export const markAnnouncementRead = (id: string) =>
  api.patch<OneResponse>(`${employeePath}/${encodeURIComponent(id)}/read`).then((response) => response.data);
export const acknowledgeAnnouncement = (id: string) =>
  api.patch<OneResponse>(`${employeePath}/${encodeURIComponent(id)}/acknowledge`).then((response) => response.data);
