"use client";

import { Bell, CheckCheck, LoaderCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  useMarkAllNotificationsRead,
  useMarkNotificationRead,
  useNotifications,
  useUnreadCount,
} from "./hooks";

export function NotificationBell() {
  const notifications = useNotifications();
  const unreadCount = useUnreadCount();
  const markAsRead = useMarkNotificationRead();
  const markAllAsRead = useMarkAllNotificationsRead();

  const unread = unreadCount.data?.data.unreadCount ?? 0;
  const items = notifications.data?.data ?? [];

  return (
    <Popover>
      <PopoverTrigger
       render={
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="relative ml-auto rounded-full"
          aria-label={
            unread > 0
              ? `${unread} unread notifications`
              : "Open notifications"
          }
        >
          <Bell className="size-5" />

          {unread > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-semibold leading-4 text-destructive-foreground ring-2 ring-background">
              {unread > 99 ? "99+" : unread}
            </span>
          )}
        </Button>
       }
       />

      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[calc(100vw-2rem)] max-w-sm overflow-hidden p-0"
      >
        <header className="flex items-center justify-between gap-3 border-b px-4 py-3">
          <div className="min-w-0">
            <h2 className="font-semibold">Notifications</h2>
            <p className="text-xs text-muted-foreground">
              Updates about leave requests
            </p>
          </div>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="shrink-0 gap-1.5"
            disabled={unread === 0 || markAllAsRead.isPending}
            onClick={() => markAllAsRead.mutate()}
          >
            {markAllAsRead.isPending ? (
              <LoaderCircle className="size-4 animate-spin" />
            ) : (
              <CheckCheck className="size-4" />
            )}
            Mark all read
          </Button>
        </header>

        <ScrollArea className="h-auto max-h-[max(24rem,70vh)] -mt-4">
          {notifications.isPending ? (
            <div className="grid min-h-40 place-items-center">
              <LoaderCircle
                className="size-5 animate-spin text-muted-foreground"
                aria-label="Loading notifications"
              />
            </div>
          ) : items.length === 0 ? (
            <div className="flex min-h-40 flex-col items-center justify-center px-6 text-center">
              <div className="mb-3 rounded-full bg-muted p-3">
                <Bell className="size-5 text-muted-foreground" />
              </div>

              <p className="text-sm font-medium">You’re all caught up</p>
              <p className="mt-1 text-xs text-muted-foreground">
                New leave updates will appear here.
              </p>
            </div>
          ) : (
            <div>
              {items.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  className={[
                    "relative w-full border-b px-4 py-3 text-left",
                    "transition-colors last:border-b-0 hover:bg-muted/60",
                    "focus-visible:outline-none focus-visible:ring-2",
                    "focus-visible:ring-inset focus-visible:ring-ring",
                    item.isRead ? "" : "bg-primary/[0.06]",
                  ].join(" ")}
                  onClick={() => {
                    if (!item.isRead && !markAsRead.isPending) {
                      markAsRead.mutate(item.id);
                    }
                  }}
                >
                  {!item.isRead && (
                    <span
                      className="absolute left-1.5 top-5 size-1.5 rounded-full bg-primary"
                      aria-hidden="true"
                    />
                  )}

                  <div className="space-y-1">
                    <p
                      className={`text-sm ${
                        item.isRead ? "font-medium" : "font-semibold"
                      }`}
                    >
                      {item.title}
                    </p>

                    <p className="line-clamp-2 text-xs leading-5 text-muted-foreground">
                      {item.message}
                    </p>

                    <time
                      dateTime={item.createdAt}
                      className="block text-[11px] text-muted-foreground"
                    >
                      {new Date(item.createdAt).toLocaleString()}
                    </time>
                  </div>
                </button>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}