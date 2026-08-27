"use client";

import {
  useMemo,
  useState,
} from "react";
import {
  Building2,
  CheckCircle2,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  XCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getApiErrorMessage } from "@/lib/api-error";
import { useConfirmDialogStore } from "@/stores/confirm-dialog.store";

import { useDeactivateDepartment } from "../hooks/use-deactivate-department";
import { useUpdateDepartment } from "../hooks/use-update-department";
import type { Department } from "../types/department.types";

import { DepartmentDetailsDialog } from "./department-details-dialog";
import { DepartmentFormDialog } from "./department-form-dialog";
import { useDepartments } from "../hooks/use-departments";

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

function DepartmentListSkeleton() {
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

export function AdminDepartmentList() {
  const departmentsQuery =
    useDepartments();

  const deactivateMutation =
    useDeactivateDepartment();

  const updateMutation =
    useUpdateDepartment();

  const confirm =
    useConfirmDialogStore(
      (state) => state.confirm,
    );

  const [search, setSearch] =
    useState("");

  const [
    createDialogOpen,
    setCreateDialogOpen,
  ] = useState(false);

  const [
    editDepartment,
    setEditDepartment,
  ] =
    useState<Department | null>(
      null,
    );

  const [
    detailsDepartmentId,
    setDetailsDepartmentId,
  ] =
    useState<string | null>(
      null,
    );

  const departments =
    departmentsQuery.data?.data ??
    [];

  const filteredDepartments =
    useMemo(() => {
      const query =
        search
          .trim()
          .toLowerCase();

      if (!query) {
        return departments;
      }

      return departments.filter(
        (department) =>
          department.name
            .toLowerCase()
            .includes(query) ||
          department.description
            ?.toLowerCase()
            .includes(query),
      );
    }, [
      departments,
      search,
    ]);

  function deactivate(
    department: Department,
  ) {
    confirm({
      title:
        "Deactivate department?",

      description:
        `${department.name} will become inactive. Existing records remain available, but the department should no longer be used for new assignments.`,

      confirmLabel:
        "Deactivate",

      destructive: true,

      onConfirm: async () => {
        try {
          const response =
            await deactivateMutation.mutateAsync(
              department.id,
            );

          toast.success(
            response.message ||
              "Department deactivated successfully.",
          );
        } catch (error) {
          toast.error(
            getApiErrorMessage(
              error,
            ),
          );

          throw error;
        }
      },
    });
  }

  function activate(
    department: Department,
  ) {
    confirm({
      title:
        "Activate department?",

      description:
        `${department.name} will become active and can be used for employee assignments again.`,

      confirmLabel:
        "Activate",

      destructive: false,

      onConfirm: async () => {
        try {
          const response =
            await updateMutation.mutateAsync(
              {
                departmentId:
                  department.id,

                payload: {
                  isActive: true,
                },
              },
            );

          toast.success(
            response.message ||
              "Department activated successfully.",
          );
        } catch (error) {
          toast.error(
            getApiErrorMessage(
              error,
            ),
          );

          throw error;
        }
      },
    });
  }

  if (departmentsQuery.isPending) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Departments
          </h1>

          <p className="text-muted-foreground mt-1 text-sm">
            Manage departments in
            your organization.
          </p>
        </div>

        <DepartmentListSkeleton />
      </div>
    );
  }

  if (departmentsQuery.isError) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Departments
          </h1>

          <p className="text-muted-foreground mt-1 text-sm">
            Manage departments in
            your organization.
          </p>
        </div>

        <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
          <Building2 className="text-muted-foreground size-8" />

          <p className="mt-4 font-medium">
            Unable to load departments
          </p>

          <p className="text-muted-foreground mt-1 max-w-md text-sm">
            {getApiErrorMessage(
              departmentsQuery.error,
            )}
          </p>

          <Button
            type="button"
            variant="outline"
            className="mt-4"
            onClick={() =>
              departmentsQuery.refetch()
            }
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const noDepartments =
    departments.length === 0;

  const noSearchResults =
    !noDepartments &&
    filteredDepartments.length === 0;

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              Departments
            </h1>

            <p className="text-muted-foreground mt-1 text-sm">
              Manage departments in
              your organization.
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
            Create department
          </Button>
        </div>

        {!noDepartments && (
          <div className="relative max-w-md">
            <Search className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2" />

            <Input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search departments..."
              className="pl-9"
            />
          </div>
        )}

        {noDepartments ? (
          <div className="flex min-h-64 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
            <div className="bg-muted flex size-11 items-center justify-center rounded-full">
              <Building2 className="text-muted-foreground size-5" />
            </div>

            <h2 className="mt-4 font-medium">
              No departments yet
            </h2>

            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              Create your first
              department to organize
              employees.
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
              Create department
            </Button>
          </div>
        ) : noSearchResults ? (
          <div className="flex min-h-48 flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
            <p className="font-medium">
              No departments found
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
                      Department
                    </TableHead>

                    <TableHead>
                      Description
                    </TableHead>

                    <TableHead>
                      Status
                    </TableHead>

                    <TableHead>
                      Created
                    </TableHead>

                    <TableHead className="w-12">
                      <span className="sr-only">
                        Actions
                      </span>
                    </TableHead>
                  </TableRow>
                </TableHeader>

                <TableBody>
                  {filteredDepartments.map(
                    (department) => (
                      <TableRow
                        key={
                          department.id
                        }
                      >
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <div className="bg-muted flex size-9 items-center justify-center rounded-md">
                              <Building2 className="text-muted-foreground size-4" />
                            </div>

                            <p className="font-medium">
                              {
                                department.name
                              }
                            </p>
                          </div>
                        </TableCell>

                        <TableCell className="max-w-sm">
                          <p className="text-muted-foreground truncate">
                            {department.description ||
                              "—"}
                          </p>
                        </TableCell>

                        <TableCell>
                          <Badge
                            variant={
                              department.isActive
                                ? "default"
                                : "secondary"
                            }
                          >
                            {department.isActive
                              ? "Active"
                              : "Inactive"}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          {formatDate(
                            department.createdAt,
                          )}
                        </TableCell>

                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              render={
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  aria-label={`Actions for ${department.name}`}
                                />
                              }
                            >
                              <MoreHorizontal className="size-4" />
                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">
                              <DropdownMenuGroup>
                                <DropdownMenuItem
                                  onClick={() =>
                                    setDetailsDepartmentId(
                                      department.id,
                                    )
                                  }
                                >
                                  <Eye className="size-4" />
                                  View details
                                </DropdownMenuItem>

                                <DropdownMenuItem
                                  onClick={() =>
                                    setEditDepartment(
                                      department,
                                    )
                                  }
                                >
                                  <Pencil className="size-4" />
                                  Edit
                                </DropdownMenuItem>

                                {department.isActive ? (
                                  <DropdownMenuItem
                                    className="text-destructive focus:text-destructive"
                                    onClick={() =>
                                      deactivate(
                                        department,
                                      )
                                    }
                                  >
                                    <XCircle className="size-4" />
                                    Deactivate
                                  </DropdownMenuItem>
                                ) : (
                                  <DropdownMenuItem
                                    onClick={() =>
                                      activate(
                                        department,
                                      )
                                    }
                                  >
                                    <CheckCircle2 className="size-4" />
                                    Activate
                                  </DropdownMenuItem>
                                )}
                              </DropdownMenuGroup>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ),
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Mobile */}
            <div className="grid gap-3 md:hidden">
              {filteredDepartments.map(
                (department) => (
                  <div
                    key={department.id}
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
                              department.name
                            }
                          </p>

                          <p className="text-muted-foreground mt-0.5 text-xs">
                            Created{" "}
                            {formatDate(
                              department.createdAt,
                            )}
                          </p>
                        </div>
                      </div>

                      <Badge
                        variant={
                          department.isActive
                            ? "default"
                            : "secondary"
                        }
                      >
                        {department.isActive
                          ? "Active"
                          : "Inactive"}
                      </Badge>
                    </div>

                    <p className="text-muted-foreground mt-4 line-clamp-3 text-sm">
                      {department.description ||
                        "No description provided."}
                    </p>

                    <div className="mt-4 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setDetailsDepartmentId(
                            department.id,
                          )
                        }
                      >
                        <Eye className="size-4" />
                        View
                      </Button>

                      <Button
                        type="button"
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          setEditDepartment(
                            department,
                          )
                        }
                      >
                        <Pencil className="size-4" />
                        Edit
                      </Button>

                      {department.isActive ? (
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() =>
                            deactivate(
                              department,
                            )
                          }
                        >
                          <XCircle className="size-4" />
                          Deactivate
                        </Button>
                      ) : (
                        <Button
                          type="button"
                          size="sm"
                          onClick={() =>
                            activate(
                              department,
                            )
                          }
                        >
                          <CheckCircle2 className="size-4" />
                          Activate
                        </Button>
                      )}
                    </div>
                  </div>
                ),
              )}
            </div>
          </>
        )}
      </div>

      <DepartmentFormDialog
        open={createDialogOpen}
        onOpenChange={
          setCreateDialogOpen
        }
      />

      <DepartmentFormDialog
        open={
          editDepartment !== null
        }
        department={
          editDepartment
        }
        onOpenChange={(open) => {
          if (!open) {
            setEditDepartment(
              null,
            );
          }
        }}
      />

      <DepartmentDetailsDialog
        departmentId={
          detailsDepartmentId
        }
        open={
          detailsDepartmentId !==
          null
        }
        onOpenChange={(open) => {
          if (!open) {
            setDetailsDepartmentId(
              null,
            );
          }
        }}
      />
    </>
  );
}