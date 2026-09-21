"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { getInitials } from "@/lib/name-shorten";
import { useConfirmDialogStore } from "@/stores/confirm-dialog.store";
import {
  useLeaveAssignments,
  useManageLeaveAssignments,
} from "../hooks/use-leave-assignments";
import type { AssignmentLeaveType } from "../types/leave-assignment.types";
import { LeaveTypeAssignmentButton } from "./leave-type-assignment-button";

const PREVIEW_COUNT = 4;

export function AssignedEmployees({ type }: { type: AssignmentLeaveType }) {
  const [expanded, setExpanded] = useState(false);
  const query = useLeaveAssignments(
    type.audience === "SELECTED" ? type.id : "",
  );
  const remove = useManageLeaveAssignments();
  const confirm = useConfirmDialogStore((state) => state.confirm);

  if (type.audience !== "SELECTED") {
    return (
      <p className="text-sm text-muted-foreground">All eligible employees</p>
    );
  }

  const assignments = [...(query.data?.data ?? [])].sort((a, b) =>
    `${a.employee.firstName} ${a.employee.lastName}`.localeCompare(
      `${b.employee.firstName} ${b.employee.lastName}`,
    ),
  );
  const visible = expanded ? assignments : assignments.slice(0, PREVIEW_COUNT);

  function confirmRemove(employeeId: string, name: string) {
    confirm({
      title: `Remove ${name}?`,
      description: `Remove ${name}'s access to ${type.name}? Existing leave and balance history stays. Pending leave must be reviewed first.`,
      confirmLabel: "Remove access",
      destructive: true,
      onConfirm: async () => {
        await remove.mutateAsync({
          leaveTypeId: type.id,
          employeeIds: [employeeId],
          action: "remove",
        });
      },
    });
  }

  return (
    <div className="min-w-0 space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-medium">
          {query.isSuccess
            ? `${assignments.length} assigned ${assignments.length === 1 ? "employee" : "employees"}`
            : "Assigned employees"}
        </p>
        <LeaveTypeAssignmentButton type={type} />
      </div>

      {query.isPending && (
        <p role="status" className="text-xs text-muted-foreground">
          Loading employees…
        </p>
      )}
      {query.isError && (
        <div
          role="alert"
          className="flex flex-wrap items-center gap-2 text-xs text-destructive"
        >
          Could not load assigned employees.
          <Button
            type="button"
            size="sm"
            variant="outline"
            onClick={() => void query.refetch()}
          >
            Retry
          </Button>
        </div>
      )}
      {query.isSuccess && assignments.length === 0 && (
        <p className="text-xs text-muted-foreground">
          No employees assigned yet.
        </p>
      )}
      {query.isSuccess && assignments.length > 0 && (
        <>
          <ul
            className="flex flex-wrap gap-1.5"
            aria-label={`Employees assigned to ${type.name}`}
          >
            {visible.map(({ employee, assignedDays }) => {
              const name = `${employee.firstName} ${employee.lastName}`.trim();
              return (
                <li
                  key={employee.id}
                  className="flex max-w-full items-center gap-1.5 rounded-full border bg-muted/30 py-1 pl-1 pr-1.5 text-xs"
                >
                  <Avatar className="size-6 shrink-0">
                    <AvatarFallback className="text-[10px]">
                      {getInitials(employee.firstName, employee.lastName)}
                    </AvatarFallback>
                  </Avatar>
                  <span
                    className="min-w-0 truncate"
                    title={`${name} · ${employee.employeeCode}`}
                  >
                    {name}{" "}
                    <span className="text-muted-foreground">
                      · {employee.employeeCode} · {Number(assignedDays)} days
                    </span>
                  </span>
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    className="size-6 shrink-0 rounded-full"
                    aria-label={`Remove ${name} from ${type.name}`}
                    title={`Remove ${name}`}
                    disabled={remove.isPending}
                    onClick={() => confirmRemove(employee.id, name)}
                  >
                    <X className="size-3.5" />
                  </Button>
                </li>
              );
            })}
          </ul>
          {assignments.length > PREVIEW_COUNT && (
            <Button
              type="button"
              size="sm"
              variant="link"
              className="h-auto p-0"
              onClick={() => setExpanded((value) => !value)}
            >
              {expanded
                ? "Show fewer"
                : `Show all ${assignments.length} employees`}
            </Button>
          )}
        </>
      )}
    </div>
  );
}
