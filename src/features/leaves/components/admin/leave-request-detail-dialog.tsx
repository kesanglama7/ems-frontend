"use client";

import { useState } from "react";
import { Check, User, X } from "lucide-react";

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

import { useAdminLeaveDetail } from "../../hooks/use-admin-leaves";
import { LEAVE_STATUS_LABELS } from "../../constants/leave.constants";
import type { LeaveStatus } from "../../types/leave.types";
import { ApproveLeaveDialog } from "./approve-leave-dialog";
import { RejectLeaveDialog } from "./reject-leave-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/name-shorten";

// Helper Functions
const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));

const formatDuration = (duration: string) => 
  duration.replace("_", " ").toLowerCase();

const getStatusVariant = (status: LeaveStatus) => {
  switch (status) {
    case "PENDING": return "outline";
    case "APPROVED": return "default";
    case "REJECTED":
    case "AUTO_REJECTED": return "destructive";
    case "CANCELLED": return "secondary";
    default: return "default";
  }
};

interface LeaveRequestDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveId: string;
}

export function LeaveRequestDetailDialog({
  open,
  onOpenChange,
  leaveId,
}: LeaveRequestDetailDialogProps) {
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);

  const { data: response, isPending } = useAdminLeaveDetail(leaveId);
  const leave = response?.data;

  const leaveSummary = leave
    ? {
        employeeName: `${leave.employee.firstName} ${leave.employee.lastName}`,
        leaveType: leave.leaveType.name,
        startDate: formatDate(leave.startDate),
        endDate: formatDate(leave.endDate),
      }
    : { employeeName: "", leaveType: "", startDate: "", endDate: "" };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Leave Request Details</DialogTitle>
            <DialogDescription>
              Review the employee&apos;s request before making a decision.
            </DialogDescription>
          </DialogHeader>

          {isPending ? (
            <div className="space-y-6 py-4">
              <div className="flex items-center gap-3">
                <Skeleton className="size-10 rounded-full" />
                <div className="space-y-2">
                  <Skeleton className="h-4 w-32" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <Skeleton className="h-24 w-full rounded-lg" />
              <div className="space-y-2">
                <Skeleton className="h-4 w-16" />
                <Skeleton className="h-16 w-full rounded-md" />
              </div>
            </div>
          ) : leave ? (
            <>
              <div className="space-y-6 py-2">
                {/* Header: Employee Profile & Status */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <Avatar className="size-9">
                        <AvatarFallback className="text-sm">
                          {getInitials(
                            leave.employee.firstName,
                            leave.employee.lastName,
                          )}
                        </AvatarFallback>
                      </Avatar>
                    <div>
                      <p className="text-sm font-semibold leading-none">
                        {leave.employee.firstName} {leave.employee.lastName}
                      </p>
                      <p className="mt-1.5 text-xs text-muted-foreground">
                        {leave.employee.department?.name ?? "No Dept"} • {leave.employee.employeeCode}
                      </p>
                    </div>
                  </div>
                  <Badge variant={getStatusVariant(leave.status)} className="shrink-0">
                    {LEAVE_STATUS_LABELS[leave.status]}
                  </Badge>
                </div>

                {/* Main Leave Metrics */}
                <div className="grid grid-cols-2 gap-4 rounded-lg border bg-card p-4 text-sm shadow-sm">
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Leave Type</p>
                    <p className="font-medium">{leave.leaveType.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground mb-1">Duration</p>
                    <p className="font-medium capitalize">
                      {leave.requestedDays} day ({formatDuration(leave.duration)})
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-xs text-muted-foreground mb-1">Date Range</p>
                    <p className="font-medium">
                      {formatDate(leave.startDate)} – {formatDate(leave.endDate)}
                    </p>
                  </div>
                </div>

                {/* Reason provided by employee */}
                <div>
                  <p className="text-sm font-medium mb-1.5 text-muted-foreground">Reason for leave</p>
                  <div className="rounded-md bg-muted/50 p-3 text-sm text-foreground whitespace-pre-wrap">
                    {leave.reason?.trim() || <span className="italic text-muted-foreground">No reason provided.</span>}
                  </div>
                </div>

                {/* Review Details (if already processed) */}
                {leave.reviewedAt && (
                  <div>
                    <p className="text-sm font-medium mb-1.5 text-muted-foreground">
                      Admin Review Note <span className="text-xs font-normal ml-1">({formatDate(leave.reviewedAt)})</span>
                    </p>
                    <div className="rounded-md bg-muted/50 p-3 text-sm text-foreground whitespace-pre-wrap">
                      {leave.reviewNote?.trim() || <span className="italic text-muted-foreground">No note provided.</span>}
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <hr className="h-px bg-border" />
              <DialogFooter className="gap-2 -mt-2">
                {leave.status === "PENDING" ? (
                  <>
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => setRejectDialogOpen(true)}
                      className="w-full sm:w-auto"
                    >
                      <X className="mr-1.5 size-4" />
                      Reject
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setApproveDialogOpen(true)}
                      className="w-full sm:w-auto"
                    >
                      <Check className="mr-1.5 size-4" />
                      Approve
                    </Button>
                  </>
                ) : (
                  <Button
                    type="button"
                    variant="secondary"
                    onClick={() => onOpenChange(false)}
                    className="w-full sm:w-auto"
                  >
                    Close Window
                  </Button>
                )}
              </DialogFooter>
            </>
          ) : (
            <div className="py-10 text-center text-sm text-muted-foreground">
              Leave request not found.
            </div>
          )}
        </DialogContent>
      </Dialog>

      <ApproveLeaveDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        leaveId={leaveId}
        leaveSummary={leaveSummary}
      />

      <RejectLeaveDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        leaveId={leaveId}
        leaveSummary={leaveSummary}
      />
    </>
  );
}