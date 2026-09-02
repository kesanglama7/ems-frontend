"use client";

import { CalendarDays, FileText, User } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

import { useAdminLeaveDetail } from "../../hooks/use-admin-leaves";
import { LEAVE_STATUS_LABELS } from "../../constants/leave.constants";
import type { LeaveStatus } from "../../types/leave.types";

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function getStatusVariant(status: LeaveStatus) {
  switch (status) {
    case "PENDING":
      return "outline" as const;
    case "APPROVED":
      return "default" as const;
    case "REJECTED":
      return "destructive" as const;
    case "CANCELLED":
      return "secondary" as const;
  }
}

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
  const { data: response, isPending } = useAdminLeaveDetail(leaveId);
  const leave = response?.data;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Leave request details</DialogTitle>
          <DialogDescription>
            Full details for this leave request.
          </DialogDescription>
        </DialogHeader>

        {isPending ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : leave ? (
          <div className="space-y-4">
            {/* Employee info */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
                  <User className="size-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">
                    {leave.employee.firstName} {leave.employee.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {leave.employee.employeeCode}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {leave.employee.user.email}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {leave.employee.department.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Leave info */}
            <div className="rounded-lg border bg-muted/30 p-4">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
                  <CalendarDays className="size-5 text-muted-foreground" />
                </div>
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="truncate font-medium">
                    {leave.leaveType.name}
                  </p>
                  {leave.leaveType.description && (
                    <p className="text-sm text-muted-foreground">
                      {leave.leaveType.description}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground">
                    {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                  </p>
                </div>
              </div>
            </div>

            {/* Reason */}
            {leave.reason && (
              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg border bg-background">
                    <FileText className="size-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">Reason</p>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {leave.reason}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Status & Review */}
            <div className="rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium">Status</p>
                <Badge variant={getStatusVariant(leave.status)}>
                  {LEAVE_STATUS_LABELS[leave.status]}
                </Badge>
              </div>

              {leave.reviewedAt && (
                <div className="mt-3 space-y-1 border-t pt-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Reviewed at</span>
                    <span>{formatDate(leave.reviewedAt)}</span>
                  </div>
                  {leave.reviewNote && (
                    <div className="mt-2">
                      <p className="text-sm text-muted-foreground">
                        {leave.reviewNote}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
