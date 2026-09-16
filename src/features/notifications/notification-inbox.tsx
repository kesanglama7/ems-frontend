"use client";
import { useState } from "react";
import { CheckCheck, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from "@/components/ui/dialog";
import {
    useClearNotifications,
    useMarkAllNotificationsRead,
    useUnreadCount,
} from "./hooks";
import { NotificationList } from "./notification-list";
import { categoryLabels } from "./notification-utils";
import type { NotificationCategory } from "./types";
export function NotificationInbox() {
    const [unreadOnly, setUnreadOnly] = useState(false);
    const [category, setCategory] = useState<
        NotificationCategory | undefined
    >();
    const [confirm, setConfirm] = useState(false);
    const count = useUnreadCount();
    const markAll = useMarkAllNotificationsRead();
    const clear = useClearNotifications();
    const unread = count.data?.data.unreadCount ?? 0;
    return (
        <main className="mx-auto flex w-full  flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Notifications
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        Stay up to date with your workplace.
                    </p>
                </div>
            </div>
            <section
                className="overflow-hidden rounded-xl border bg-card"
                aria-label="Notification inbox"
            >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:px-6">
                    <div
                        className="flex gap-1 rounded-lg bg-muted/50 p-1"
                        aria-label="Read status"
                    >
                        <Button
                            size="sm"
                            variant={unreadOnly ? "ghost" : "secondary"}
                            aria-pressed={!unreadOnly}
                            onClick={() => setUnreadOnly(false)}
                        >
                            All updates
                        </Button>
                        <Button
                            size="sm"
                            variant={unreadOnly ? "secondary" : "ghost"}
                            aria-pressed={unreadOnly}
                            onClick={() => setUnreadOnly(true)}
                        >
                            Unread
                            <span className="ml-1 rounded bg-background px-1.5 text-xs">
                                {unread}
                            </span>
                        </Button>
                    </div>
                    <div className="flex gap-1">
                        <Button
                            size="sm"
                            variant="ghost"
                            disabled={!unread || markAll.isPending}
                            onClick={() => markAll.mutate()}
                        >
                            <CheckCheck />
                            Mark all read
                        </Button>
                        <Button
                            size="icon-sm"
                            variant="ghost"
                            className="text-muted-foreground hover:text-destructive"
                            aria-label="Clear all notifications"
                            title="Clear all notifications"
                            onClick={() => setConfirm(true)}
                        >
                            <Trash2 />
                        </Button>
                    </div>
                </div>
                <div
                    className="flex gap-2 overflow-x-auto border-b px-4 py-3 sm:px-6"
                    aria-label="Notification categories"
                >
                    <Button
                        variant={category === undefined ? "secondary" : "ghost"}
                        size="sm"
                        aria-pressed={category === undefined}
                        onClick={() => setCategory(undefined)}
                    >
                        Everything
                    </Button>
                    {Object.entries(categoryLabels).map(([value, label]) => (
                        <Button
                            key={value}
                            variant={category === value ? "secondary" : "ghost"}
                            size="sm"
                            aria-pressed={category === value}
                            onClick={() =>
                                setCategory(value as NotificationCategory)
                            }
                        >
                            {label}
                        </Button>
                    ))}
                </div>
                <NotificationList
                    filters={{
                        category,
                        unread: unreadOnly ? true : undefined,
                    }}
                />
                <p className="border-t bg-muted/20 px-4 py-3 text-xs leading-5 text-muted-foreground sm:px-6">
                    Notifications are automatically removed after 7 days.
                    Deleting an update keeps your workplace records unchanged.
                </p>
            </section>
            <Dialog
                open={confirm}
                onOpenChange={(open) => {
                    if (!clear.isPending) setConfirm(open);
                }}
            >
                <DialogContent>
                    <DialogTitle>Clear your notifications?</DialogTitle>
                    <DialogDescription>
                        This deletes all notifications in your inbox, including
                        unread updates. Your leave, requests, documents, and
                        attendance records are kept.
                    </DialogDescription>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            disabled={clear.isPending}
                            onClick={() => setConfirm(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            disabled={clear.isPending}
                            onClick={() =>
                                clear.mutate(undefined, {
                                    onSuccess: () => setConfirm(false),
                                })
                            }
                        >
                            {clear.isPending
                                ? "Clearing…"
                                : "Clear all notifications"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    );
}
