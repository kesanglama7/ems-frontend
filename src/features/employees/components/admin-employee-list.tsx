"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  CalendarCheck,
  ChevronLeft,
  ChevronRight,
  Eye,
  LoaderCircle,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getApiErrorMessage } from "@/lib/api-error";
import type { UserStatus, UserWorkMode } from "@/types/user.types";

import { useDepartments } from "@/features/departments/hooks/use-departments";
import { EmployeeListItem, EmployeeListQuery } from "@/features/employees/types/employee.types";
import { useEmployees } from "@/features/employees/hooks/use-employees";
import Link from "next/link";
import { EmployeeStatusMenuItem } from "./employee-status-menu-item";

const PAGE_SIZE = 20;

type StatusFilter =
  | "ALL"
  | UserStatus;

type WorkModeFilter =
  | "ALL"
  | UserWorkMode;

const workModeItems = [
  {
    label: "All work modes",
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
]

const statusItems = [
  {
    label: "All statuses",
    value: "ALL",
  },
  {
    label: "Active",
    value: "ACTIVE",
  },
  {
    label: "Inactive",
    value: "INACTIVE",
  },
];

function getInitials(
  firstName: string,
  lastName: string,
) {
  return `${firstName[0] ?? ""}${lastName[0] ?? ""}`
    .toUpperCase();
}

function formatJoiningDate(
  value: string | null,
) {
  if (!value) {
    return "—";
  }

  const [year, month, day] = value
    .slice(0, 10)
    .split("-")
    .map(Number);

  return new Intl.DateTimeFormat("en", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(
    new Date(year, month - 1, day),
  );
}

function EmployeeStatusBadge({
  status,
}: {
  status: UserStatus;
}) {
  return (
    <Badge
      variant={
        status === "ACTIVE"
          ? "default"
          : "secondary"
      }
    >
      {status === "ACTIVE"
        ? "Active"
        : "Inactive"}
    </Badge>
  );
}

function WorkModeStatus({
  workMode,
}: {
  workMode: UserWorkMode;
}) {
  return (
    <Badge
      variant={
        workMode === "ON_FIELD"
          ? "default"
          : "secondary"
      }
    >
      {workMode === "ON_FIELD"
        ? "On Field"
        : "Remote"}
    </Badge>
  );
}

function EmployeeTableSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 6 }).map(
        (_, index) => (
          <Skeleton
            key={index}
            className="h-16 w-full"
          />
        ),
      )}
    </div>
  );
}

