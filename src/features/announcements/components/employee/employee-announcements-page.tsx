"use client";
import { useState } from "react";
import { ChevronLeft, ChevronRight, Megaphone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { NoticeCard } from "./notice-card";
import { useMyAnnouncements } from "../../hooks";

export function EmployeeAnnouncementsPage() {
    const [page, setPage] = useState(1);
    const query = useMyAnnouncements(page);
    const items = query.data?.data ?? [];
    const total = query.data?.pagination.total ?? 0;
    const maxPage = Math.max(1, Math.ceil(total / 12));
    return (
        <main className="mx-auto flex w-full flex-col gap-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                    <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                        <Megaphone className="size-4" />
                        From your company
                    </div>
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Announcements
                    </h1>
                    <p className="mt-2 text-sm text-muted-foreground">
                        Important notices and updates for your team.
                    </p>
                </div>
            </div>
            {query.isPending ? (
                <div className="grid gap-3 sm:grid-cols-2" aria-busy="true">
                    {[0, 1, 2, 3].map((item) => (
                        <div
                            key={item}
                            className="h-40 animate-pulse rounded-xl bg-muted"
                        />
                    ))}
                </div>
            ) : query.isError ? (
                <div className="rounded-xl border p-10 text-center">
                    <p className="text-sm">Couldn’t load your announcements.</p>
                    <Button
                        className="mt-4"
                        variant="outline"
                        onClick={() => void query.refetch()}
                    >
                        Try again
                    </Button>
                </div>
            ) : !items.length ? (
                <div className="rounded-2xl border border-dashed p-12 text-center">
                    <Megaphone className="mx-auto size-10 text-muted-foreground" />
                    <h2 className="mt-4 font-semibold">
                        No announcements right now
                    </h2>
                    <p className="mt-2 text-sm text-muted-foreground">
                        When your company shares an update, you’ll find it here.
                    </p>
                </div>
            ) : (
                <div className="grid items-start gap-4 sm:grid-cols-2">
                    {items.map((notice) => (
                        <NoticeCard key={notice.id} notice={notice} />
                    ))}
                </div>
            )}
            {total > 12 && (
                <div className="flex items-center justify-between border-t pt-4 text-xs text-muted-foreground">
                    <span>
                        Page {page} of {maxPage} · {total} notices
                    </span>
                    <div className="flex gap-2">
                        <Button
                            size="icon-sm"
                            variant="outline"
                            disabled={page === 1}
                            aria-label="Previous page"
                            onClick={() => setPage((value) => value - 1)}
                        >
                            <ChevronLeft />
                        </Button>
                        <Button
                            size="icon-sm"
                            variant="outline"
                            disabled={page >= maxPage}
                            aria-label="Next page"
                            onClick={() => setPage((value) => value + 1)}
                        >
                            <ChevronRight />
                        </Button>
                    </div>
                </div>
            )}
        </main>
    );
}
