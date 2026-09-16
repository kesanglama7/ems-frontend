"use client";

import { useState } from "react";
import { ArrowLeft, Check, RotateCcw, X } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { getInitials } from "@/lib/name-shorten";

import {
  useAdminLeaveDetail,
  useApproveLeave,
  useCancelAdminLeave,
  useRejectLeave,
} from "../../hooks/use-admin-leaves";
import { LEAVE_STATUS_LABELS } from "../../constants/leave.constants";
import type { LeaveStatus } from "../../types/leave.types";

type View = "details" | "approve" | "reject" | "recover" | "cancel";

interface LeaveRequestDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveId: string;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getStatusVariant(status: LeaveStatus) {
  switch (status) {
    case "PENDING": return "outline";
    case "APPROVED": return "default";
    case "REJECTED":
    case "AUTO_REJECTED": return "destructive";
    case "CANCELLED": return "secondary";
    default: return "default";
  }
}

const viewCopy: Record<View, { title: string; description: string }> = {
  details: {
    title: "Leave request details",
    description: "Review this request and its current status.",
  },
  approve: {
    title: "Approve leave request",
    description: "Confirm the decision before approving this request.",
  },
  reject: {
    title: "Reject leave request",
    description: "Explain the decision before rejecting this request.",
  },
  recover: {
    title: "Approve rejected request",
    description: "Correct an accidental or automatic rejection.",
  },
  cancel: {
    title: "Cancel approved leave",
    description: "Cancel leave that the employee no longer needs.",
  },
};

export function LeaveRequestDetailDialog(props: LeaveRequestDetailDialogProps) {
  return (
    <LeaveRequestDetailDialogBody
      key={`${props.leaveId}:${props.open}`}
      {...props}
    />
  );
}

