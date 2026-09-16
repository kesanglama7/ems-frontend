"use client";
import Link from "next/link";
import { formatDistanceToNowStrict } from "date-fns";
import { CalendarDays, Check, Clock3, FileText, Megaphone, MessageSquare, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { useDeleteNotification, useMarkNotificationRead } from "./hooks";
import { categoryLabels, notificationHref } from "./notification-utils";
import type { Notification } from "./types";
const icons = { LEAVE: CalendarDays, REQUEST: MessageSquare, DOCUMENT: FileText, ATTENDANCE: Clock3, ANNOUNCEMENT: Megaphone };
export function NotificationItem({ item, onNavigate, compact = false }: { item: Notification; onNavigate?: () => void; compact?: boolean }) {
  const role = useAuthStore((s) => s.user?.role) ?? "EMPLOYEE";
  const read = useMarkNotificationRead();
  const remove = useDeleteNotification();
  const Icon = icons[item.category] ?? MessageSquare;
  const unread = !item.readAt;
  return (
    <article className={cn("group relative flex gap-3 border-b p-4 transition-colors last:border-b-0 hover:bg-muted/40", unread && "bg-muted/35", !compact && "sm:px-6 sm:py-5")}>
      <div className={cn("mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border bg-background text-muted-foreground", unread && "text-foreground")}><Icon className="size-4" /></div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-muted-foreground">
          <span>{categoryLabels[item.category]}</span><span aria-hidden="true">·</span>
          <time dateTime={item.createdAt} title={new Date(item.createdAt).toLocaleString()}>{formatDistanceToNowStrict(new Date(item.createdAt), { addSuffix: true })}</time>
          {unread && <span className="inline-flex items-center gap-1.5 font-medium text-foreground"><span className="size-1.5 rounded-full bg-primary" />Unread</span>}
        </div>
        <Link href={notificationHref(item, role)} className="block rounded-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
          onClick={() => { if (unread && !read.isPending) read.mutate(item.id); onNavigate?.(); }}>
          <h3 className={cn("text-sm leading-5", unread ? "font-semibold" : "font-medium")}>{item.title}</h3>
          <p className={cn("mt-1 text-xs leading-5 text-muted-foreground", compact && "line-clamp-2")}>{item.message}</p>
          {!compact && <span className="mt-2 inline-block text-xs font-medium text-foreground">View {categoryLabels[item.category]?.toLowerCase() ?? "update"} →</span>}
        </Link>
      </div>
      <div className="flex shrink-0 flex-col gap-1">
        {unread && <Button variant="ghost" size="icon-sm" aria-label={`Mark ${item.title} as read`} title="Mark as read" disabled={read.isPending} onClick={() => read.mutate(item.id)}><Check className="size-3.5" /></Button>}
        <Button variant="ghost" size="icon-sm" className="text-muted-foreground hover:text-destructive" aria-label={`Delete ${item.title}`} title="Delete notification" disabled={remove.isPending} onClick={() => remove.mutate(item.id)}><Trash2 className="size-3.5" /></Button>
      </div>
    </article>
  );
}
