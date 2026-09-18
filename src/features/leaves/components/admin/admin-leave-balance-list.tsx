"use client";

import { Fragment, useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Search,
  AlertCircle,
  UserX,
  Clock,
  Building2,
} from "lucide-react";
import { useAdminBalances } from "../../hooks/use-admin-leaves";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export default function AdminLeaveBalanceList() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedEmployeeId, setExpandedEmployeeId] = useState<string | null>(
    null,
  );

  const balances = useAdminBalances(year, page);
  const employees = balances.data?.data.employees ?? [];
  const meta = balances.data?.meta;
  const years = Array.from({ length: 4 }, (_, index) => currentYear - index);

  // Client-side search filtering by employee name or code
  const filteredEmployees = employees.filter((employee) => {
    const fullName = `${employee.firstName} ${employee.lastName}`.toLowerCase();
    const code = employee.employeeCode.toLowerCase();
    const query = searchQuery.toLowerCase();
    return fullName.includes(query) || code.includes(query);
  });

  return (
    <section className="flex w-full flex-1 flex-col gap-6">
      {/* Header Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            Employee Leave Balances
          </h2>
          <p className="text-sm text-muted-foreground">
            Manage annual leave allowances and track balance utilization for {year}.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-2.5 top-2.5 size-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Filter employee..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 bg-background"
            />
          </div>

          {/* Year Selector */}
          <Select
            value={String(year)}
            onValueChange={(value) => {
              setYear(Number(value));
              setPage(1);
              setExpandedEmployeeId(null);
            }}
          >
            <SelectTrigger className="w-[120px] bg-background">
              <SelectValue placeholder="Select year" />
            </SelectTrigger>
            <SelectContent>
              {years.map((item) => (
                <SelectItem key={item} value={String(item)}>
                  {item}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="overflow-hidden rounded-xl border bg-card shadow-xs">
        <div className="overflow-x-auto">
          <Table className="min-w-[700px]">
            <TableHeader className="bg-muted/50">
              <TableRow className="hover:bg-transparent">
                <TableHead className="w-[300px]">Employee</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Leave Status</TableHead>
                <TableHead className="w-[100px] text-right">Details</TableHead>
              </TableRow>
            </TableHeader>

            <TableBody>
              {/* Loading State */}
              {balances.isLoading &&
                Array.from({ length: 5 }, (_, index) => (
                  <TableRow key={index}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Skeleton className="size-9 rounded-full" />
                        <div className="space-y-1">
                          <Skeleton className="h-4 w-32" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-28" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-5 w-24 rounded-full" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="ml-auto h-8 w-16" />
                    </TableCell>
                  </TableRow>
                ))}

              {/* Error State */}
              {balances.isError && (
                <TableRow>
                  <TableCell colSpan={4} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center gap-2 text-destructive">
                      <AlertCircle className="size-6" />
                      <p className="text-sm font-medium">
                        Could not load employee balances.
                      </p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => balances.refetch()}
                      >
                        Try again
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {/* Empty State */}
              {!balances.isLoading &&
                !balances.isError &&
                filteredEmployees.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="h-32 text-center">
                      <div className="flex flex-col items-center justify-center gap-1.5 text-muted-foreground">
                        <UserX className="size-6" />
                        <p className="text-sm font-medium">
                          No employee records found.
                        </p>
                        <p className="text-xs">
                          {searchQuery
                            ? `No results match "${searchQuery}"`
                            : `No active leave data for year ${year}.`}
                        </p>
                      </div>
                    </TableCell>
                  </TableRow>
                )}

              {/* Data Rows */}
              {!balances.isLoading &&
                !balances.isError &&
                filteredEmployees.map((employee) => {
                  const isExpanded = expandedEmployeeId === employee.id;
                  const pendingDays = employee.balances.reduce(
                    (total, balance) => total + (balance.pendingDays ?? 0),
                    0,
                  );

                  return (
                    <Fragment key={employee.id}>
                      <TableRow
                        onClick={() =>
                          setExpandedEmployeeId(
                            isExpanded ? null : employee.id,
                          )
                        }
                        className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                          isExpanded ? "bg-muted/30" : ""
                        }`}
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                              {employee.firstName.charAt(0)}
                              {employee.lastName.charAt(0)}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium leading-none">
                                {employee.firstName} {employee.lastName}
                              </p>
                              <p className="mt-1 text-xs text-muted-foreground">
                                #{employee.employeeCode}
                              </p>
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                            <Building2 className="size-3.5" />
                            <span>{employee.department?.name ?? "—"}</span>
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium">
                              {employee.balances.length} Types
                            </span>
                            {pendingDays > 0 && (
                              <Badge
                                variant="outline"
                                className="border-amber-200 bg-amber-500/10 text-amber-700 dark:border-amber-900/50 dark:text-amber-400 font-normal gap-1"
                              >
                                <Clock className="size-3" />
                                {pendingDays} pending
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="size-8"
                            aria-expanded={isExpanded}
                            aria-label={`${isExpanded ? "Hide" : "View"} details for ${employee.firstName}`}
                          >
                            {isExpanded ? (
                              <ChevronDown className="size-4" />
                            ) : (
                              <ChevronRight className="size-4" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>

                      {/* Expanded Section */}
                      {isExpanded && (
                        <TableRow className="hover:bg-transparent">
                          <TableCell
                            colSpan={4}
                            className="bg-muted/20 p-4 border-t border-b"
                          >
                            <div
                              id={`balances-${employee.id}`}
                              className="space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                  Leave Type Breakdowns
                                </h3>
                              </div>

                              {employee.balances.length === 0 ? (
                                <p className="text-xs text-muted-foreground">
                                  No leave types assigned to this employee.
                                </p>
                              ) : (
                                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                                  {employee.balances.map((balance) => {
                                    const total = balance.totalDays ?? 0;
                                    const used = balance.usedDays ?? 0;
                                    const usagePercent = total
                                      ? Math.min(
                                          Math.round((used / total) * 100),
                                          100,
                                        )
                                      : 0;

                                    return (
                                      <div
                                        key={balance.id}
                                        className="rounded-lg border bg-background p-4 shadow-2xs space-y-3"
                                      >
                                        <div className="flex items-start justify-between gap-2">
                                          <div>
                                            <p className="font-semibold text-sm">
                                              {balance.leaveType.name}
                                            </p>
                                            <Badge
                                              variant="secondary"
                                              className="mt-1 text-[10px] font-normal px-1.5 py-0"
                                            >
                                              {balance.leaveType.isPaid
                                                ? "Paid Leave"
                                                : "Unpaid Leave"}
                                            </Badge>
                                          </div>
                                          <div className="text-right">
                                            <span className="text-2xl font-bold tracking-tight tabular-nums">
                                              {balance.availableDays ?? "∞"}
                                            </span>
                                            <p className="text-[10px] uppercase font-medium text-muted-foreground">
                                              Available
                                            </p>
                                          </div>
                                        </div>

                                        {balance.leaveType.hasLimitedBalance ? (
                                          <div className="space-y-2 pt-1">
                                            <div className="space-y-1">
                                              <div className="flex justify-between text-xs text-muted-foreground">
                                                <span>Usage</span>
                                                <span className="font-medium text-foreground">
                                                  {usagePercent}%
                                                </span>
                                              </div>
                                              <Progress
                                                value={usagePercent}
                                                className="h-1.5"
                                              />
                                            </div>

                                            <div className="grid grid-cols-3 gap-1 rounded-md bg-muted/40 p-2 text-center text-xs">
                                              <Metric
                                                label="Total"
                                                value={balance.totalDays}
                                              />
                                              <Metric
                                                label="Used"
                                                value={balance.usedDays}
                                              />
                                              <Metric
                                                label="Pending"
                                                value={balance.pendingDays}
                                                highlight={
                                                  (balance.pendingDays ?? 0) > 0
                                                }
                                              />
                                            </div>
                                          </div>
                                        ) : (
                                          <div className="rounded-md bg-muted/40 p-2 text-xs">
                                            <p className="font-medium text-muted-foreground">
                                              Unlimited Balance
                                            </p>
                                            <p className="mt-0.5 text-foreground">
                                              {balance.usedDays === null ? "No balance limit applies" : `${balance.usedDays} used · ${balance.pendingDays ?? 0} pending`}
                                            </p>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </Fragment>
                  );
                })}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Footer */}
        {meta && meta.totalPages > 1 && (
          <div className="flex items-center justify-between gap-4 border-t px-4 py-3 bg-muted/10">
            <p className="text-sm text-muted-foreground">
              Showing page <span className="font-medium text-foreground">{meta.page}</span> of{" "}
              <span className="font-medium text-foreground">{meta.totalPages}</span> ({meta.total} total employees)
            </p>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={!meta.hasPreviousPage || balances.isFetching}
                onClick={() => {
                  setPage((previous) => previous - 1);
                  setExpandedEmployeeId(null);
                }}
              >
                Previous
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={!meta.hasNextPage || balances.isFetching}
                onClick={() => {
                  setPage((previous) => previous + 1);
                  setExpandedEmployeeId(null);
                }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

function Metric({
  label,
  value,
  highlight = false,
}: {
  label: string;
  value: number | null;
  highlight?: boolean;
}) {
  return (
    <div>
      <p className="text-[10px] text-muted-foreground">{label}</p>
      <p
        className={`font-semibold tabular-nums ${
          highlight ? "text-amber-600 dark:text-amber-400" : ""
        }`}
      >
        {value ?? "—"}
      </p>
    </div>
  );
}