function LeaveRequestDetailDialogBody({
  open,
  onOpenChange,
  leaveId,
}: LeaveRequestDetailDialogProps) {
  const [view, setView] = useState<View>("details");
  const [note, setNote] = useState("");
  const [noteError, setNoteError] = useState(false);

  const detail = useAdminLeaveDetail(leaveId);
  const approveLeave = useApproveLeave();
  const rejectLeave = useRejectLeave();
  const cancelLeave = useCancelAdminLeave();
  const leave = detail.data?.data;
  const isSubmitting =
    approveLeave.isPending || rejectLeave.isPending || cancelLeave.isPending;

  function changeView(nextView: View) {
    if (isSubmitting) return;
    setView(nextView);
    setNote("");
    setNoteError(false);
  }

  function handleOpenChange(nextOpen: boolean) {
    if (isSubmitting) return;
    onOpenChange(nextOpen);
  }

  const canSubmit = Boolean(
    ((view === "approve" || view === "reject") && leave?.status === "PENDING") ||
    (view === "recover" &&
      (leave?.status === "REJECTED" || leave?.status === "AUTO_REJECTED")) ||
    (view === "cancel" && leave?.status === "APPROVED"),
  );

  const requiresNote = view === "reject" || view === "recover" || view === "cancel";

  async function submitAction() {
    if (!leave || !canSubmit || isSubmitting) return;

    const trimmedNote = note.trim();
    if (requiresNote && !trimmedNote) {
      setNoteError(true);
      return;
    }

    try {
      if (view === "approve") {
        await approveLeave.mutateAsync({ leaveId, payload: {} });
      } else if (view === "recover") {
        await approveLeave.mutateAsync({ leaveId, payload: { note: trimmedNote } });
      } else if (view === "reject") {
        await rejectLeave.mutateAsync({ leaveId, payload: { note: trimmedNote } });
      } else if (view === "cancel") {
        await cancelLeave.mutateAsync({ leaveId, payload: { note: trimmedNote } });
      }

      onOpenChange(false);
    } catch {
      // The mutation hooks show API errors. Keep this dialog open for correction.
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="flex max-h-[90vh] flex-col sm:max-w-lg">
        <DialogHeader>
          <div className="flex items-start gap-2">
            {view !== "details" && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="-ml-2 shrink-0"
                disabled={isSubmitting}
                aria-label="Back to request details"
                onClick={() => changeView("details")}
              >
                <ArrowLeft className="size-4" />
              </Button>
            )}
            <div>
              <DialogTitle>{viewCopy[view].title}</DialogTitle>
              <DialogDescription className="mt-1">
                {viewCopy[view].description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {detail.isPending ? (
          <div className="space-y-5 py-4">
            <div className="flex items-center gap-3">
              <Skeleton className="size-10 rounded-full" />
              <Skeleton className="h-5 w-36" />
            </div>
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-20 w-full rounded-lg" />
          </div>
        ) : detail.isError ? (
          <div className="py-10 text-center text-sm">
            <p className="text-muted-foreground">Could not load this request.</p>
            <Button variant="link" onClick={() => detail.refetch()}>
              Try again
            </Button>
          </div>
        ) : !leave ? (
          <div className="py-10 text-center text-sm text-muted-foreground">
            Leave request not found.
          </div>
        ) : (
          <>
            <div className="min-h-0 overflow-y-auto py-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback className="text-sm">
                      {getInitials(leave.employee.firstName, leave.employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold">
                      {leave.employee.firstName} {leave.employee.lastName}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {leave.employee.department?.name ?? "No department"} · {leave.employee.employeeCode}
                    </p>
                  </div>
                </div>
                <Badge variant={getStatusVariant(leave.status)} className="shrink-0">
                  {LEAVE_STATUS_LABELS[leave.status]}
                </Badge>
              </div>

              <div className="mt-5 rounded-lg border bg-muted/20 p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-medium">{leave.leaveType.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {leave.requestedDays} {leave.requestedDays === 1 ? "day" : "days"} · {leave.duration.replaceAll("_", " ").toLowerCase()}
                  </p>
                </div>
                <p className="mt-2 text-sm text-muted-foreground">
                  {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                </p>
              </div>

              {view === "details" && (
                <div className="mt-5 space-y-5">
                  <div>
                    <p className="mb-2 text-sm font-medium">Reason for leave</p>
                    <div className="whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm">
                      {leave.reason?.trim() || <span className="italic text-muted-foreground">No reason provided.</span>}
                    </div>
                  </div>
                  {leave.reviewedAt && (
                    <div>
                      <p className="mb-2 text-sm font-medium">
                        Review note <span className="ml-2 font-normal text-muted-foreground">· {formatDate(leave.reviewedAt)}</span>
                      </p>
                      <div className="whitespace-pre-wrap rounded-md bg-muted/40 p-3 text-sm">
                        {leave.reviewNote?.trim() || <span className="italic text-muted-foreground">No note provided.</span>}
                      </div>
                    </div>
                  )}
                  {leave.autoRejectedAt && (
                    <p className="text-xs text-muted-foreground">
                      Automatically rejected on {formatDate(leave.autoRejectedAt)}.
                    </p>
                  )}
                </div>
              )}

              {view === "approve" && (
                <p className="mt-5 text-sm text-muted-foreground">
                  Approving this request does not require a note.
                </p>
              )}
              {view === "recover" && (
                <p className="mt-5 text-sm text-muted-foreground">
                  This changes the rejected request to approved. Explain why the
                  rejection is being corrected for the review record.
                </p>
              )}
              {view === "cancel" && (
                <p className="mt-5 text-sm text-muted-foreground">
                  Cancelling this approved leave restores its balance. Confirm
                  with the employee that the leave is no longer needed.
                </p>
              )}

              {requiresNote && (
                <div className="mt-5">
                  <label htmlFor="leave-action-note" className="text-sm font-medium">
                    {view === "reject" ? "Reason for rejection" :
                      view === "recover" ? "Reason for correction" : "Reason for cancellation"}
                  </label>
                  <Textarea
                    id="leave-action-note"
                    className="mt-3"
                    rows={4}
                    maxLength={500}
                    value={note}
                    disabled={isSubmitting}
                    aria-invalid={noteError}
                    aria-describedby={noteError ? "leave-action-note-error" : undefined}
                    placeholder={view === "cancel"
                      ? "For example: Employee confirmed the leave is no longer needed."
                      : view === "recover"
                        ? "Explain why the previous rejection should be reversed..."
                        : "Explain why this leave request was rejected..."}
                    onChange={(event) => {
                      setNote(event.target.value);
                      setNoteError(false);
                    }}
                  />
                  <div className="mt-1 flex justify-between gap-2 text-xs">
                    <p id="leave-action-note-error" className="text-destructive">
                      {noteError ? "A reason is required." : ""}
                    </p>
                    <p className="text-muted-foreground">{note.length}/500</p>
                  </div>
                </div>
              )}

              {view !== "details" && !canSubmit && (
                <p className="mt-4 text-sm text-muted-foreground">
                  This request&apos;s status has changed. Return to details to review it.
                </p>
              )}
            </div>

            <DialogFooter className="border-t pt-4">
              {view === "details" && leave.status === "PENDING" && (
                <>
                  <Button type="button" variant="outline" onClick={() => changeView("reject")}>
                    <X className="size-4" /> Reject
                  </Button>
                  <Button type="button" onClick={() => changeView("approve")}>
                    <Check className="size-4" /> Approve
                  </Button>
                </>
              )}
              {view === "details" &&
                (leave.status === "REJECTED" || leave.status === "AUTO_REJECTED") && (
                  <>
                    <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                      Close
                    </Button>
                    <Button type="button" onClick={() => changeView("recover")}>
                      <RotateCcw className="size-4" /> Approve instead
                    </Button>
                  </>
                )}
              {view === "details" && leave.status === "APPROVED" && (
                <>
                  <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                    Close
                  </Button>
                  <Button type="button" variant="destructive" onClick={() => changeView("cancel")}>
                    Cancel approved leave
                  </Button>
                </>
              )}
              {view === "details" && leave.status === "CANCELLED" && (
                <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                  Close
                </Button>
              )}

              {view !== "details" && (
                <>
                  <Button type="button" variant="outline" disabled={isSubmitting}
                    onClick={() => changeView("details")}>Back</Button>
                  <Button
                    type="button"
                    variant={view === "reject" || view === "cancel" ? "destructive" : "default"}
                    disabled={!canSubmit || isSubmitting}
                    onClick={submitAction}
                  >
                    {view === "cancel" ? cancelLeave.isPending ? "Cancelling..." : "Confirm cancellation" :
                      view === "reject" ? rejectLeave.isPending ? "Rejecting..." : "Confirm rejection" :
                        approveLeave.isPending ? "Approving..." : "Confirm approval"}
                  </Button>
                </>
              )}
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
