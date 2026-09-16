"use client";
import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Bell, CheckCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTitle, PopoverDescription, PopoverTrigger } from "@/components/ui/popover";
import { useAuthStore } from "@/stores/auth.store";
import { useMarkAllNotificationsRead, useUnreadCount } from "./hooks";
import { NotificationList } from "./notification-list";
export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadOnly, setUnreadOnly] = useState(false);
  const role = useAuthStore((s) => s.user?.role);
  const count = useUnreadCount();
  const markAll = useMarkAllNotificationsRead();
  const unread = count.data?.data.unreadCount ?? 0;
  return <Popover open={open} onOpenChange={setOpen}>
    <PopoverTrigger render={<Button variant="ghost" size="icon" className="relative ml-auto rounded-lg" aria-label={unread ? `Notifications, ${unread} unread` : "Open notifications"}><Bell className="size-5" />{unread > 0 && <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-semibold text-primary-foreground ring-2 ring-background">{unread > 99 ? "99+" : unread}</span>}</Button>} />
    <PopoverContent align="end" sideOffset={12} className="w-[calc(100vw-2rem)] max-w-[420px] gap-0 overflow-hidden rounded-xl p-0 shadow-xl">
      <div className="flex items-center justify-between gap-3 px-5 pt-5 pb-3"><div><PopoverTitle className="text-base font-semibold">Notifications</PopoverTitle><PopoverDescription className="mt-1 text-xs">{unread ? `${unread} unread workplace updates` : "Your latest workplace updates"}</PopoverDescription></div><Button variant="ghost" size="icon-sm" title="Mark all as read" aria-label="Mark all notifications as read" disabled={!unread || markAll.isPending} onClick={() => markAll.mutate()}><CheckCheck /></Button></div>
      <div className="flex gap-1 border-b px-5 pb-3" aria-label="Filter notifications"><Button variant={unreadOnly ? "ghost" : "secondary"} size="sm" aria-pressed={!unreadOnly} onClick={() => setUnreadOnly(false)}>All</Button><Button variant={unreadOnly ? "secondary" : "ghost"} size="sm" aria-pressed={unreadOnly} onClick={() => setUnreadOnly(true)}>Unread{unread > 0 && <span className="ml-1 text-xs text-muted-foreground">{unread}</span>}</Button></div>
      <div className="max-h-[min(420px,55dvh)] overflow-y-auto overscroll-contain"><NotificationList compact active={open} filters={{ unread: unreadOnly ? true : undefined }} onNavigate={() => setOpen(false)} /></div>
      <div className="flex items-center justify-between border-t bg-muted/20 px-5 py-3"><span className="text-[11px] text-muted-foreground">Updates kept for 7 days</span><Link href={role === "ADMIN" ? "/admin/notifications" : "/employee/notifications"} onClick={() => setOpen(false)} className="inline-flex items-center gap-1 rounded-sm text-xs font-medium outline-none focus-visible:ring-2 focus-visible:ring-ring">View all<ArrowUpRight className="size-3.5" /></Link></div>
    </PopoverContent>
  </Popover>;
}
