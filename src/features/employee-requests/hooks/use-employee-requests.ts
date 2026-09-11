"use client";

import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getApiErrorMessage } from "@/lib/api-error";
import * as requestApi from "../api/employee-requests.api";
import type {
  CreateRequestPayload,
  DismissRequestPayload,
  EmployeeRequest,
  RequestListResponse,
  RequestQuery,
  RequestStatus,
  RequestSummaryResponse,
} from "../types/employee-request.types";

export const requestKeys = {
  all: ["employee-requests"] as const,
  list: (admin: boolean, query: RequestQuery) => ["employee-requests", admin ? "admin" : "mine", "list", query] as const,
  summary: (query: RequestQuery) => ["employee-requests", "admin", "summary", query] as const,
  detail: (admin: boolean, id: string) => ["employee-requests", admin ? "admin" : "mine", "detail", id] as const,
};

export function useRequests(admin: boolean, query: RequestQuery) {
  return useQuery({
    queryKey: requestKeys.list(admin, query),
    queryFn: () => admin ? requestApi.getAdminRequests(query) : requestApi.getMyRequests(query),
    placeholderData: keepPreviousData,
    refetchInterval: admin ? 30_000 : 60_000,
    refetchOnWindowFocus: true,
  });
}

export function useAdminRequestSummary(query: RequestQuery) {
  return useQuery({
    queryKey: requestKeys.summary(query),
    queryFn: () => requestApi.getAdminRequestSummary(query),
    refetchInterval: 30_000,
    refetchOnWindowFocus: true,
  });
}

export function useRequestDetail(id: string | null, admin: boolean) {
  return useQuery({
    queryKey: requestKeys.detail(admin, id ?? ""),
    queryFn: () => requestApi.getRequest(id!, admin),
    enabled: Boolean(id),
  });
}

function mutationToast(error: unknown) {
  toast.error(getApiErrorMessage(error));
}

function useInvalidateRequests() {
  const queryClient = useQueryClient();
  return () => queryClient.invalidateQueries({ queryKey: requestKeys.all });
}

export function useCreateRequest() {
  const invalidate = useInvalidateRequests();
  return useMutation({
    mutationFn: (payload: CreateRequestPayload) => requestApi.createRequest(payload),
    onSuccess: (data) => {
      void invalidate();
      toast.success(data.message ?? "Request submitted.");
    },
    onError: mutationToast,
  });
}

export function useCancelRequest() {
  const invalidate = useInvalidateRequests();
  return useMutation({
    mutationFn: requestApi.cancelRequest,
    onSuccess: (data) => {
      void invalidate();
      toast.success(data.message ?? "Request cancelled.");
    },
    onError: mutationToast,
  });
}

export function useAssignRequest() {
  const invalidate = useInvalidateRequests();
  return useMutation({
    mutationFn: ({ id, adminUserId }: { id: string; adminUserId: string }) =>
      requestApi.assignRequest(id, adminUserId),
    onSuccess: () => {
      void invalidate();
      toast.success("Request assigned to you.");
    },
    onError: mutationToast,
  });
}

export function useUpdateAdminNote() {
  const invalidate = useInvalidateRequests();
  return useMutation({
    mutationFn: ({ id, adminNote }: { id: string; adminNote: string | null }) =>
      requestApi.updateAdminNote(id, adminNote),
    onSuccess: (data) => {
      void invalidate();
      toast.success(data.message ?? "Admin note saved.");
    },
    onError: mutationToast,
  });
}

export function useDismissRequest() {
  const invalidate = useInvalidateRequests();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: DismissRequestPayload }) =>
      requestApi.dismissRequest(id, payload),
    onSuccess: (data) => {
      void invalidate();
      toast.success(data.message ?? "Request dismissed.");
    },
    onError: mutationToast,
  });
}

export function useUpdateRequestStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, resolutionNote }: { id: string; status: RequestStatus; resolutionNote?: string; request?: EmployeeRequest; boardQuery?: RequestQuery }) =>
      requestApi.updateRequestStatus(id, status, resolutionNote),
    onMutate: async ({ id, status, request, boardQuery }) => {
      await queryClient.cancelQueries({ queryKey: requestKeys.all });
      const previous = queryClient.getQueriesData({ queryKey: requestKeys.all });

      if (!request || !boardQuery) return { previous };

      const normalizedBoardQuery = { ...boardQuery, status: undefined, page: undefined, limit: undefined };
      const movedRequest: EmployeeRequest = {
        ...request,
        status,
        updatedAt: new Date().toISOString(),
      };

      for (const [key, old] of queryClient.getQueriesData<RequestListResponse>({ queryKey: requestKeys.all })) {
        if (key[0] !== "employee-requests" || key[1] !== "admin" || key[2] !== "list" || !old) continue;
        const cachedQuery = (key[3] ?? {}) as RequestQuery;
        const normalizedCachedQuery = { ...cachedQuery, status: undefined, page: undefined, limit: undefined };
        if (JSON.stringify(normalizedCachedQuery) !== JSON.stringify(normalizedBoardQuery)) continue;

        const withoutMovedRequest = old.data.filter((item) => item.id !== id);
        const belongsInList = !cachedQuery.status || cachedQuery.status === status;
        const wasInList = old.data.some((item) => item.id === id);
        const data = belongsInList ? [movedRequest, ...withoutMovedRequest] : withoutMovedRequest;
        const totalChange = belongsInList && !wasInList ? 1 : !belongsInList && wasInList ? -1 : 0;

        queryClient.setQueryData<RequestListResponse>(key, {
          ...old,
          data: data.slice(0, old.pagination.limit),
          pagination: { ...old.pagination, total: Math.max(0, old.pagination.total + totalChange) },
        });
      }

      for (const [key, old] of queryClient.getQueriesData<RequestSummaryResponse>({ queryKey: requestKeys.all })) {
        if (key[0] !== "employee-requests" || key[1] !== "admin" || key[2] !== "summary" || !old) continue;
        const cachedQuery = (key[3] ?? {}) as RequestQuery;
        if (JSON.stringify(cachedQuery) !== JSON.stringify(boardQuery)) continue;
        queryClient.setQueryData<RequestSummaryResponse>(key, {
          ...old,
          data: {
            counts: {
              ...old.data.counts,
              [request.status]: Math.max(0, old.data.counts[request.status] - 1),
              [status]: old.data.counts[status] + 1,
            },
          },
        });
      }

      return { previous };
    },
    onSuccess: (data) => {
      toast.success(data.message ?? "Status updated.");
    },
    onError: (error, _variables, context) => {
      context?.previous.forEach(([key, data]) => queryClient.setQueryData(key, data));
      mutationToast(error);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: requestKeys.all }),
  });
}
