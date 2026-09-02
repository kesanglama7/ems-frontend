"use client";

import { useState } from "react";
import { CalendarDays, Check, Eye, X } from "lucide-react";

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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getInitials } from "@/lib/name-shorten";

import { useAdminLeaves } from "../../hooks/use-admin-leaves";
import { LEAVE_STATUS_LABELS } from "../../constants/leave.constants";
import type { AdminLeaveQueryParams, LeaveStatus } from "../../types/leave.types";
import { ApproveLeaveDialog } from "./approve-leave-dialog";
import { RejectLeaveDialog } from "./reject-leave-dialog";
import { LeaveRequestDetailDialog } from "./leave-request-detail-dialog";

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

interface LeaveRequestListProps {
  filters: AdminLeaveQueryParams;
}

export function LeaveRequestList({ filters }: LeaveRequestListProps) {
  const { data: response, isLoading } = useAdminLeaves(filters);
  const leaves = response?.data ?? [];

  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);
  const [selectedLeaveId, setSelectedLeaveId] = useState<string>("");

  function getLeaveSummary(leave: (typeof leaves)[number]) {
    const employeeName = `${leave.employee.firstName} ${leave.employee.lastName}`;
    return {
      employeeName,
      leaveType: leave.leaveType.name,
      startDate: formatDate(leave.startDate),
      endDate: formatDate(leave.endDate),
    };
  }

  function handleApprove(leaveId: string) {
    setSelectedLeaveId(leaveId);
    setApproveDialogOpen(true);
  }

  function handleReject(leaveId: string) {
    setSelectedLeaveId(leaveId);
    setRejectDialogOpen(true);
  }

  function handleViewDetail(leaveId: string) {
    setSelectedLeaveId(leaveId);
    setDetailDialogOpen(true);
  }

  // Find the selected leave for summary info
  const selectedLeave = leaves.find((l) => l.id === selectedLeaveId);
  const leaveSummary = selectedLeave
    ? getLeaveSummary(selectedLeave)
    : { employeeName: "", leaveType: "", startDate: "", endDate: "" };

  return (
    <>
      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Employee</TableHead>
              <TableHead>Leave Type</TableHead>
              <TableHead>Start Date</TableHead>
              <TableHead>End Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <Skeleton className="h-10 w-32" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-5 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-20" />
                  </TableCell>
                </TableRow>
              ))
            ) : leaves.length > 0 ? (
              leaves.map((leave) => (
                <TableRow key={leave.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="size-9">
                        <AvatarFallback className="text-sm">
                          {getInitials(
                            leave.employee.firstName,
                            leave.employee.lastName,
                          )}
                        </AvatarFallback>
                        {leave.employee.user && (
                          <AvatarImage
                            src={`/api/avatar/${leave.employee.id}`}
                          />
                        )}
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {leave.employee.firstName} {leave.employee.lastName}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {leave.employee.employeeCode}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    {leave.leaveType.name}
                  </TableCell>
                  <TableCell>{formatDate(leave.startDate)}</TableCell>
                  <TableCell>{formatDate(leave.endDate)}</TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(leave.status)}>
                      {LEAVE_STATUS_LABELS[leave.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => handleViewDetail(leave.id)}
                        title="View details"
                      >
                        <Eye className="size-4" />
                      </Button>
                      {leave.status === "PENDING" && (
                        <>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-950"
                            onClick={() => handleApprove(leave.id)}
                            title="Approve"
                          >
                            <Check className="size-4" />
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => handleReject(leave.id)}
                            title="Reject"
                          >
                            <X className="size-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="h-64 text-center text-muted-foreground">
                  <div className="flex flex-col items-center justify-center">
                    <div className="bg-muted flex size-11 items-center justify-center rounded-full">
                      <CalendarDays className="text-muted-foreground size-5" />
                    </div>
                    <h2 className="mt-4 font-medium text-foreground">No leave requests found</h2>
                    <p className="mt-1 max-w-sm text-sm">
                      No leave requests match the current filters.
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <ApproveLeaveDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        leaveId={selectedLeaveId}
        leaveSummary={leaveSummary}
      />

      <RejectLeaveDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        leaveId={selectedLeaveId}
        leaveSummary={leaveSummary}
      />

      <LeaveRequestDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        leaveId={selectedLeaveId}
      />
    </>
  );
}
