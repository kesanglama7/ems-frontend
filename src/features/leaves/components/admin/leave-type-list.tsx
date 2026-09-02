"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  Building2,
  Pencil,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Switch } from "@/components/ui/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api-error";

import {
  useLeaveTypes,
  useToggleLeaveTypeActive,
} from "../../hooks/use-leave-types";
import type { LeaveType } from "../../types/leave.types";
import { useConfirmDialogStore } from "@/stores/confirm-dialog.store";

import { LeaveTypeFormDialog } from "./leave-type-form-dialog";

function formatDate(
  value: string,
) {
  return new Intl.DateTimeFormat(
    "en",
    {
      year: "numeric",
      month: "short",
      day: "numeric",
    },
  ).format(new Date(value));
}

function LeaveTypeListSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({
        length: 6,
      }).map((_, index) => (
        <Skeleton
          key={index}
          className="h-16 w-full"
        />
      ))}
    </div>
  );
}

export function LeaveTypeList() {
  const leaveTypesQuery =
    useLeaveTypes();

  const toggleMutation =
    useToggleLeaveTypeActive();

  const confirmDialog =
    useConfirmDialogStore();

  const [search, setSearch] =
    useState("");

  const [
    createDialogOpen,
    setCreateDialogOpen,
  ] = useState(false);

  const [
    editLeaveType,
    setEditLeaveType,
  ] =
    useState<LeaveType | null>(
      null,
    );

  const leaveTypes =
    leaveTypesQuery.data?.data ??
    [];

  const filteredLeaveTypes =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return leaveTypes;
      }

      return leaveTypes.filter(
        (leaveType) =>
          leaveType.name
            .toLowerCase()
            .includes(query) ||
          leaveType.description
            ?.toLowerCase()
            .includes(query),
      );
    }, [
      leaveTypes,
      search,
    ]);

  if (leaveTypesQuery.isPending) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Leave Types
          </h1>

          <p className="text-muted-foreground mt-1 text-sm">
            Manage leave types available
            to employees.
          </p>
        </div>

        <LeaveTypeListSkeleton />
      </div>
    );
  }

  if (leaveTypesQuery.isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Leave Types
          </h1>

          <p className="text-muted-foreground mt-1 text-sm">
            Manage leave types available
            to employees.
          </p>
        </div>

        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
          <Building2 className="text-muted-foreground size-8" />

          <p className="mt-4 font-medium">
            Unable to load leave types
          </p>

          <p className="text-muted-foreground mt-1 max-w-md text-sm">
            {getApiErrorMessage(
              leaveTypesQuery.error,
            )}
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() =>
              leaveTypesQuery.refetch()
            }
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const noLeaveTypes =
    leaveTypes.length === 0;

  const noSearchResults =
    !noLeaveTypes &&
    filteredLeaveTypes.length === 0;

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Leave Types
            </h1>

            <p className="text-muted-foreground mt-1 text-sm">
              Manage leave types available
              to employees.
            </p>
          </div>

          <Button
            type="button"
            onClick={() =>
              setCreateDialogOpen(
                true,
              )
            }
          >
            <Plus className="size-4" />
            Create leave type
          </Button>
        </div>

        {!noLeaveTypes && (
          <div className="relative max-w-md">
            <Building2 className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search leave types..."
              className="pl-9"
            />
          </div>
        )}

        {noLeaveTypes ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
            <div className="bg-muted flex size-11 items-center justify-center rounded-full">
              <Building2 className="text-muted-foreground size-5" />
            </div>

            <h2 className="mt-4 font-medium">
              No leave types yet
            </h2>

            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              Create your first leave type
              to configure employee leave
              options.
            </p>

            <Button
              className="mt-4"
              onClick={() =>
                setCreateDialogOpen(
                  true,
                )
              }
            >
              <Plus className="size-4" />
              Create leave type
            </Button>
          </div>
        ) : noSearchResults ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
            <p className="font-medium">
              No leave types found
            </p>

            <p className="text-muted-foreground mt-1 text-sm">
              Try another search term.
            </p>

            <Button
              variant="outline"
              className="mt-4"
              onClick={() =>
                setSearch("")
              }
            >
              Clear search
            </Button>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-hidden rounded-lg border md:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      Name
                    </TableHead>

                    <TableHead>
                      Description
                    </TableHead>

                    <TableHead>
                      Status
                    </TableHead>

                    <TableHead className="w-12">
                      <span className="sr-only">
                        Actions
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredLeaveTypes.map(
                    (leaveType) => (
                      <TableRow
                        key={
                          leaveType.id
                        }
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="bg-muted flex size-9 items-center justify-center rounded-md">
                              <Building2 className="text-muted-foreground size-4" />
                            </div>

                            <p className="font-medium">
                              {
                                leaveType.name
                              }
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className="max-w-sm">
                          <p className="text-muted-foreground truncate">
                            {leaveType.description ||
                              "—"}
                          </p>
                        </TableCell>

                        <TableCell>
                          <Switch
                            checked={leaveType.isActive}
                            onCheckedChange={(checked) => {
                              toggleMutation.mutate({
                                leaveTypeId: leaveType.id,
                                isActive: checked,
                              });
                            }}
                            disabled={toggleMutation.isPending}
                          />
                        </TableCell>

                        <TableCell>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            aria-label={`Edit ${leaveType.name}`}
                            onClick={() => setEditLeaveType(leaveType)}
                          >
                            <Pencil className="size-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile */}
            <div className="grid gap-3 md:hidden">
              {filteredLeaveTypes.map(
                (leaveType) => (
                  <div
                    key={
                      leaveType.id
                    }
                    className="rounded-lg border p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="bg-muted flex size-9 shrink-0 items-center justify-center rounded-md">
                          <Building2 className="text-muted-foreground size-4" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate font-medium">
                            {
                              leaveType.name
                            }
                          </p>

                          <p className="text-muted-foreground mt-0.5 text-xs">
                            Created{" "}
                            {formatDate(
                              leaveType.createdAt,
                            )}
                          </p>
                        </div>
                      </div>

                      <Badge
                        variant={
                          leaveType.isActive
                            ? "default"
                            : "secondary"
                        }
                      >
                        {leaveType.isActive
                          ? "Active"
                          : "Inactive"}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground mt-4 line-clamp-3 text-sm">
                      {leaveType.description ||
                        "No description provided."}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setEditLeaveType(
                            leaveType,
                          )
                        }
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Button>

                      <Switch
                        checked={leaveType.isActive}
                        onCheckedChange={(checked) => {
                          toggleMutation.mutate({
                            leaveTypeId: leaveType.id,
                            isActive: checked,
                          });
                        }}
                        disabled={toggleMutation.isPending}
                      />
                    </div>
                  </div>
                ),
              )}
            </div>
          </>
        )}
      </div>

      <LeaveTypeFormDialog
        open={createDialogOpen}
        onOpenChange={
          setCreateDialogOpen
        }
      />

      <LeaveTypeFormDialog
        open={
          editLeaveType !== null
        }
        leaveType={
          editLeaveType
        }
        onOpenChange={(open) => {
          if (!open) {
            setEditLeaveType(
              null,
            );
          }
        }}
      />
    </>
  );
}
