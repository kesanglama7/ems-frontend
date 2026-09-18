"use client";
import { useState } from "react";
import {
    Archive,
    ArrowRight,
    BellRing,
    CalendarClock,
    CheckCircle2,
    ChevronLeft,
    ChevronRight,
    CircleAlert,
    FilePenLine,
    LoaderCircle,
    Megaphone,
    Plus,
    RefreshCw,
    UsersRound,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { useDepartments } from "@/features/departments/hooks/use-departments";
import { formatNoticeDate, priorityLabel, statusLabel } from "../../format";
import {
    useAdminAnnouncement,
    useAdminAnnouncements,
    useArchiveAnnouncement,
    usePublishAnnouncement,
    useScheduleAnnouncement,
} from "../../hooks";
import type { Announcement, AnnouncementStatus } from "../../types";
import { AnnouncementForm } from "./announcement-form";

const tabs: { label: string; value?: AnnouncementStatus }[] = [
    { label: "All" },
    { label: "Drafts", value: "DRAFT" },
    { label: "Scheduled", value: "SCHEDULED" },
    { label: "Published", value: "PUBLISHED" },
    { label: "Archived", value: "ARCHIVED" },
];
const priorityColors = {
    NORMAL: "border-border bg-muted/40 text-muted-foreground",
    IMPORTANT:
        "border-amber-200 bg-amber-50 text-amber-800 dark:border-amber-900 dark:bg-amber-950/30 dark:text-amber-300",
    URGENT: "border-rose-200 bg-rose-50 text-rose-700 dark:border-rose-900 dark:bg-rose-950/30 dark:text-rose-300",
};
const statusColors = {
    DRAFT: "bg-muted text-muted-foreground",
    SCHEDULED: "bg-sky-50 text-sky-700 dark:bg-sky-950/40 dark:text-sky-300",
    PUBLISHED:
        "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300",
    ARCHIVED: "bg-muted text-muted-foreground",
};

export function AdminAnnouncementsPage() {
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<AnnouncementStatus | undefined>();
    const [selected, setSelected] = useState<string | null>(null);
    const [editing, setEditing] = useState<Announcement | "new" | null>(null);
    const list = useAdminAnnouncements(page, status);
    const departments = useDepartments();
    const notices = list.data?.data ?? [];
    const total = list.data?.pagination.total ?? 0;
    const lastPage = Math.max(1, Math.ceil(total / 12));

    return (
        <main className="mx-auto flex w-full flex-col gap-7">
            <div className="flex  justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-primary">
                    <h1 className="text-3xl font-semibold tracking-tight">
                        Announcements
                    </h1>
                      <Megaphone className="size-6" />
                  </div>
                    <div className="flex gap-2 mt-2 max-w-xl text-sm text-muted-foreground">
                        Share company updates, choose who sees them, and check
                        who has read or acknowledged them.
                    </div>
                </div>
                <Button onClick={() => setEditing("new")}>
                    <Plus />
                    New announcement
                </Button>
            </div>
            <section className="overflow-hidden rounded-2xl border bg-card">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b p-4 sm:px-6">
                    <div
                        className="flex gap-1 overflow-x-auto"
                        role="group"
                        aria-label="Announcement status"
                    >
                        {tabs.map((tab) => (
                            <Button
                                key={tab.label}
                                size="sm"
                                variant={
                                    status === tab.value ? "secondary" : "ghost"
                                }
                                aria-pressed={status === tab.value}
                                onClick={() => {
                                    setStatus(tab.value);
                                    setPage(1);
                                }}
                            >
                                {tab.label}
                            </Button>
                        ))}
                    </div>
                </div>
                {list.isPending ? (
                    <div className="space-y-3 p-6" aria-busy="true">
                        {[0, 1, 2].map((item) => (
                            <div
                                key={item}
                                className="h-24 animate-pulse rounded-xl bg-muted/60"
                            />
                        ))}
                    </div>
                ) : list.isError ? (
                    <div className="p-10 text-center">
                        <CircleAlert className="mx-auto size-8 text-destructive" />
                        <p className="mt-3 text-sm">
                            Couldn’t load announcements.
                        </p>
                        <Button
                            variant="outline"
                            className="mt-4"
                            onClick={() => void list.refetch()}
                        >
                            Try again
                        </Button>
                    </div>
                ) : !notices.length ? (
                    <div className="p-12 text-center">
                        <Megaphone className="mx-auto size-10 text-muted-foreground/60" />
                        <h2 className="mt-4 font-semibold">
                            {status
                                ? `No ${statusLabel[status].toLowerCase()} announcements`
                                : "No announcements yet"}
                        </h2>
                        <p className="mt-2 text-sm text-muted-foreground">
                            Start with a draft. Nothing is sent until you
                            publish it.
                        </p>
                        <Button
                            className="mt-5"
                            variant="outline"
                            onClick={() => setEditing("new")}
                        >
                            <Plus />
                            Create a draft
                        </Button>
                    </div>
                ) : (
                    <div className="divide-y">
                        {notices.map((notice) => (
                            <button
                                type="button"
                                key={notice.id}
                                className="group flex w-full flex-col gap-2 px-4 py-5 text-left outline-none transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 sm:flex-row sm:items-center sm:justify-between sm:px-6"
                                onClick={() => setSelected(notice.id)}
                            >
                                <div className="min-w-0">
                                    <div className="mb-2 flex flex-wrap items-center gap-2">
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-[11px] font-medium ${statusColors[notice.status]}`}
                                        >
                                            {statusLabel[notice.status]}
                                        </span>
                                        <span
                                            className={`rounded-full border px-2 py-0.5 text-[11px] font-medium ${priorityColors[notice.priority]}`}
                                        >
                                            {priorityLabel[notice.priority]}
                                        </span>
                                    </div>
                                    <h3 className="truncate text-sm font-semibold group-hover:text-primary">
                                        {notice.title}
                                    </h3>
                                    <p className="mt-1 line-clamp-2 max-w-2xl text-xs leading-5 text-muted-foreground">
                                        {notice.body}
                                    </p>
                                    <p className="mt-2 text-[11px] text-muted-foreground">
                                        {notice.audience === "DEPARTMENT"
                                            ? (departments.data?.data.find(
                                                  (item) =>
                                                      item.id ===
                                                      notice.departmentId,
                                              )?.name ?? "Department")
                                            : "All departments"}{" "}
                                        ·{" "}
                                        {notice.status === "SCHEDULED"
                                            ? `Scheduled ${formatNoticeDate(notice.publishAt)}`
                                            : notice.status === "PUBLISHED"
                                              ? `Published ${formatNoticeDate(notice.publishedAt)}`
                                              : `Created ${formatNoticeDate(notice.createdAt)}`}
                                        {notice.status === "PUBLISHED" &&
                                            ` · ${notice._count?.receipts ?? 0} recipients`}
                                    </p>
                                </div>
                                <ArrowRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" />
                            </button>
                        ))}
                    </div>
                )}
                {total > 12 && (
                    <div className="flex items-center justify-between border-t px-4 py-3 text-xs text-muted-foreground sm:px-6">
                        <span>
                            Page {page} of {lastPage} · {total} announcements
                        </span>
                        <div className="flex gap-1">
                            <Button
                                variant="outline"
                                size="icon-sm"
                                aria-label="Previous page"
                                disabled={page <= 1}
                                onClick={() => setPage((value) => value - 1)}
                            >
                                <ChevronLeft />
                            </Button>
                            <Button
                                variant="outline"
                                size="icon-sm"
                                aria-label="Next page"
                                disabled={page >= lastPage}
                                onClick={() => setPage((value) => value + 1)}
                            >
                                <ChevronRight />
                            </Button>
                        </div>
                    </div>
                )}
            </section>
            {editing && (
                <AnnouncementForm
                    key={editing === "new" ? "new" : editing.id}
                    open
                    onClose={() => setEditing(null)}
                    existing={editing === "new" ? undefined : editing}
                    onSaved={() => void list.refetch()}
                />
            )}
            {selected && (
                <AdminAnnouncementDetail
                    key={selected}
                    id={selected}
                    onClose={() => setSelected(null)}
                    onEdit={(notice) => {
                        setSelected(null);
                        setEditing(notice);
                    }}
                    departmentName={
                        departments.data?.data.find(
                            (item) =>
                                item.id ===
                                list.data?.data.find(
                                    (notice) => notice.id === selected,
                                )?.departmentId,
                        )?.name
                    }
                />
            )}
        </main>
    );
}

function AdminAnnouncementDetail({
    id,
    onClose,
    onEdit,
    departmentName,
}: {
    id: string;
    onClose: () => void;
    onEdit: (notice: Announcement) => void;
    departmentName?: string;
}) {
    const detail = useAdminAnnouncement(id);
    const publish = usePublishAnnouncement();
    const schedule = useScheduleAnnouncement();
    const archive = useArchiveAnnouncement();
    const [action, setAction] = useState<
        "overview" | "publish" | "schedule" | "archive"
    >("overview");
    const [time, setTime] = useState("");
    const [error, setError] = useState("");
    const item = detail.data?.data;
    const busy = publish.isPending || schedule.isPending || archive.isPending;
    async function runPublish() {
        try {
            await publish.mutateAsync(id);
            setAction("overview");
        } catch {
            /* Mutation displays error. */
        }
    }
    async function runSchedule() {
        if (
            !time ||
            Number.isNaN(new Date(time).getTime()) ||
            new Date(time) <= new Date()
        ) {
            setError("Choose a future publication time.");
            return;
        }
        if (item?.expiresAt && new Date(time) >= new Date(item.expiresAt)) {
            setError("Publication must occur before expiry.");
            return;
        }
        try {
            await schedule.mutateAsync({
                id,
                publishAt: new Date(time).toISOString(),
            });
            setAction("overview");
        } catch {
            /* Mutation displays error. */
        }
    }
    async function runArchive() {
        try {
            await archive.mutateAsync(id);
            onClose();
        } catch {
            /* Mutation displays error. */
        }
    }
    return (
        <Dialog
            open
            onOpenChange={(next) => {
                if (!next && !busy) onClose();
            }}
        >
            <DialogContent className="max-h-[min(92dvh,850px)] overflow-y-auto sm:max-w-xl">
                <DialogHeader>
                    <DialogTitle>{item?.title ?? "Announcement"}</DialogTitle>
                    <DialogDescription>
                        {item
                            ? `${statusLabel[item.status]} · ${priorityLabel[item.priority]} · ${item.audience === "DEPARTMENT" ? (departmentName ?? "Department") : "All departments"}`
                            : "Loading announcement details…"}
                    </DialogDescription>
                </DialogHeader>
                {detail.isPending ? (
                    <div className="h-40 animate-pulse rounded-lg bg-muted" />
                ) : detail.isError || !item ? (
                    <div className="rounded-lg border p-5 text-sm">
                        Couldn’t load the details.{" "}
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => void detail.refetch()}
                        >
                            Retry
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="whitespace-pre-wrap break-words rounded-xl border bg-muted/25 p-5 text-sm leading-6">
                            {item.body}
                        </div>
                        <div className="grid gap-3 rounded-xl border p-4 text-xs text-muted-foreground sm:grid-cols-2">
                            <span>
                                Created:{" "}
                                <strong className="font-medium text-foreground">
                                    {formatNoticeDate(item.createdAt)}
                                </strong>
                            </span>
                            <span>
                                Published:{" "}
                                <strong className="font-medium text-foreground">
                                    {formatNoticeDate(item.publishedAt)}
                                </strong>
                            </span>
                            <span>
                                Scheduled:{" "}
                                <strong className="font-medium text-foreground">
                                    {formatNoticeDate(item.publishAt)}
                                </strong>
                            </span>
                            <span>
                                Expires:{" "}
                                <strong className="font-medium text-foreground">
                                    {formatNoticeDate(item.expiresAt)}
                                </strong>
                            </span>
                            <span>
                                Login dialog:{" "}
                                <strong className="font-medium text-foreground">
                                    {item.showOnLogin ? "Yes" : "No"}
                                </strong>
                            </span>
                            <span>
                                Acknowledgment:{" "}
                                <strong className="font-medium text-foreground">
                                    {item.acknowledgmentRequired
                                        ? "Required"
                                        : "Not required"}
                                </strong>
                            </span>
                        </div>
                        {item.status === "PUBLISHED" && (
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div className="rounded-xl border p-3">
                                    <p className="text-xl font-semibold">
                                        {item._count?.receipts ?? 0}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Recipients
                                    </p>
                                </div>
                                <div className="rounded-xl border p-3">
                                    <p className="text-xl font-semibold">
                                        {item.readCount ?? 0}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Read
                                    </p>
                                </div>
                                <div className="rounded-xl border p-3">
                                    <p className="text-xl font-semibold">
                                        {item.acknowledgedCount ?? 0}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        Acknowledged
                                    </p>
                                </div>
                            </div>
                        )}
                        {action !== "overview" && (
                            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
                                <h3 className="text-sm font-semibold">
                                    {action === "publish"
                                        ? "Publish this notice now?"
                                        : action === "schedule"
                                          ? "Schedule publication"
                                          : "Archive this notice?"}
                                </h3>
                                <p className="mt-2 text-xs leading-5 text-muted-foreground">
                                    {action === "publish"
                                        ? `The backend will send notifications to active ${item.audience === "DEPARTMENT" ? "department" : "company"} employees. Published content cannot be edited.`
                                        : action === "archive"
                                          ? "Employees will no longer see it, and outstanding notifications are cancelled."
                                          : "The notice will go live automatically at the selected local time."}
                                </p>
                                {action === "schedule" && (
                                    <Input
                                        className="mt-3"
                                        type="datetime-local"
                                        aria-label="Publication date and time"
                                        value={time}
                                        onChange={(event) => {
                                            setTime(event.target.value);
                                            setError("");
                                        }}
                                    />
                                )}
                                {error && (
                                    <p
                                        role="alert"
                                        className="mt-2 text-xs text-destructive"
                                    >
                                        {error}
                                    </p>
                                )}
                                <div className="mt-4 flex flex-wrap justify-end gap-2">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        disabled={busy}
                                        onClick={() => {
                                            setAction("overview");
                                            setError("");
                                        }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={
                                            action === "archive"
                                                ? "destructive"
                                                : "default"
                                        }
                                        disabled={busy}
                                        onClick={() =>
                                            void (action === "publish"
                                                ? runPublish()
                                                : action === "schedule"
                                                  ? runSchedule()
                                                  : runArchive())
                                        }
                                    >
                                        {busy && (
                                            <LoaderCircle className="animate-spin" />
                                        )}
                                        {action === "publish"
                                            ? "Publish and notify"
                                            : action === "schedule"
                                              ? "Schedule notice"
                                              : "Archive notice"}
                                    </Button>
                                </div>
                            </div>
                        )}
                        {action === "overview" && (
                            <DialogFooter className="flex-wrap gap-2">
                                {(item.status === "DRAFT" ||
                                    item.status === "SCHEDULED") && (
                                    <>
                                        <Button
                                            variant="outline"
                                            onClick={() => onEdit(item)}
                                        >
                                            <FilePenLine />
                                            Edit
                                        </Button>
                                        {item.status === "DRAFT" && (
                                            <Button
                                                variant="outline"
                                                onClick={() =>
                                                    setAction("schedule")
                                                }
                                            >
                                                <CalendarClock />
                                                Schedule
                                            </Button>
                                        )}
                                        <Button
                                            onClick={() => setAction("publish")}
                                        >
                                            <BellRing />
                                            Publish now
                                        </Button>
                                    </>
                                )}
                                {item.status !== "ARCHIVED" && (
                                    <Button
                                        variant="ghost"
                                        className="text-destructive"
                                        onClick={() => setAction("archive")}
                                    >
                                        <Archive />
                                        Archive
                                    </Button>
                                )}
                                {item.status === "ARCHIVED" && (
                                    <span className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <CheckCircle2 className="size-4" />
                                        This announcement is archived.
                                    </span>
                                )}
                            </DialogFooter>
                        )}
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
}
