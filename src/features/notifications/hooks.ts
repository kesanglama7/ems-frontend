"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getNotifications, getUnreadCount, markAllNotificationsRead, markNotificationRead } from "./api";
const keys = { all: ["notifications"] as const, count: ["notifications", "count"] as const };
export function useNotifications() { return useQuery({ queryKey: keys.all, queryFn: getNotifications, refetchInterval: 60_000 }); }
export function useUnreadCount() { return useQuery({ queryKey: keys.count, queryFn: getUnreadCount, refetchInterval: 60_000 }); }
export function useMarkNotificationRead() { const qc=useQueryClient(); return useMutation({ mutationFn: markNotificationRead, onSuccess:()=>qc.invalidateQueries({queryKey:keys.all}) }); }
export function useMarkAllNotificationsRead() { const qc=useQueryClient(); return useMutation({ mutationFn: markAllNotificationsRead, onSuccess:()=>qc.invalidateQueries({queryKey:keys.all}) }); }
