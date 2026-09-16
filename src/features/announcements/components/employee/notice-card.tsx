"use client";
import Link from "next/link";
import { ArrowUpRight, CircleCheck, CircleAlert, Megaphone } from "lucide-react";
import { formatNoticeDate, priorityLabel } from "../../format";
import type { Announcement } from "../../types";

export function NoticeCard({ notice, compact = false }: { notice: Announcement; compact?: boolean }) {
  const unread = !notice.readAt;
  return <Link href={`/employee/announcements/${encodeURIComponent(notice.id)}`} className="group block rounded-xl border bg-card p-4 outline-none transition-colors hover:border-primary/40 hover:bg-muted/20 focus-visible:ring-2 focus-visible:ring-primary sm:p-5">
    <div className="flex items-start justify-between gap-3"><div className="flex flex-wrap items-center gap-2"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-medium ${notice.priority === "URGENT" ? "bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300" : notice.priority === "IMPORTANT" ? "bg-amber-50 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300" : "bg-muted text-muted-foreground"}`}>{notice.priority === "URGENT" && <CircleAlert className="size-3" />}{priorityLabel[notice.priority]}</span>{unread && <span className="flex items-center gap-1 text-[11px] font-medium text-primary"><span className="size-1.5 rounded-full bg-primary" />New</span>}{notice.acknowledgmentRequired && !notice.acknowledgedAt && <span className="text-[11px] text-muted-foreground">Acknowledgment needed</span>}</div><ArrowUpRight className="size-4 shrink-0 text-muted-foreground group-hover:text-primary" /></div>
    <div className="mt-3 flex gap-3"><div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><Megaphone className="size-4" /></div><div className="min-w-0"><h3 className="text-sm font-semibold leading-5">{notice.title}</h3><p className={`mt-1 whitespace-pre-line break-words text-xs leading-5 text-muted-foreground ${compact ? "line-clamp-2" : "line-clamp-3"}`}>{notice.body}</p></div></div>
    <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t pt-3 text-[11px] text-muted-foreground"><span>{formatNoticeDate(notice.publishedAt)}</span>{notice.acknowledgedAt && <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-300"><CircleCheck className="size-3.5" />Acknowledged</span>}</div>
  </Link>;
}
