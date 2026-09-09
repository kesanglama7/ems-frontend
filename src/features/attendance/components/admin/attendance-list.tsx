"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  CalendarDays,
  Eye,
  MapPin,
  Pencil,
  Plus,
  Search,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Portal } from "@/components/ui/portal";

import { getInitials } from "@/lib/name-shorten";
import {
    formatMinutes,
    formatTime,
  getFirstDayOfCurrentMonth,
  getLastDayOfCurrentMonth,
  getTodayDate,
} from "@/lib/general";

import { useEmployeesInfinite } from "@/features/employees/hooks/use-employees-infinite";
import { useDepartments } from "@/features/departments/hooks/use-departments";

import {
  useAdminAttendance,
  useAdminAttendanceDetail,
} from "@/features/attendance/hooks/use-attendance";

import {
  ATTENDANCE_STATUS_LABELS,
  ATTENDANCE_STATUS_COLORS,
} from "@/features/attendance/constants/attendance.constants";

import {
  CreateAttendanceDialog,
  CorrectAttendanceDialog,
} from "./attendance-dialogs";

import type { AttendanceRecord } from "@/features/attendance/types/attendance.types";


export default function AdminAttendanceLists() {
  // ---------------------------------------------------------------------------
  // Filters
  // ---------------------------------------------------------------------------

  const [fromDate, setFromDate] = useState(
    getFirstDayOfCurrentMonth(),
  );

  const [toDate, setToDate] = useState(
    getLastDayOfCurrentMonth(),
  );

  const [lateFilter, setLateFilter] = useState("ALL");

  const [statusFilter, setStatusFilter] =
    useState<string>("ALL");

  const [workModeFilter, setWorkModeFilter] =
    useState<string>("ALL");

  const [employeeFilter, setEmployeeFilter] =
    useState("ALL");

  const [departmentFilter, setDepartmentFilter] =
    useState("ALL");

  // ---------------------------------------------------------------------------
  // Employee dropdown
  // ---------------------------------------------------------------------------

  const [employeeSearch, setEmployeeSearch] =
    useState("");

  const [isEmployeeOpen, setIsEmployeeOpen] =
    useState(false);

  const employeeTriggerRef =
    useRef<HTMLButtonElement>(null);

  const employeeDropdownRef =
    useRef<HTMLDivElement>(null);

  const scrollRef =
    useRef<HTMLDivElement>(null);

  const [dropdownRect, setDropdownRect] =
    useState<DOMRect | null>(null);

  // ---------------------------------------------------------------------------
  // Dialog states
  // ---------------------------------------------------------------------------

  const [showCreateDialog, setShowCreateDialog] =
    useState(false);

  const [
    showCorrectDialog,
    setShowCorrectDialog,
  ] = useState<{
    open: boolean;
    attendanceId: string;
    checkInAt?: string;
    checkOutAt?: string;
  } | null>(null);

  const [
    selectedAttendanceId,
    setSelectedAttendanceId,
  ] = useState<string | null>(null);

  const [
    showDetailDialog,
    setShowDetailDialog,
  ] = useState(false);

  // ---------------------------------------------------------------------------
  // Employees
  // ---------------------------------------------------------------------------

  const {
    data: employeesPages,
    isPending: isEmployeesPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useEmployeesInfinite({
    search: employeeSearch || undefined,
    limit: 20,
  });

  const allEmployees = useMemo(
    () =>
      employeesPages?.pages.flatMap(
        (page) => page.data,
      ) ?? [],
    [employeesPages],
  );

  // ---------------------------------------------------------------------------
  // Departments
  // ---------------------------------------------------------------------------

  const {
    data: departmentsResponse,
    isPending: isDepartmentsPending,
  } = useDepartments();

  // ---------------------------------------------------------------------------
  // Select Items
  // ---------------------------------------------------------------------------

  const lateStatusItems = useMemo(
    () => [
      {
        label: "All",
        value: "ALL",
      },
      {
        label: "Late",
        value: "true",
      },
      {
        label: "On Time",
        value: "false",
      },
    ],
    [],
  );

  const statusItems = useMemo(
    () => [
      {
        label: "All Statuses",
        value: "ALL",
      },
      {
        label: "Open",
        value: "OPEN",
      },
      {
        label: "Completed",
        value: "COMPLETED",
      },
      {
        label: "Missing Checkout",
        value: "MISSING_CHECKOUT",
      },
    ],
    [],
  );

  const workModeItems = useMemo(
    () => [
      {
        label: "All Modes",
        value: "ALL",
      },
      {
        label: "On Field",
        value: "ON_FIELD",
      },
      {
        label: "Remote",
        value: "REMOTE",
      },
    ],
    [],
  );

  const departmentItems = useMemo(
    () => [
      {
        label: "All Departments",
        value: "ALL",
      },
      ...(departmentsResponse?.data ?? []).map(
        (department) => ({
          label: department.isActive
            ? department.name
            : `${department.name} (Inactive)`,
          value: department.id,
        }),
      ),
    ],
    [departmentsResponse?.data],
  );

  // ---------------------------------------------------------------------------
  // Attendance
  // ---------------------------------------------------------------------------

  const {
    data: response,
    isLoading,
  } = useAdminAttendance({
    from: fromDate,
    to: toDate,

    isLate:
      lateFilter === "ALL"
        ? undefined
        : lateFilter === "true",

    status:
      statusFilter === "ALL"
        ? undefined
        : (statusFilter as any),

    workMode:
      workModeFilter === "ALL"
        ? undefined
        : (workModeFilter as any),

    employeeId:
      employeeFilter === "ALL"
        ? undefined
        : employeeFilter,

    departmentId:
      departmentFilter === "ALL"
        ? undefined
        : departmentFilter,
  });

  const records = response?.data;

  // ---------------------------------------------------------------------------
  // Attendance Detail
  // ---------------------------------------------------------------------------

  const {
    data: detailData,
    isLoading: isDetailLoading,
  } = useAdminAttendanceDetail(
    selectedAttendanceId ?? "",
  );

  // ---------------------------------------------------------------------------
  // Selected Employee
  // ---------------------------------------------------------------------------

  const selectedEmployeeLabel = useMemo(() => {
    if (employeeFilter === "ALL") {
      return null;
    }

    const employee = allEmployees.find(
      (item) => item.id === employeeFilter,
    );

    if (!employee) {
      return null;
    }

    return `${employee.firstName} ${employee.lastName}`;
  }, [employeeFilter, allEmployees]);

  // ---------------------------------------------------------------------------
  // Employee Dropdown Position
  // ---------------------------------------------------------------------------

  const updateDropdownPosition =
    useCallback(() => {
      if (!employeeTriggerRef.current) {
        return;
      }

      setDropdownRect(
        employeeTriggerRef.current.getBoundingClientRect(),
      );
    }, []);

  useEffect(() => {
    if (!isEmployeeOpen) {
      return;
    }

    updateDropdownPosition();

    window.addEventListener(
      "resize",
      updateDropdownPosition,
    );

    window.addEventListener(
      "scroll",
      updateDropdownPosition,
      true,
    );

    return () => {
      window.removeEventListener(
        "resize",
        updateDropdownPosition,
      );

      window.removeEventListener(
        "scroll",
        updateDropdownPosition,
        true,
      );
    };
  }, [
    isEmployeeOpen,
    updateDropdownPosition,
  ]);

  // ---------------------------------------------------------------------------
  // Employee Outside Click
  // ---------------------------------------------------------------------------

  useEffect(() => {
    if (!isEmployeeOpen) {
      return;
    }

    const handleOutsideClick = (
      event: MouseEvent,
    ) => {
      const target = event.target as Node;

      const clickedTrigger =
        employeeTriggerRef.current?.contains(
          target,
        );

      const clickedDropdown =
        employeeDropdownRef.current?.contains(
          target,
        );

      if (
        !clickedTrigger &&
        !clickedDropdown
      ) {
        setIsEmployeeOpen(false);
        setEmployeeSearch("");
      }
    };

    document.addEventListener(
      "mousedown",
      handleOutsideClick,
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleOutsideClick,
      );
    };
  }, [isEmployeeOpen]);

  // ---------------------------------------------------------------------------
  // Employee Infinite Scroll
  // ---------------------------------------------------------------------------

  const handleScroll =
    useCallback(() => {
      if (!scrollRef.current) {
        return;
      }

      const {
        scrollTop,
        scrollHeight,
        clientHeight,
      } = scrollRef.current;

      const isNearBottom =
        scrollHeight - scrollTop <=
        clientHeight + 50;

      if (
        isNearBottom &&
        hasNextPage &&
        !isFetchingNextPage
      ) {
        fetchNextPage();
      }
    }, [
      hasNextPage,
      isFetchingNextPage,
      fetchNextPage,
    ]);

  // ---------------------------------------------------------------------------
  // Employee Handlers
  // ---------------------------------------------------------------------------

  function handleEmployeeSelect(
    value: string,
  ) {
    setEmployeeFilter(value);
    setIsEmployeeOpen(false);
    setEmployeeSearch("");
  }

  function handleEmployeeClear() {
    setEmployeeFilter("ALL");
    setEmployeeSearch("");
    setIsEmployeeOpen(false);
  }

  // ---------------------------------------------------------------------------
  // Attendance Handlers
  // ---------------------------------------------------------------------------

  function handleOpenDetail(
    attendanceId: string,
  ) {
    setSelectedAttendanceId(
      attendanceId,
    );

    setShowDetailDialog(true);
  }

  function handleOpenCorrect(
    record: AttendanceRecord,
  ) {
    setShowCorrectDialog({
      open: true,
      attendanceId: record.id,
      checkInAt:
        record.checkInAt ?? undefined,
      checkOutAt:
        record.checkOutAt ?? undefined,
    });
  }

  return (
    <main className="flex flex-1 flex-col gap-4">
      {/* Header */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Attendance Management
          </h1>

          <p className="mt-1 text-sm text-muted-foreground">
            View and manage employee attendance records
          </p>
        </div>

        <Button
          onClick={() =>
            setShowCreateDialog(true)
          }
        >
          <Plus className="size-4" />
          Create Attendance
        </Button>
      </div>

      {/* Filters */}

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col gap-4 rounded-lg md:flex-row md:items-end">
            {/* From */}

            <div className="flex-1">
              <label className="text-sm font-medium">
                From
              </label>

              <Input
                type="date"
                value={fromDate}
                max={
                  toDate ||
                  getTodayDate()
                }
                onChange={(event) =>
                  setFromDate(
                    event.target.value,
                  )
                }
                className="mt-1"
              />
            </div>

            {/* To */}

            <div className="flex-1">
              <label className="text-sm font-medium">
                To
              </label>

              <Input
                type="date"
                value={toDate}
                min={fromDate}
                max={getTodayDate()}
                onChange={(event) =>
                  setToDate(
                    event.target.value,
                  )
                }
                className="mt-1"
              />
            </div>

            {/* Status */}

            <div className="flex-1">
              <label className="text-sm font-medium">
                Status
              </label>

              <Select
                items={statusItems}
                value={statusFilter}
                onValueChange={(value) => {
                  if (!value) return;

                  setStatusFilter(value);
                }}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>

                <SelectContent>
                  {statusItems.map(
                    (item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Late Status */}

            <div className="flex-1">
              <label className="text-sm font-medium">
                Late Status
              </label>

              <Select
                items={lateStatusItems}
                value={lateFilter}
                onValueChange={(value) => {
                  if (!value) return;

                  setLateFilter(value);
                }}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="All" />
                </SelectTrigger>

                <SelectContent>
                  {lateStatusItems.map(
                    (item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Work Mode */}

            <div className="flex-1">
              <label className="text-sm font-medium">
                Work Mode
              </label>

              <Select
                items={workModeItems}
                value={workModeFilter}
                onValueChange={(value) => {
                  if (!value) return;

                  setWorkModeFilter(value);
                }}
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="All modes" />
                </SelectTrigger>

                <SelectContent>
                  {workModeItems.map(
                    (item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Department */}

            <div className="flex-1">
              <label className="text-sm font-medium">
                Department
              </label>

              <Select
                items={departmentItems}
                value={departmentFilter}
                onValueChange={(value) => {
                  if (!value) return;

                  setDepartmentFilter(value);
                }}
                disabled={
                  isDepartmentsPending
                }
              >
                <SelectTrigger className="mt-1 w-full">
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>

                <SelectContent>
                  {departmentItems.map(
                    (item) => (
                      <SelectItem
                        key={item.value}
                        value={item.value}
                      >
                        {item.label}
                      </SelectItem>
                    ),
                  )}
                </SelectContent>
              </Select>
            </div>

            {/* Employee */}

            <div className="flex-1">
              <label className="text-sm font-medium">
                Employee
              </label>

              <div className="relative mt-1">
                <button
                  ref={
                    employeeTriggerRef
                  }
                  type="button"
                  onClick={() =>
                    setIsEmployeeOpen(
                      (previous) =>
                        !previous,
                    )
                  }
                  className="flex h-9 w-full items-center justify-between gap-1.5 rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
                >
                  {selectedEmployeeLabel ? (
                    <span className="truncate">
                      {
                        selectedEmployeeLabel
                      }
                    </span>
                  ) : (
                    <span className="text-muted-foreground">
                      All employees
                    </span>
                  )}

                  <svg
                    className="size-4 shrink-0 text-muted-foreground"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="m6 9 6 6 6-6" />
                  </svg>
                </button>

                {isEmployeeOpen &&
                  dropdownRect && (
                    <Portal>
                      <div
                        ref={
                          employeeDropdownRef
                        }
                        className="fixed z-50 rounded-md border bg-popover text-popover-foreground shadow-md"
                        style={{
                          left:
                            dropdownRect.left,
                          top:
                            dropdownRect.bottom +
                            4,
                          width:
                            dropdownRect.width,
                        }}
                      >
                        {/* Search */}

                        <div className="flex items-center gap-2 border-b px-3 py-2">
                          <Search className="size-4 shrink-0 text-muted-foreground" />

                          <input
                            type="text"
                            placeholder="Search by name or code..."
                            value={
                              employeeSearch
                            }
                            onChange={(
                              event,
                            ) =>
                              setEmployeeSearch(
                                event.target
                                  .value,
                              )
                            }
                            className="flex h-8 w-full rounded-md bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                            autoFocus
                          />

                          {employeeFilter !==
                            "ALL" && (
                            <button
                              type="button"
                              onClick={
                                handleEmployeeClear
                              }
                              className="shrink-0 text-xs text-muted-foreground hover:text-foreground"
                            >
                              Clear
                            </button>
                          )}
                        </div>

                        {/* Employees */}

                        <div
                          ref={scrollRef}
                          onScroll={
                            handleScroll
                          }
                          className="max-h-60 overflow-y-auto p-1"
                        >
                          <button
                            type="button"
                            onClick={() =>
                              handleEmployeeSelect(
                                "ALL",
                              )
                            }
                            className={`flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                              employeeFilter ===
                              "ALL"
                                ? "bg-accent text-accent-foreground"
                                : ""
                            }`}
                          >
                            All employees
                          </button>

                          {isEmployeesPending ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              Loading...
                            </div>
                          ) : allEmployees.length ===
                            0 ? (
                            <div className="px-2 py-1.5 text-sm text-muted-foreground">
                              No employees
                              found
                            </div>
                          ) : (
                            allEmployees.map(
                              (
                                employee,
                              ) => (
                                <button
                                  key={
                                    employee.id
                                  }
                                  type="button"
                                  onClick={() =>
                                    handleEmployeeSelect(
                                      employee.id,
                                    )
                                  }
                                  className={`flex w-full items-center justify-between rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground ${
                                    employeeFilter ===
                                    employee.id
                                      ? "bg-accent text-accent-foreground"
                                      : ""
                                  }`}
                                >
                                  <div className="flex min-w-0 items-center gap-2">
                                    <Avatar className="size-7">
                                      <AvatarFallback className="text-xs">
                                        {getInitials(
                                          employee.firstName,
                                          employee.lastName,
                                        )}
                                      </AvatarFallback>
                                    </Avatar>

                                    <span className="truncate">
                                      {
                                        employee.firstName
                                      }{" "}
                                      {
                                        employee.lastName
                                      }
                                    </span>
                                  </div>
                                </button>
                              ),
                            )
                          )}

                          {isFetchingNextPage && (
                            <div className="px-2 py-1.5 text-center text-sm text-muted-foreground">
                              Loading
                              more...
                            </div>
                          )}
                        </div>
                      </div>
                    </Portal>
                  )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Attendance Table */}

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  Employee
                </TableHead>

                <TableHead>
                  Date
                </TableHead>

                <TableHead>
                  Status
                </TableHead>

                <TableHead>
                  Check In
                </TableHead>

                <TableHead>
                  Check Out
                </TableHead>

                <TableHead>
                  Late
                </TableHead>

                <TableHead>
                  Total Hours
                </TableHead>

                <TableHead>
                  Location
                </TableHead>

                <TableHead className="text-right">
                  Actions
                </TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-8 text-center"
                  >
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <CalendarDays className="size-4 animate-pulse" />
                      Loading...
                    </div>
                  </TableCell>
                </TableRow>
              ) : records &&
                records.length > 0 ? (
                records.map(
                  (record) => (
                    <TableRow
                      key={record.id}
                    >
                      <TableCell>
                        <div>
                          <p className="font-medium">
                            {
                              record
                                .employee
                                ?.firstName
                            }{" "}
                            {
                              record
                                .employee
                                ?.lastName
                            }
                          </p>

                          <p className="text-xs text-muted-foreground">
                            {
                              record
                                .employee
                                ?.employeeCode
                            }

                            {record
                              .employee
                              ?.department &&
                              ` · ${record.employee.department.name}`}
                          </p>
                        </div>
                      </TableCell>

                      <TableCell>
                        {new Date(
                          record.workDate,
                        ).toLocaleDateString()}
                      </TableCell>

                      <TableCell>
                        <Badge
                          variant={
                            ATTENDANCE_STATUS_COLORS[
                              record.status
                            ]
                          }
                          className="gap-1"
                        >
                          {
                            ATTENDANCE_STATUS_LABELS[
                              record.status
                            ]
                          }
                        </Badge>
                      </TableCell>

                      <TableCell>
                        {formatTime(
                          record.checkInAt,
                        )}
                      </TableCell>

                      <TableCell>
                        {formatTime(
                          record.checkOutAt,
                        )}
                      </TableCell>

                      <TableCell>
                        {record.isLate ? (
                          <span className="font-medium text-destructive">
                            +
                            {
                              formatMinutes(record.lateMinutes)
                            }
                          </span>
                        ) : (
                          <span className="text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>

                      <TableCell>
                        {formatMinutes(
                          record.totalMinutes,
                        )}
                      </TableCell>

                      <TableCell>
                        {record.workModeSnapshot ===
                          "ON_FIELD" &&
                        record.checkInDistanceMeters !==
                          null ? (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="size-3" />

                            {Math.round(
                              record.checkInDistanceMeters,
                            )}
                            m
                          </span>
                        ) : record.workModeSnapshot ===
                          "REMOTE" ? (
                          <Badge
                            variant="outline"
                            className="text-xs"
                          >
                            Remote
                          </Badge>
                        ) : (
                          <span className="text-muted-foreground">
                            -
                          </span>
                        )}
                      </TableCell>

                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleOpenDetail(
                                record.id,
                              )
                            }
                            title="View details"
                          >
                            <Eye className="size-4" />
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              handleOpenCorrect(
                                record,
                              )
                            }
                            title="Correct attendance"
                            disabled={
                              record.source ===
                              "ADMIN"
                            }
                          >
                            <Pencil className="size-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ),
                )
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={9}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No attendance records
                    found for this period.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Create Dialog */}

      <CreateAttendanceDialog
        open={showCreateDialog}
        onOpenChange={
          setShowCreateDialog
        }
        onSuccess={() => {}}
      />

      {/* Correct Dialog */}

      {showCorrectDialog && (
        <CorrectAttendanceDialog
          open={
            showCorrectDialog.open
          }
          onOpenChange={(open) => {
            if (!open) {
              setShowCorrectDialog(
                null,
              );
            }
          }}
          attendanceId={
            showCorrectDialog.attendanceId
          }
          defaultCheckInAt={
            showCorrectDialog.checkInAt
          }
          defaultCheckOutAt={
            showCorrectDialog.checkOutAt
          }
          onSuccess={() =>
            setShowCorrectDialog(null)
          }
        />
      )}

      {/* Detail Dialog */}

      <Dialog
        open={showDetailDialog}
        onOpenChange={(open) => {
          setShowDetailDialog(open);

          if (!open) {
            setSelectedAttendanceId(
              null,
            );
          }
        }}
      >
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Attendance Details
            </DialogTitle>

            <DialogDescription>
              {detailData?.data &&
                new Date(
                  detailData.data
                    .workDate,
                ).toLocaleDateString(
                  undefined,
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  },
                )}
            </DialogDescription>
          </DialogHeader>

          {isDetailLoading ? (
            <div className="flex items-center justify-center py-12">
              <div className="flex items-center gap-2 text-muted-foreground">
                <CalendarDays className="size-4 animate-pulse" />
                Loading details...
              </div>
            </div>
          ) : detailData?.data ? (
            <div className="space-y-5">
              {/* Employee Info */}

              <div className="rounded-lg border bg-muted/30 p-4">
                <div className="flex items-center gap-3">
                  <Avatar className="size-10">
                    <AvatarFallback>
                      {getInitials(
                        detailData.data
                          .employee
                          .firstName,
                        detailData.data
                          .employee
                          .lastName,
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div>
                    <p className="font-semibold">
                      {
                        detailData.data
                          .employee
                          .firstName
                      }{" "}
                      {
                        detailData.data
                          .employee
                          .lastName
                      }
                    </p>

                    <p className="text-sm text-muted-foreground">
                      {
                        detailData.data
                          .employee
                          .employeeCode
                      }

                      {detailData.data
                        .employee
                        .jobTitle &&
                        ` · ${detailData.data.employee.jobTitle}`}
                    </p>

                    <p className="text-xs text-muted-foreground">
                      {
                        detailData.data
                          .employee
                          .department?.name
                      }{" "}
                      ·{" "}
                      {
                        detailData.data
                          .employee.user
                          .email
                      }
                    </p>
                  </div>
                </div>
              </div>

              {/* Status */}

              <div className="flex flex-wrap gap-2">
                <Badge
                  variant={
                    ATTENDANCE_STATUS_COLORS[
                      detailData.data
                        .status
                    ]
                  }
                >
                  {
                    ATTENDANCE_STATUS_LABELS[
                      detailData.data
                        .status
                    ]
                  }
                </Badge>

                <Badge variant="outline">
                  Source:{" "}
                  {
                    detailData.data
                      .source
                  }
                </Badge>

                {detailData.data
                  .workModeSnapshot ===
                  "ON_FIELD" && (
                  <Badge variant="outline">
                    <MapPin className="mr-1 size-3" />
                    On Field
                  </Badge>
                )}

                {detailData.data
                  .isLate && (
                  <Badge variant="destructive">
                    Late{" "}
                    {
                      formatMinutes(detailData.data
                        .lateMinutes)
                    }
                  </Badge>
                )}
              </div>

              {/* Timing */}

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">
                    Check In
                  </p>

                  <p className="font-semibold">
                    {formatTime(
                      detailData.data
                        .checkInAt,
                    )}
                  </p>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">
                    Check Out
                  </p>

                  <p className="font-semibold">
                    {formatTime(
                      detailData.data
                        .checkOutAt,
                    )}
                  </p>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">
                    Total Hours
                  </p>

                  <p className="font-semibold">
                    {formatMinutes(
                      detailData.data
                        .totalMinutes,
                    )}
                  </p>
                </div>

                <div className="rounded-lg border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">
                    Scheduled
                  </p>

                  <p className="font-semibold">
                    {formatMinutes(
                      detailData.data
                        .scheduledMinutes,
                    )}
                  </p>
                </div>
              </div>

              {/* Additional Metrics */}

              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {detailData.data
                  .earlyMinutes > 0 && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">
                      Early In
                    </p>

                    <p className="font-semibold">
                      {formatMinutes(
                        detailData.data
                          .earlyMinutes
                      )}
                    </p>
                  </div>
                )}

                {detailData.data
                  .afterHoursMinutes >
                  0 && (
                  <div className="rounded-lg border bg-muted/30 p-3">
                    <p className="text-xs text-muted-foreground">
                      After Hours
                    </p>

                    <p className="font-semibold">
                      {
                        formatMinutes(
                          detailData.data
                            .afterHoursMinutes
                        )
                      }
                    </p>
                  </div>
                )}

                {detailData.data
                  .overtimeMinutes !==
                  null &&
                  detailData.data
                    .overtimeMinutes >
                    0 && (
                    <div className="rounded-lg border bg-green-500/10 p-3">
                      <p className="text-xs text-green-700 dark:text-green-400">
                        Overtime
                      </p>

                      <p className="font-semibold text-green-700 dark:text-green-400">
                        +
                        {
                          formatMinutes(
                            detailData
                              .data
                              .overtimeMinutes
                          )
                        }
                      </p>
                    </div>
                  )}
              </div>

              {/* Location */}

              {detailData.data
                .workModeSnapshot ===
                "ON_FIELD" &&
                (detailData.data
                  .checkInDistanceMeters !==
                  null ||
                  detailData.data
                    .checkOutDistanceMeters !==
                    null) && (
                  <div className="space-y-2 rounded-lg border p-3">
                    <p className="flex items-center gap-2 text-sm font-medium">
                      <MapPin className="size-4" />
                      Location
                    </p>

                    {detailData.data
                      .checkInDistanceMeters !==
                      null && (
                      <p className="text-xs text-muted-foreground">
                        Check-in:{" "}
                        {Math.round(
                          detailData.data
                            .checkInDistanceMeters,
                        )}
                        m from office

                        {detailData.data
                          .checkInAccuracyMeters !==
                          null &&
                          ` (±${Math.round(
                            detailData.data
                              .checkInAccuracyMeters,
                          )}m)`}
                      </p>
                    )}

                    {detailData.data
                      .checkOutDistanceMeters !==
                      null && (
                      <p className="text-xs text-muted-foreground">
                        Check-out:{" "}
                        {Math.round(
                          detailData.data
                            .checkOutDistanceMeters,
                        )}
                        m from office

                        {detailData.data
                          .checkOutAccuracyMeters !==
                          null &&
                          ` (±${Math.round(
                            detailData.data
                              .checkOutAccuracyMeters,
                          )}m)`}
                      </p>
                    )}
                  </div>
                )}

              {/* Audit Trail */}

              {detailData.data
                .audits &&
                detailData.data
                  .audits.length >
                  0 && (
                  <div>
                    <p className="mb-3 text-sm font-medium">
                      Audit Trail
                    </p>

                    <div className="space-y-2">
                      {detailData.data.audits.map(
                        (audit) => (
                          <div
                            key={audit.id}
                            className="rounded-lg border p-3 text-sm"
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">
                                {audit.action ===
                                "ADMIN_CREATE"
                                  ? "Created"
                                  : "Corrected"}
                              </span>

                              <span className="text-xs text-muted-foreground">
                                {new Date(
                                  audit.createdAt,
                                ).toLocaleString()}
                              </span>
                            </div>

                            <p className="mt-1 text-muted-foreground">
                              Reason:{" "}
                              {audit.reason}
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                )}
            </div>
          ) : (
            <p className="py-8 text-center text-sm text-muted-foreground">
              Unable to load attendance details.
            </p>
          )}
        </DialogContent>
      </Dialog>
    </main>
  );
}