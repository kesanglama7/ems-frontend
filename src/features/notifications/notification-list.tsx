"use client";
import { Bell, LoaderCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationItem } from "./notification-item";
import { visibleNotifications } from "./notification-utils";
import { useNotifications } from "./hooks";
import type { NotificationFilters } from "./types";
export function NotificationList({ filters = {}, compact = false, active = true, onNavigate }: { filters?: NotificationFilters; compact?: boolean; active?: boolean; onNavigate?: () => void }) {
  const query = useNotifications(filters, active);
  const items = visibleNotifications(query.data?.pages);
  if (query.isPending) return <div className="space-y-5 p-5" aria-label="Loading notifications" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="flex gap-3"><Skeleton className="size-9 rounded-xl" /><div className="flex-1 space-y-2"><Skeleton className="h-3 w-24" /><Skeleton className="h-4 w-3/4" /><Skeleton className="h-3 w-full" /></div></div>)}</div>;
  if (query.isError && !query.data) return <div className="flex min-h-56 flex-col items-center justify-center gap-3 px-6 text-center"><p className="text-sm font-medium">Couldn’t load your notifications</p><p className="text-xs text-muted-foreground">Check your connection and try again.</p><Button variant="outline" size="sm" onClick={() => void query.refetch()}><RefreshCw />Try again</Button></div>;
  return <>
    {query.isError && <p role="status" className="border-b px-4 py-2 text-xs text-destructive">Updates paused. <button className="underline" onClick={() => void query.refetch()}>Retry</button></p>}
    {!items.length ? <div className="flex min-h-64 flex-col items-center justify-center px-6 text-center"><div className="mb-4 rounded-2xl border bg-muted/30 p-4"><Bell className="size-6 text-muted-foreground" /></div><p className="text-sm font-semibold">{filters.unread ? "You’re all caught up" : filters.category ? "No updates in this category" : "Your inbox is clear"}</p><p className="mt-2 max-w-64 text-xs leading-5 text-muted-foreground">{filters.unread ? "You’ve read all your recent updates." : "New updates from your workplace will appear here."}</p></div> : items.map((item) => <NotificationItem key={item.id} item={item} compact={compact} onNavigate={onNavigate} />)}
    {query.hasNextPage && <div className="flex justify-center border-t p-3"><Button variant="ghost" size="sm" disabled={query.isFetchingNextPage} onClick={() => void query.fetchNextPage()}>{query.isFetchingNextPage && <LoaderCircle className="animate-spin" />}Load more</Button></div>}
  </>;
}
