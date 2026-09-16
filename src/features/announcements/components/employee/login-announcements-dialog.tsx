"use client";
import { useState } from "react";
import Link from "next/link";
import { Check, CircleAlert, LoaderCircle, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { formatNoticeDate, priorityLabel } from "../../format";
import { useAcknowledgeAnnouncement, useLoginAnnouncements, useReadAnnouncement } from "../../hooks";

export function LoginAnnouncementsDialog() {
  const pending = useLoginAnnouncements();
  const read = useReadAnnouncement(); const acknowledge = useAcknowledgeAnnouncement();
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());
  const notices = pending.data?.data ?? [];
  const notice = notices.find((item) => !dismissed.has(item.id));
  const busy = read.isPending || acknowledge.isPending;
  const dismiss = () => { if (notice) setDismissed((previous) => new Set(previous).add(notice.id)); };
  async function confirm() {
    if (!notice) return;
    try {
      if (notice.acknowledgmentRequired && !notice.acknowledgedAt) await acknowledge.mutateAsync(notice.id);
      else if (!notice.readAt) await read.mutateAsync(notice.id);
      dismiss();
    } catch { /* The mutation shows the API error; leave the dialog visible. */ }
  }
  return <Dialog open={Boolean(notice)} onOpenChange={(next) => { if (!next && !busy) dismiss(); }}>
    <DialogContent className="max-h-[min(90dvh,760px)] overflow-y-auto sm:max-w-xl">
      {notice && <><DialogHeader><div className="mb-2 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary"><Megaphone className="size-5" /></div><DialogTitle className="break-words text-xl leading-7">{notice.title}</DialogTitle><DialogDescription>{priorityLabel[notice.priority]} company announcement · {formatNoticeDate(notice.publishedAt)}{notice.acknowledgmentRequired && !notice.acknowledgedAt ? " · Acknowledgment required" : ""}</DialogDescription></DialogHeader><div className="max-h-[40dvh] overflow-y-auto whitespace-pre-wrap break-words rounded-xl border bg-muted/20 p-5 text-sm leading-6">{notice.body}</div>{notice.acknowledgmentRequired && !notice.acknowledgedAt && <p className="flex items-start gap-2 text-xs text-muted-foreground"><CircleAlert className="mt-0.5 size-4 shrink-0" />You can review it later. Until you acknowledge it, it will appear again when you enter the portal.</p>}<DialogFooter className="gap-2"><Button variant="outline" disabled={busy} onClick={dismiss}>Review later</Button><Button disabled={busy} onClick={() => void confirm()}>{busy ? <LoaderCircle className="animate-spin" /> : <Check />}{notice.acknowledgmentRequired && !notice.acknowledgedAt ? "I acknowledge" : "Mark as read"}</Button></DialogFooter><Link href={`/employee/announcements/${encodeURIComponent(notice.id)}`} onClick={dismiss} className="text-center text-xs font-medium text-primary underline-offset-4 hover:underline">Open full announcement</Link>{notices.length > 1 && <p className="text-center text-[11px] text-muted-foreground">{notices.length} notices waiting for your attention</p>}</>}
    </DialogContent>
  </Dialog>;
}
