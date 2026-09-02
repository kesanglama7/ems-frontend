"use client";

import { useState } from "react";
import { useEmployeeAttendanceHistory } from "@/features/attendance/hooks/use-attendance";
import { useEmployee } from "@/features/employees/hooks/use-employee";
import { useParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getFirstDayOfCurrentMonth, getLastDayOfCurrentMonth, getTodayDate } from "@/lib/general";


export default function AdminEmployeeAttendancePage() {
  const params = useParams();
  const employeeId = params.employeeId as string;

  const [fromDate, setFromDate] = useState(getFirstDayOfCurrentMonth());
  const [toDate, setToDate] = useState(getLastDayOfCurrentMonth());

  const { data: employeeResponse, isLoading: isEmployeeLoading } = useEmployee(employeeId);
  const employee = employeeResponse?.data;

  const { data: response, isLoading } = useEmployeeAttendanceHistory(employeeId, {
    from: fromDate,
    to: toDate,
  });
  const records = response?.data?.attendance ?? [];

  const employeeName = employee
    ? `${employee.firstName} ${employee.lastName}`
    : "Loading...";

  return (
    <main className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">
          Employee Attendance
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Attendance history for <span className='font-bold'>{isEmployeeLoading ? "employee..." : employeeName}</span>
        </p>
      </div>

      <div className="flex flex-col gap-4 rounded-xl border p-4 md:flex-row">
        <div>
          <label className="text-sm font-medium">From</label>
          <Input
            type="date"
            value={fromDate}
            max={getTodayDate()}
            onChange={(e) => setFromDate(e.target.value)}
            className="mt-1"
          />
        </div>
        <div >
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

      <div className="rounded-xl border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Check In</TableHead>
              <TableHead>Check Out</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Hours</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Loading...
                </TableCell>
              </TableRow>
            ) : records && records.length > 0 ? records.map((record) => (
              <TableRow key={record.id}>
                <TableCell>{new Date(record.workDate).toLocaleDateString()}</TableCell>
                <TableCell>{record.checkInAt ? new Date(record.checkInAt).toLocaleTimeString() : '-'}</TableCell>
                <TableCell>{record.checkOutAt ? new Date(record.checkOutAt).toLocaleTimeString() : '-'}</TableCell>
                <TableCell>{record.isLate ? 'Late' : 'Present'}</TableCell>
                <TableCell>{record.totalMinutes ? Math.round(record.totalMinutes / 60 * 10) / 10 : '-'}</TableCell>
              </TableRow>
            )) : (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No records found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </main>
  );
}
