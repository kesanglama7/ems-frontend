import { api } from "@/lib/api";
import type {
  CreateRequestPayload,
  DismissRequestPayload,
  RequestListResponse,
  RequestQuery,
  RequestResponse,
  RequestStatus,
  RequestSummaryResponse,
} from "../types/employee-request.types";

export const getMyRequests = async (params: RequestQuery) =>
  (await api.get<RequestListResponse>("/employee-requests/mine", { params })).data;

export const getAdminRequests = async (params: RequestQuery) =>
  (await api.get<RequestListResponse>("/admin/employee-requests", { params })).data;

export const getAdminRequestSummary = async (params: RequestQuery) =>
  (await api.get<RequestSummaryResponse>("/admin/employee-requests/summary", { params })).data;

export const getRequest = async (id: string, admin: boolean) =>
  (await api.get<RequestResponse>(`${admin ? "/admin" : ""}/employee-requests/${id}`)).data;

export const createRequest = async (payload: CreateRequestPayload) =>
  (await api.post<RequestResponse>("/employee-requests", payload)).data;

export const cancelRequest = async (id: string) =>
  (await api.patch(`/employee-requests/${id}/cancel`)).data;

export const assignRequest = async (id: string, adminUserId: string) =>
  (await api.patch(`/admin/employee-requests/${id}/assign`, { adminUserId })).data;

export const updateAdminNote = async (id: string, adminNote: string | null) =>
  (await api.patch<RequestResponse>(`/admin/employee-requests/${id}/admin-note`, { adminNote })).data;

export const updateRequestStatus = async (
  id: string,
  status: RequestStatus,
  resolutionNote?: string,
) =>
  (await api.patch<RequestResponse>(`/admin/employee-requests/${id}/status`, { status, resolutionNote })).data;

export const dismissRequest = async (id: string, payload: DismissRequestPayload) =>
  (await api.patch<RequestResponse>(`/admin/employee-requests/${id}/dismiss`, payload)).data;
