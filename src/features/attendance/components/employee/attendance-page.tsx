"use client";

import { useState } from "react";
import {
  Calendar,
  MapPin,
  AlertCircle,
  Clock,
} from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useMyAttendanceHistory } from "@/features/attendance/hooks/use-attendance";
import {
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_COLORS,
} from "@/features/attendance/constants/attendance.constants";
import { getFirstDayOfCurrentMonth, getLastDayOfCurrentMonth, getTodayDate } from "@/lib/general";

function formatTime(dateStr: string | null): string {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatMinutes(minutes: number | null): string {
  if (minutes === null) return "-";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function EmployeeAttendancePage() {
  const [fromDate, setFromDate] = useState(getFirstDayOfCurrentMonth());
  const [toDate, setToDate] = useState(getLastDayOfCurrentMonth());
  const [selectedRecord, setSelectedRecord] = useState<string | null>(null);

  const { data: response, isLoading } = useMyAttendanceHistory({
    from: fromDate,
    to: toDate,
  });
  const records = response?.data;

  const selectedAttendance = records?.find((r) => r.id === selectedRecord);

  return (
    <main className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">My Attendance</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          View your attendance history
        </p>
      </div>

      {/* Date Filters */}
      <div className="flex flex-col gap-4 rounded-xl border p-4 md:flex-row md:items-end">
        <div>
          <label className="text-sm font-medium">From</label>
          <Input
            type="date"
            value={fromDate}
            max={toDate || getTodayDate()}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1"
          />
        </div>
        <div>
          <label className="text-sm font-medium">To</label>
          <Input
            type="date"
            value={toDate}
            min={fromDate}
            max={getTodayDate()}
            onChange={(e) => setToDate(e.target.value)}
            className="mt-1"
          />
        </div>
      </div>

      {/* Attendance Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Check In</TableHead>
                <TableHead>Check Out</TableHead>
                <TableHead>Late</TableHead>
                <TableHead>Total Hours</TableHead>
                <TableHead className="text-right">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Clock className="size-4 animate-pulse" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : records && records.length > 0 ? records.map((record) => (
                <TableRow
                  key={record.id}
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() =>
                    setSelectedRecord(
                      selectedRecord === record.id ? null : record.id,
                    )
                  }
                >
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="size-3.5 text-muted-foreground" />
                      {new Date(record.workDate).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={ATTENDANCE_STATUS_COLORS[record.status]}
                      className="gap-1"
                    >
                      {ATTENDANCE_STATUS_LABELS[record.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatTime(record.checkInAt)}</TableCell>
                  <TableCell>{formatTime(record.checkOutAt)}</TableCell>
                  <TableCell>
                    {record.isLate ? (
                      <span className="text-destructive font-medium">
                        +{record.lateMinutes}min
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    {formatMinutes(record.totalMinutes)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-xs">
                      View
                    </Button>
                  </TableCell>
                </TableRow>
              )) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No attendance records found for this period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedRecord}
        onOpenChange={(open) => !open && setSelectedRecord(null)}
      >
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Attendance Details</DialogTitle>
            <DialogDescription>
              {selectedAttendance
                ? new Date(selectedAttendance.workDate).toLocaleDateString(undefined, {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })
                : ""}
            </DialogDescription>
          </DialogHeader>

          {selectedAttendance && (
            <div className="space-y-4">
              {/* Status */}
              <div className="flex items-center gap-2">
                <Badge
                  variant={ATTENDANCE_STATUS_COLORS[selectedAttendance.status]}
                  className="gap-1"
                >
                  {ATTENDANCE_STATUS_LABELS[selectedAttendance.status]}
                </Badge>
                {selectedAttendance.isLate && (
                  <Badge variant="destructive" className="gap-1">
                    Late {selectedAttendance.lateMinutes}min
                  </Badge>
                )}
                {selectedAttendance.workModeSnapshot === "ON_FIELD" && (
                  <Badge variant="outline" className="gap-1">
                    <MapPin className="size-3" />
                    On Field
                  </Badge>
                )}
              </div>

              {/* Timing */}
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Check In</p>
                  <p className="font-semibold">
                    {formatTime(selectedAttendance.checkInAt)}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Check Out</p>
                  <p className="font-semibold">
                    {formatTime(selectedAttendance.checkOutAt)}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Total Hours</p>
                  <p className="font-semibold">
                    {formatMinutes(selectedAttendance.totalMinutes)}
                  </p>
                </div>
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Scheduled</p>
                  <p className="font-semibold">
                    {formatMinutes(selectedAttendance.scheduledMinutes)}
                  </p>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-3">
                {selectedAttendance.lateMinutes > 0 && (
                  <div className="rounded-lg border border-destructive/30 bg-destructive/5 p-3">
                    <p className="text-xs text-destructive">Late</p>
                    <p className="font-semibold text-destructive">
                      +{selectedAttendance.lateMinutes}min
                    </p>
                  </div>
                )}
                {selectedAttendance.earlyMinutes > 0 && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">Early In</p>
                    <p className="font-semibold">
                      {selectedAttendance.earlyMinutes}min
                    </p>
                  </div>
                )}
                {selectedAttendance.afterHoursMinutes > 0 && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">After Hours</p>
                    <p className="font-semibold">
                      {selectedAttendance.afterHoursMinutes}min
                    </p>
                  </div>
                )}
                {selectedAttendance.overtimeMinutes !== null &&
                  selectedAttendance.overtimeMinutes > 0 && (
                    <div className="rounded-lg border bg-green-500/10 p-3">
                      <p className="text-xs text-green-700 dark:text-green-400">
                        Overtime
                      </p>
                      <p className="font-semibold text-green-700 dark:text-green-400">
                        +{selectedAttendance.overtimeMinutes}min
                      </p>
                    </div>
                  )}
              </div>

              {/* Location info */}
              {selectedAttendance.workModeSnapshot === "ON_FIELD" &&
                (selectedAttendance.checkInDistanceMeters !== null ||
                  selectedAttendance.checkOutDistanceMeters !== null) && (
                  <div className="space-y-2 rounded-lg border p-3">
                    <p className="text-sm font-medium flex items-center gap-2">
                      <MapPin className="size-4" />
                      Location
                    </p>
                    {selectedAttendance.checkInDistanceMeters !== null && (
                      <p className="text-xs text-muted-foreground">
                        Check-in:{" "}
                        {Math.round(selectedAttendance.checkInDistanceMeters)}m from
                        office
                        {selectedAttendance.checkInAccuracyMeters !== null &&
                          ` (±${Math.round(selectedAttendance.checkInAccuracyMeters)}m accuracy)`}
                      </p>
                    )}
                    {selectedAttendance.checkOutDistanceMeters !== null && (
                      <p className="text-xs text-muted-foreground">
                        Check-out:{" "}
                        {Math.round(selectedAttendance.checkOutDistanceMeters)}m from
                        office
                        {selectedAttendance.checkOutAccuracyMeters !== null &&
                          ` (±${Math.round(selectedAttendance.checkOutAccuracyMeters)}m accuracy)`}
                      </p>
                    )}
                  </div>
                )}

              {/* Missing checkout warning */}
              {selectedAttendance.status === "MISSING_CHECKOUT" && (
                <div className="flex items-start gap-3 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900/50 dark:bg-amber-950/20 p-3">
                  <AlertCircle className="size-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium text-amber-900 dark:text-amber-200">
                      Missing Checkout
                    </p>
                    <p className="text-xs text-amber-700 dark:text-amber-400 mt-1">
                      This record was marked as missing checkout. An admin may
                      need to correct it.
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}
