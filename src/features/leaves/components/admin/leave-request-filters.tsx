"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Search } from "lucide-react";

import { useEmployeesInfinite } from "@/features/employees/hooks/use-employees-infinite";
import { useDepartments } from "@/features/departments/hooks/use-departments";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";

import { getInitials } from "@/lib/name-shorten";
import {
  getFirstDayOfCurrentMonth,
  getLastDayOfCurrentMonth,
  getTodayDate,
} from "@/lib/general";

import { useLeaveTypes } from "../../hooks/use-leave-types";

import type {
  AdminLeaveQueryParams,
  LeaveStatus,
} from "../../types/leave.types";

interface LeaveRequestFiltersProps {
  onFiltersChange: (
    filters: AdminLeaveQueryParams,
  ) => void;
}

export function LeaveRequestFilters({
  onFiltersChange,
}: LeaveRequestFiltersProps) {
  const [fromDate, setFromDate] = useState(
    getFirstDayOfCurrentMonth(),
  );

  const [toDate, setToDate] = useState(
    getLastDayOfCurrentMonth(),
  );

  const [status, setStatus] =
    useState<string>("ALL");

  const [
    employeeFilter,
    setEmployeeFilter,
  ] = useState("ALL");

  const [
    departmentFilter,
    setDepartmentFilter,
  ] = useState("ALL");

  const [
    leaveTypeFilter,
    setLeaveTypeFilter,
  ] = useState("ALL");


  const [
    employeeSearch,
    setEmployeeSearch,
  ] = useState("");

  const [
    isEmployeeOpen,
    setIsEmployeeOpen,
  ] = useState(false);

  const employeeContainerRef =
    useRef<HTMLDivElement>(null);

  const scrollRef =
    useRef<HTMLDivElement>(null);


  const statusItems = useMemo(
    () => [
      {
        label: "All",
        value: "ALL",
      },
      {
        label: "Pending",
        value: "PENDING",
      },
      {
        label: "Approved",
        value: "APPROVED",
      },
      {
        label: "Rejected",
        value: "REJECTED",
      },
      {
        label: "Cancelled",
        value: "CANCELLED",
      },
      { label: "Auto rejected", value: "AUTO_REJECTED" },
    ],
    [],
  );


  const {
    data: departmentsResponse,
    isPending: isDepartmentsPending,
  } = useDepartments();

  const allDepartments =
    departmentsResponse?.data ?? [];

  const departmentItems = useMemo(
    () => [
      {
        label: "All departments",
        value: "ALL",
      },

      ...allDepartments.map(
        (department) => ({
          label: department.isActive
            ? department.name
            : `${department.name} (Inactive)`,

          value: department.id,
        }),
      ),
    ],
    [allDepartments],
  );


  const {
    data: leaveTypesResponse,
    isPending: isLeaveTypesPending,
  } = useLeaveTypes();

  const allLeaveTypes =
    leaveTypesResponse?.data ?? [];

  const leaveTypeItems = useMemo(
    () => [
      {
        label: "All leave types",
        value: "ALL",
      },

      ...allLeaveTypes.map(
        (leaveType) => ({
          label: leaveType.isActive
            ? leaveType.name
            : `${leaveType.name} (Inactive)`,

          value: leaveType.id,
        }),
      ),
    ],
    [allLeaveTypes],
  );


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


  const handleOutsideClick =
    useCallback((event: MouseEvent) => {
      if (
        employeeContainerRef.current &&
        !employeeContainerRef.current.contains(
          event.target as Node,
        )
      ) {
        setIsEmployeeOpen(false);
      }
    }, []);

  useEffect(() => {
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
  }, [handleOutsideClick]);


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


  const selectedEmployeeLabel =
    useMemo(() => {
      if (
        employeeFilter === "ALL"
      ) {
        return null;
      }

      const employee =
        allEmployees.find(
          (item) =>
            item.id ===
            employeeFilter,
        );

      return employee
        ? `${employee.firstName} ${employee.lastName}`
        : null;
    }, [
      employeeFilter,
      allEmployees,
    ]);

  useEffect(() => {
    onFiltersChange({
      from: fromDate,
      to: toDate,

      status:
        status === "ALL"
          ? undefined
          : (status as LeaveStatus),

      employeeId:
        employeeFilter === "ALL"
          ? undefined
          : employeeFilter,

      departmentId:
        departmentFilter === "ALL"
          ? undefined
          : departmentFilter,

      leaveTypeId:
        leaveTypeFilter === "ALL"
          ? undefined
          : leaveTypeFilter,
    });
  }, [
    fromDate,
    toDate,
    status,
    employeeFilter,
    departmentFilter,
    leaveTypeFilter,
    onFiltersChange,
  ]);

  return (
    <div className="flex flex-col gap-4 rounded-xl border p-4 md:flex-row md:items-end">
      {/* From Date */}

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

      {/* To Date */}

      <div className="flex-1">
        <label className="text-sm font-medium">
          To
        </label>

        <Input
          type="date"
          value={toDate}
          min={fromDate}
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
          value={status}
          onValueChange={(value) => {
            if (!value) {
              return;
            }

            setStatus(value);
          }}
        >
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="All" />
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

      {/* Department */}

      <div className="flex-1">
        <label className="text-sm font-medium">
          Department
        </label>

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

      {/* Leave Type */}

      <div className="flex-1">
        <label className="text-sm font-medium">
          Leave Type
        </label>

        <Select
          items={leaveTypeItems}
          value={leaveTypeFilter}
          onValueChange={(value) => {
            if (!value) {
              return;
            }

            setLeaveTypeFilter(
              value,
            );
          }}
          disabled={
            isLeaveTypesPending
          }
        >
          <SelectTrigger className="mt-1 w-full">
            <SelectValue placeholder="All leave types" />
          </SelectTrigger>

          <SelectContent>
            {leaveTypeItems.map(
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

      <div
        className="flex-1"
        ref={employeeContainerRef}
      >
        <label className="text-sm font-medium">
          Employee
        </label>

        <div className="relative mt-1">
          {/* Trigger */}

          <button
            type="button"
            onClick={() =>
              setIsEmployeeOpen(
                (previous) =>
                  !previous,
              )
            }
            className="flex h-9 w-full items-center justify-between gap-1.5 rounded-md border border-input bg-transparent px-2.5 py-2 text-sm shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50"
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

          {/* Employee Dropdown */}

          {isEmployeeOpen && (
            <div className="absolute z-50 mt-1 w-full rounded-md border bg-popover text-popover-foreground shadow-md">
              {/* Search */}

              <div className="flex items-center gap-2 border-b px-3 py-2">
                <Search className="size-4 shrink-0 text-muted-foreground" />

                <input
                  type="text"
                  placeholder="Search by name or code..."
                  value={
                    employeeSearch
                  }
                  onChange={(event) =>
                    setEmployeeSearch(
                      event.target.value,
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

              {/* Employee List */}

              <div
                ref={scrollRef}
                onScroll={
                  handleScroll
                }
                className="max-h-60 overflow-y-auto p-1"
              >
                {/* All Employees */}

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

                {/* Loading */}

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
                    (employee) => (
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
                          <Avatar className="size-9">
                            <AvatarFallback className="text-sm">
                              {getInitials(
                                employee.firstName,
                                employee.lastName,
                              )}
                            </AvatarFallback>

                            <AvatarImage
                              src={
                                employee.profileImageUrl
                              }
                            />
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

                {/* Loading More */}

                {isFetchingNextPage && (
                  <div className="px-2 py-1.5 text-center text-sm text-muted-foreground">
                    Loading more...
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
