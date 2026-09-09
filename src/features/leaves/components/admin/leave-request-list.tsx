"use client";

import { useState } from "react";
import { CalendarDays, Eye} from "lucide-react";

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

import { useAdminLeaves} from "../../hooks/use-admin-leaves";
import { LEAVE_STATUS_LABELS } from "../../constants/leave.constants";
import type { AdminLeaveQueryParams, LeaveStatus } from "../../types/leave.types";
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
    case "AUTO_REJECTED":
      return "destructive" as const;
  }
}

interface LeaveRequestListProps {
  filters: AdminLeaveQueryParams;
}

export function LeaveRequestList({ filters }: LeaveRequestListProps) {
  const { data: response, isLoading } = useAdminLeaves(filters);
  const leaves = response?.data ?? [];

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
              <TableHead>Days</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-24">
                Actions
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
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
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
                  <TableCell>{leave.requestedDays} ({leave.duration === "FULL_DAY" ? "full" : leave.duration === "FIRST_HALF" ? "first half" : "second half"})</TableCell>
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
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} className="h-64 text-center text-muted-foreground">
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
      <LeaveRequestDetailDialog
        open={detailDialogOpen}
        onOpenChange={setDetailDialogOpen}
        leaveId={selectedLeaveId}
      />
    </>
  );
}
