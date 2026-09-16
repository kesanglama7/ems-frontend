"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import { useAuthStore } from "@/stores/auth.store";
import * as requests from "./api";
import type { AnnouncementPayload, AnnouncementStatus } from "./types";

export const announcementKeys = { admin: ["admin-announcements"] as const, employee: ["employee-announcements"] as const };
const useEmployeeId = () => useAuthStore((state) => state.user?.role === "EMPLOYEE" && state.isAuthenticated ? state.user.id : null);
export function useAdminAnnouncements(page: number, status?: AnnouncementStatus) {
  return useQuery({ queryKey: [...announcementKeys.admin, "list", page, status],
    queryFn: ({ signal }) => requests.listAdminAnnouncements({ page, status, limit: 12 }, signal), staleTime: 15_000 });
}
export function useAdminAnnouncement(id: string | null) {
  return useQuery({ queryKey: [...announcementKeys.admin, "detail", id],
    queryFn: ({ signal }) => requests.getAdminAnnouncement(id!, signal), enabled: Boolean(id) });
}
export function useMyAnnouncements(page: number, limit = 12) {
  const id = useEmployeeId();
  return useQuery({ queryKey: [...announcementKeys.employee, id, "list", page, limit],
    queryFn: ({ signal }) => requests.listMyAnnouncements({ page, limit }, signal),
    enabled: Boolean(id), refetchInterval: 60_000, staleTime: 20_000 });
}
export function useMyAnnouncement(id: string) {
  const userId = useEmployeeId();
  return useQuery({ queryKey: [...announcementKeys.employee, userId, "detail", id],
    queryFn: ({ signal }) => requests.getMyAnnouncement(id, signal), enabled: Boolean(userId && id) });
}
export function useLoginAnnouncements() {
  const id = useEmployeeId();
  return useQuery({ queryKey: [...announcementKeys.employee, id, "login-pending"],
    queryFn: ({ signal }) => requests.getLoginPending(signal), enabled: Boolean(id),
    refetchInterval: 60_000, staleTime: 15_000 });
}
function useAdminAction<T, R>(mutationFn: (value: T) => Promise<R>, successMessage: string) {
  const qc = useQueryClient();
  return useMutation({ mutationFn,
    onSuccess: () => { toast.success(successMessage); void qc.invalidateQueries({ queryKey: announcementKeys.admin }); },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });
}
export function useSaveAnnouncement() {
  return useAdminAction((value: { id?: string; payload: AnnouncementPayload }) =>
    value.id ? requests.updateAnnouncement(value.id, value.payload) : requests.createAnnouncement(value.payload), "Draft saved.");
}
export function usePublishAnnouncement() { return useAdminAction(requests.publishAnnouncement, "Announcement published and notifications queued."); }
export function useScheduleAnnouncement() {
  return useAdminAction((value: { id: string; publishAt: string }) => requests.scheduleAnnouncement(value.id, value.publishAt), "Announcement scheduled.");
}
export function useArchiveAnnouncement() { return useAdminAction(requests.archiveAnnouncement, "Announcement archived."); }
export function useReadAnnouncement() {
  const qc = useQueryClient(); const userId = useEmployeeId();
  return useMutation({ mutationFn: requests.markAnnouncementRead,
    onSuccess: () => void qc.invalidateQueries({ queryKey: [...announcementKeys.employee, userId] }),
    onError: (error) => toast.error(getApiErrorMessage(error)) });
}
export function useAcknowledgeAnnouncement() {
  const qc = useQueryClient(); const userId = useEmployeeId();
  return useMutation({ mutationFn: requests.acknowledgeAnnouncement,
    onSuccess: () => { toast.success("Acknowledgment recorded."); void qc.invalidateQueries({ queryKey: [...announcementKeys.employee, userId] }); },
    onError: (error) => toast.error(getApiErrorMessage(error)) });
}
