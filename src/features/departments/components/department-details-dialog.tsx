"use client";

import {
  CalendarDays,
  RefreshCw,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";
import { useDepartment } from "../hooks/use-department";


interface DepartmentDetailsDialogProps {
  departmentId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

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

export function DepartmentDetailsDialog({
  departmentId,
  open,
  onOpenChange,
}: DepartmentDetailsDialogProps) {
  const departmentQuery =
    useDepartment(
      departmentId ?? "",
    );

  const department =
    departmentQuery.data?.data;

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Department details
          </DialogTitle>

          <DialogDescription>
            Department information
            and record status.
          </DialogDescription>
        </DialogHeader>

        {departmentQuery.isPending ? (
          <div className="space-y-4 py-2">
            <Skeleton className="h-8 w-52" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-16 w-full" />
          </div>
        ) : departmentQuery.isError ? (
          <div className="flex min-h-48 flex-col items-center justify-center text-center">
            <p className="font-medium">
              Unable to load department
            </p>

            <p className="text-muted-foreground mt-1 max-w-sm text-sm">
              {getApiErrorMessage(
                departmentQuery.error,
              )}
            </p>

            <Button
              type="button"
              variant="outline"
              className="mt-4"
              onClick={() =>
                departmentQuery.refetch()
              }
            >
              <RefreshCw className="size-4" />
              Retry
            </Button>
          </div>
        ) : department ? (
          <div className="space-y-6">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="text-xl font-semibold">
                  {department.name}
                </h3>

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

              <p className="text-muted-foreground mt-3 whitespace-pre-wrap text-sm">
                {department.description ||
                  "No description provided."}
              </p>
            </div>

            <div className="grid gap-4 border-t pt-5 sm:grid-cols-2">
              <div className="flex gap-3">
                <CalendarDays className="text-muted-foreground mt-0.5 size-4" />

                <div>
                  <p className="text-muted-foreground text-xs">
                    Created
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {formatDate(
                      department.createdAt,
                    )}
                  </p>
                </div>
              </div>

              <div className="flex gap-3">
                <CalendarDays className="text-muted-foreground mt-0.5 size-4" />

                <div>
                  <p className="text-muted-foreground text-xs">
                    Last updated
                  </p>

                  <p className="mt-1 text-sm font-medium">
                    {formatDate(
                      department.updatedAt,
                    )}
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}