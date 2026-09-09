"use client";

import { CalendarDays, LoaderCircle } from "lucide-react";
import { useConfirmDialogStore } from "@/stores/confirm-dialog.store";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { useMyLeaves, useCancelLeave } from "../../hooks/use-my-leaves";
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
      return "outline";
    case "APPROVED":
      return "default";
    case "REJECTED":
      return "destructive";
    case "CANCELLED":
      return "secondary";
    case "AUTO_REJECTED":
      return "destructive";
  }
}

function LeaveHistorySkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 5 }).map((_, index) => (
        <Skeleton key={index} className="h-16 w-full" />
      ))}
    </div>
  );
}

export function MyLeaveHistory() {
  const { data: leavesQuery, isPending } = useMyLeaves();
  const leaves = leavesQuery?.data ?? [];
  const cancelMutation = useCancelLeave();
  const confirm = useConfirmDialogStore((state) => state.confirm);

  if (isPending) {
    return <LeaveHistorySkeleton />;
  }

  if (leaves.length === 0) {
    return (
      <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
        <div className="bg-muted flex size-11 items-center justify-center rounded-full">
          <CalendarDays className="text-muted-foreground size-5" />
        </div>
        <h2 className="mt-4 font-medium">No leave requests yet</h2>
        <p className="text-muted-foreground mt-1 max-w-sm text-sm">
          Your leave history will appear here once you submit a request.
        </p>
      </div>
    );
  }

  function handleCancel(leaveId: string) {
    confirm({
      title: "Cancel leave request?",
      description:
        "This action cannot be undone. The leave request will be permanently cancelled.",
      confirmLabel: "Cancel request",
      destructive: true,
      onConfirm: async () => {
        await cancelMutation.mutateAsync(leaveId);
      },
    });
  }

  return (
    <>
      {/* Desktop */}
      <div className="hidden overflow-hidden rounded-lg border md:block">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Leave Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Days</TableHead><TableHead>Status</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead className="w-24">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaves.map((leave) => (
              <TableRow key={leave.id}>
                <TableCell className="font-medium">
                  {leave.leaveType.name}
                </TableCell>
                <TableCell>{formatDate(leave.startDate)}</TableCell>
                <TableCell>{formatDate(leave.endDate)}</TableCell>
                <TableCell>{leave.requestedDays} · {leave.duration === "FULL_DAY" ? "Full" : leave.duration === "FIRST_HALF" ? "First half" : "Second half"}</TableCell>
                <TableCell>
                  <Badge variant={getStatusVariant(leave.status)}>
                    {LEAVE_STATUS_LABELS[leave.status]}
                  </Badge>
                </TableCell>
                <TableCell className="max-w-sm">
                  <p className="text-muted-foreground truncate">
                    {leave.reason || "—"}
                  </p>
                </TableCell>
                <TableCell>
                  {leave.status === "PENDING" && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      className="text-destructive hover:text-destructive"
                      disabled={cancelMutation.isPending}
                      onClick={() => handleCancel(leave.id)}
                    >
                      {cancelMutation.isPending ? (
                        <LoaderCircle className="size-4 animate-spin" />
                      ) : (
                        "Cancel"
                      )}
                    </Button>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Mobile */}
      <div className="grid gap-3 md:hidden">
        {leaves.map((leave) => (
          <div key={leave.id} className="rounded-lg border p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate font-medium">{leave.leaveType.name}</p>
                <p className="text-muted-foreground mt-0.5 text-xs">
                  {formatDate(leave.startDate)} - {formatDate(leave.endDate)}
                </p>
              </div>
              <Badge variant={getStatusVariant(leave.status)}>
                {LEAVE_STATUS_LABELS[leave.status]}
              </Badge>
            </div>
            <p className="text-muted-foreground mt-2 line-clamp-3 text-sm">
              {leave.reason || "No reason provided."}
            </p>
            {leave.status === "PENDING" && (
              <div className="mt-4">
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  className="text-destructive hover:text-destructive"
                  disabled={cancelMutation.isPending}
                  onClick={() => handleCancel(leave.id)}
                >
                  {cancelMutation.isPending ? (
                    <LoaderCircle className="size-4 animate-spin" />
                  ) : (
                    "Cancel"
                  )}
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>
    </>
  );
}