function EmployeeDesktopTable({
  employees,
}: {
  employees: EmployeeListItem[];
}) {
  return (
    <div className="hidden overflow-hidden rounded-lg border md:block">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Employee</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Job title</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>
              Joining date
            </TableHead>
            <TableHead>Work mode</TableHead>
            <TableHead className="w-12">
              <span className="sr-only">
                Actions
              </span>
            </TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {employees.map((employee) => (
            <TableRow key={employee.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={employee.profileImageUrl} />
                    <AvatarFallback>
                      {getInitials(
                        employee.firstName,
                        employee.lastName,
                      )}
                    </AvatarFallback>
                  </Avatar>

                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      {employee.firstName}{" "}
                      {employee.lastName}
                    </p>

                    <p className="text-muted-foreground text-xs">
                      {employee.employeeCode}
                    </p>
                  </div>
                </div>
              </TableCell>

              <TableCell>
                {employee.user.email}
              </TableCell>

              <TableCell>
                {employee.department?.name ??
                  "Unassigned"}
              </TableCell>

              <TableCell>
                {employee.jobTitle ?? "—"}
              </TableCell>

              <TableCell>
                <EmployeeStatusBadge
                  status={
                    employee.user.status
                  }
                />
              </TableCell>

              <TableCell>
                {formatJoiningDate(
                  employee.dateOfJoining,
                )}
              </TableCell>
              <TableCell>
                <WorkModeStatus
                  workMode={
                    employee.workMode
                  }
                />
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <Button
                        variant="ghost"
                        size="icon"
                        aria-label={`Actions for ${employee.firstName} ${employee.lastName}`}
                      />
                    }
                  >
                    <MoreHorizontal className="size-4" />
                  </DropdownMenuTrigger>

                  <DropdownMenuContent align="end">
                    <DropdownMenuGroup>
                      <DropdownMenuItem
                        render={
                          <Link
                            href={`/admin/employees/${employee.id}`}
                          />
                        }
                      >
                        <Eye className="size-4" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        render={
                          <Link
                            href={`/admin/employees/${employee.id}/edit`}
                          />
                        }
                      >
                        <Pencil className="size-4" />
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        render={
                          <Link
                            href={`/admin/employees/${employee.id}/attendance`}
                          />
                        }
                      >
                        <CalendarCheck className="size-4" />
                        Attendance
                      </DropdownMenuItem>
                      <EmployeeStatusMenuItem
                        employeeId={
                          employee.id
                        }
                        employeeName={`${employee.firstName} ${employee.lastName}`}
                        status={
                          employee.user.status
                        }
                      />
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

function EmployeeMobileList({
  employees,
}: {
  employees: EmployeeListItem[];
}) {
  return (
    <div className="grid gap-3 md:hidden">
      {employees.map((employee) => (
        <div
          key={employee.id}
          className="rounded-lg border p-4"
        >
          <div className="flex items-start gap-3">
            <Avatar>
              <AvatarFallback>
                {getInitials(
                  employee.firstName,
                  employee.lastName,
                )}
              </AvatarFallback>
            </Avatar>

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="truncate font-medium">
                    {employee.firstName}{" "}
                    {employee.lastName}
                  </p>

                  <p className="text-muted-foreground text-xs">
                    {employee.employeeCode}
                  </p>
                </div>
                <Link href={`/admin/employees/${employee.id}`}>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                >
                  View details
                </Button>
                </Link>
              </div>

              <div className="mt-4 grid gap-2 text-sm">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Email
                    </p>
                    <p className="truncate">
                      {employee.user.email}
                    </p>
                  </div>
                  <div>
                    <EmployeeStatusBadge
                      status={
                        employee.user.status
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Department
                    </p>
                    <p>
                      {employee.department
                        ?.name ??
                        "Unassigned"}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Job title
                    </p>
                    <p>
                      {employee.jobTitle ??
                        "—"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Joining date
                    </p>
                    <p>
                      {formatJoiningDate(
                        employee.dateOfJoining,
                      )}
                    </p>
                  </div>
                  <div>
                    <p className="text-muted-foreground text-xs">
                      Work mode
                    </p>
                    <WorkModeStatus
                      workMode={
                        employee.workMode
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AdminEmployeeList() {
  const [page, setPage] = useState(1);

  const [
    searchInput,
    setSearchInput,
  ] = useState("");

  const [
    debouncedSearch,
    setDebouncedSearch,
  ] = useState("");

  const [
    statusFilter,
    setStatusFilter,
  ] =
    useState<StatusFilter>("ALL");

  const [
    workModeFilter,
    setWorkModeFilter,
  ] = useState<WorkModeFilter>("ALL");

  const [
    departmentFilter,
    setDepartmentFilter,
  ] = useState("ALL");

  useEffect(() => {
    const timeout = window.setTimeout(
      () => {
        setDebouncedSearch(
          searchInput.trim(),
        );
        setPage(1);
      },
      300,
    );

    return () =>
      window.clearTimeout(timeout);
  }, [searchInput]);

  const query =
    useMemo<EmployeeListQuery>(
      () => ({
        page,
        limit: PAGE_SIZE,
        search:
          debouncedSearch ||
          undefined,
        status:
          statusFilter === "ALL"
            ? undefined
            : statusFilter,
        departmentId:
          departmentFilter === "ALL"
            ? undefined
            : departmentFilter,
        workMode:
          workModeFilter === "ALL"
            ? undefined
            : workModeFilter,
      }),
      [
        page,
        debouncedSearch,
        statusFilter,
        departmentFilter,
        workModeFilter,
      ],
    );

  const employeesQuery =
    useEmployees(query);

  const departmentsQuery =
    useDepartments();

  const departmentItems =
    useMemo(
      () => [
        {
          label: "All departments",
          value: "ALL",
        },
        ...(
          departmentsQuery.data?.data ??
          []
        ).map((department) => ({
          label: department.isActive
            ? department.name
            : `${department.name} (Inactive)`,
          value: department.id,
        })),
      ],
      [departmentsQuery.data],
    );

  const hasFilters =
    searchInput.length > 0 ||
    statusFilter !== "ALL" ||
    departmentFilter !== "ALL" ||
    workModeFilter !== "ALL";

  function clearFilters() {
    setSearchInput("");
    setDebouncedSearch("");
    setStatusFilter("ALL");
    setDepartmentFilter("ALL");
    setWorkModeFilter("ALL");
    setPage(1);
  }

  const response =
    employeesQuery.data;

  const employees =
    response?.data ?? [];

  const meta = response?.meta;

  const total = meta?.total ?? 0;

  const from =
    total === 0
      ? 0
      : (page - 1) * PAGE_SIZE + 1;

  const to = Math.min(
    page * PAGE_SIZE,
    total,
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Employees
          </h1>

          <p className="text-muted-foreground mt-1 text-sm">
            View and manage employees in
            your organization.
          </p>
        </div>

        <Link href="/admin/employees/new" >
          <Button
          >
            <Plus className="size-4" />
            Create employee
          </Button>
        </Link>
      </div>

      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative flex-1">
          <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />

          <Input
            value={searchInput}
            onChange={(event) =>
              setSearchInput(
                event.target.value,
              )
            }
            placeholder="Search name, email, or employee code..."
            className="pl-9"
          />
        </div>

        <Select
          items={workModeItems}
          value={workModeFilter}
          onValueChange={(value) => {
            if (!value) {
              return;
            }

            setWorkModeFilter(
              value as WorkModeFilter,
            );
            setPage(1);
          }}
        >
          <SelectTrigger
            className="w-full lg:w-56"
            disabled={
              employeesQuery.isPending
            }
          >
            <SelectValue placeholder="Work mode" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
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
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          items={departmentItems}
          value={departmentFilter}
          onValueChange={(value) => {
            if (!value) {
              return;
            }

            setDepartmentFilter(
              value,
            );
            setPage(1);
          }}
        >
          <SelectTrigger
            className="w-full lg:w-56"
            disabled={
              departmentsQuery.isPending
            }
          >
            <SelectValue placeholder="Department" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
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
            </SelectGroup>
          </SelectContent>
        </Select>

        <Select
          items={statusItems}
          value={statusFilter}
          onValueChange={(value) => {
            if (!value) {
              return;
            }

            setStatusFilter(
              value as StatusFilter,
            );
            setPage(1);
          }}
        >
          <SelectTrigger className="w-full lg:w-44">
            <SelectValue placeholder="Status" />
          </SelectTrigger>

          <SelectContent>
            <SelectGroup>
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
            </SelectGroup>
          </SelectContent>
        </Select>

        {hasFilters && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={clearFilters}
          >
            Clear
          </Button>
        )}
      </div>

      {employeesQuery.isPending ? (
        <EmployeeTableSkeleton />
      ) : employeesQuery.isError ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
          <p className="font-medium">
            Unable to load employees
          </p>

          <p className="text-muted-foreground mt-1 max-w-md text-sm">
            {getApiErrorMessage(
              employeesQuery.error,
            )}
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() =>
              employeesQuery.refetch()
            }
          >
            Retry
          </Button>
        </div>
      ) : employees.length === 0 ? (
        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
          <div className="bg-muted flex size-10 items-center justify-center rounded-full">
            <Users className="text-muted-foreground size-5" />
          </div>

          <p className="mt-4 font-medium">
            {hasFilters
              ? "No employees found"
              : "No employees yet"}
          </p>

          <p className="text-muted-foreground mt-1 max-w-sm text-sm">
            {hasFilters
              ? "Try changing or clearing your search and filters."
              : "Employees will appear here after they are created."}
          </p>

          {hasFilters && (
            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={clearFilters}
            >
              Clear filters
            </Button>
          )}
        </div>
      ) : (
        <>
          {employeesQuery.isFetching && (
            <div className="text-muted-foreground flex items-center gap-2 text-xs">
              <LoaderCircle className="size-3.5 animate-spin" />
              Updating employees...
            </div>
          )}

          <EmployeeDesktopTable
            employees={employees}
          />

          <EmployeeMobileList
            employees={employees}
          />

          {meta && (
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-muted-foreground text-sm">
                Showing {from}-{to} of{" "}
                {meta.total} employees
              </p>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    page <= 1 ||
                    employeesQuery.isFetching
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        current - 1,
                    )
                  }
                >
                  <ChevronLeft className="size-4" />
                  Previous
                </Button>

                <span className="text-muted-foreground px-2 text-sm">
                  Page {meta.page} of{" "}
                  {Math.max(
                    meta.totalPages,
                    1,
                  )}
                </span>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={
                    page >=
                      meta.totalPages ||
                    employeesQuery.isFetching
                  }
                  onClick={() =>
                    setPage(
                      (current) =>
                        current + 1,
                    )
                  }
                >
                  Next
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}