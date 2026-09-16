"use client";
import Link from "next/link";
import {
    ArrowLeft,
    Check,
    CircleAlert,
    LoaderCircle,
    Megaphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatNoticeDate, priorityLabel } from "../../format";
import {
    useAcknowledgeAnnouncement,
    useMyAnnouncement,
    useReadAnnouncement,
} from "../../hooks";

export function EmployeeAnnouncementDetail({ id }: { id: string }) {
    const detail = useMyAnnouncement(id);
    const read = useReadAnnouncement();
    const acknowledge = useAcknowledgeAnnouncement();
    const notice = detail.data?.data;
    return (
        <main className="mx-auto flex w-full flex-col gap-5">
            <Link
                href="/employee/announcements"
                className="inline-flex w-fit items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
            >
                <ArrowLeft className="size-4" />
                All announcements
            </Link>
            {detail.isPending ? (
                <div className="h-72 animate-pulse rounded-2xl bg-muted" />
            ) : detail.isError || !notice ? (
                <div className="rounded-xl border p-10 text-center">
                    <CircleAlert className="mx-auto size-7 text-destructive" />
                    <h1 className="mt-3 text-lg font-semibold">
                        This announcement is unavailable
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        It may have expired, been archived, or was shared with
                        another team.
                    </p>
                    <Button
                        variant="outline"
                        className="mt-5"
                        onClick={() => void detail.refetch()}
                    >
                        Try again
                    </Button>
                </div>
            ) : (
                <article className="overflow-hidden rounded-2xl border bg-card">
                    <div className="border-b bg-gradient-to-r from-primary/10 via-primary/5 to-transparent p-6 sm:p-8">
                        <div className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                            <Megaphone className="size-4 text-primary" />
                            <span>Company announcement</span>
                            <span>·</span>
                            <span>{priorityLabel[notice.priority]}</span>
                            {!notice.readAt && (
                                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-primary">
                                    Unread
                                </span>
                            )}
                        </div>
                        <h1 className="mt-4 break-words text-2xl font-semibold tracking-tight sm:text-3xl">
                            {notice.title}
                        </h1>
                        <p className="mt-3 text-xs text-muted-foreground">
                            Published {formatNoticeDate(notice.publishedAt)}
                            {notice.expiresAt &&
                                ` · Available until ${formatNoticeDate(notice.expiresAt)}`}
                        </p>
                    </div>
                    <div className="whitespace-pre-wrap break-words p-6 text-sm leading-7 sm:p-8">
                        {notice.body}
                    </div>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-t bg-muted/10 p-5 sm:px-8">
                        <p className="text-xs text-muted-foreground">
                            {notice.acknowledgedAt
                                ? `Acknowledged ${formatNoticeDate(notice.acknowledgedAt)}`
                                : notice.readAt
                                  ? `Read ${formatNoticeDate(notice.readAt)}`
                                  : "Please mark this notice as read."}
                        </p>
                        {notice.acknowledgmentRequired &&
                        !notice.acknowledgedAt ? (
                            <Button
                                disabled={acknowledge.isPending}
                                onClick={() => acknowledge.mutate(id)}
                            >
                                {acknowledge.isPending ? (
                                    <LoaderCircle className="animate-spin" />
                                ) : (
                                    <Check />
                                )}
                                Acknowledge notice
                            </Button>
                        ) : !notice.readAt ? (
                            <Button
                                variant="outline"
                                disabled={read.isPending}
                                onClick={() => read.mutate(id)}
                            >
                                {read.isPending ? (
                                    <LoaderCircle className="animate-spin" />
                                ) : (
                                    <Check />
                                )}
                                Mark as read
                            </Button>
                        ) : null}
                    </div>
                </article>
            )}
        </main>
    );
}
