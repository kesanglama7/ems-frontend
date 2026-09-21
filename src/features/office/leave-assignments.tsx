"use client";
import { useState } from "react";
import { UserPlus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import EmployeeSearchSelect from "@/components/shared/admin/employee-search-select";
import { api } from "@/lib/api";
import { useConfirmDialogStore } from "@/stores/confirm-dialog.store";
import { useOfficeMutation, useOfficeQuery, type LeaveAssignment } from "./api";
import {
  QueryFeedback,
  EmptyState,
} from "../../components/shared/admin/shared";
import type { LeaveType } from "@/features/leaves/types/leave.types";

export function LeaveAssignmentButton({ type }: { type: LeaveType }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(true)}
        disabled={!type.isActive}
      >
        <UserPlus className="size-4" />
        Assign employees
      </Button>
      {open && <LeaveAssignments type={type} onClose={() => setOpen(false)} />}
    </>
  );
}
function LeaveAssignments({
  type,
  onClose,
}: {
  type: LeaveType;
  onClose: () => void;
}) {
  const [employeeId, setEmployeeId] = useState("");
  const [days, setDays] = useState(1);
  const confirm = useConfirmDialogStore((s) => s.confirm);
  const query = useOfficeQuery<LeaveAssignment[]>(
    "leave-assignments",
    `/leave-types/${type.id}/assignments`,
  );
  const groups = ["leave-assignments", "leaves"];
  const assign = useOfficeMutation(
    (id: string) =>
      api.post(`/leave-types/${type.id}/assignments`, {
        assignments: [{ employeeId: id, days }],
      }),
    "Employee assigned.",
    groups,
  );
  const remove = useOfficeMutation(
    (id: string) =>
      api.delete(`/leave-types/${type.id}/assignments`, {
        data: { employeeIds: [id] },
      }),
    "Leave access removed.",
    groups,
  );
  async function submit() {
    try {
      await assign.mutateAsync(employeeId);
      setEmployeeId("");
    } catch {}
  }
  return (
    <Dialog
      open
      onOpenChange={(v) => {
        if (!v && !assign.isPending && !remove.isPending) onClose();
      }}
    >
      <DialogContent className="max-h-[85dvh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{type.name} · Employees</DialogTitle>
          <DialogDescription>
            Only assigned employees who meet the gender requirement can use this
            leave type.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 rounded-lg border p-4">
          <label className="text-sm font-medium">Choose employee</label>
          <EmployeeSearchSelect
            value={employeeId}
            onChange={setEmployeeId}
            disabled={assign.isPending}
          />
          <label
            htmlFor="legacy-leave-allocation"
            className="text-sm font-medium"
          >
            Days allocated
          </label>
          <Input
            id="legacy-leave-allocation"
            type="number"
            min={type.allowHalfDay ? 0.5 : 1}
            max={365}
            step={type.allowHalfDay ? 0.5 : 1}
            value={days}
            onChange={(event) => setDays(event.target.valueAsNumber)}
            disabled={assign.isPending}
          />
          <Button
            disabled={
              !employeeId ||
              !Number.isFinite(days) ||
              days < (type.allowHalfDay ? 0.5 : 1) ||
              (!type.allowHalfDay && !Number.isInteger(days)) ||
              assign.isPending
            }
            onClick={() => void submit()}
          >
            {assign.isPending ? "Assigning…" : "Grant access"}
          </Button>
          <p className="text-xs text-muted-foreground">
            This allocation is stored specifically for the selected employee.
            Assigning them again updates their current-year total.
          </p>
        </div>
        <QueryFeedback
          pending={query.isPending}
          error={query.isError}
          retry={query.refetch}
        />
        {query.isSuccess &&
          (query.data.data.length ? (
            <ul className="divide-y rounded-lg border">
              {query.data.data.map((a) => (
                <li
                  key={a.employeeId}
                  className="flex items-center justify-between gap-3 p-3"
                >
                  <div>
                    <p className="text-sm font-medium">
                      {a.employee.firstName} {a.employee.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {a.employee.employeeCode} · {Number(a.assignedDays)} days
                    </p>
                  </div>
                  <Button
                    size="icon"
                    variant="ghost"
                    disabled={remove.isPending}
                    aria-label={`Remove access for ${a.employee.firstName}`}
                    onClick={() =>
                      confirm({
                        title: "Remove leave access?",
                        description:
                          "This employee will no longer be able to request this leave. Historical records are retained.",
                        confirmLabel: "Remove access",
                        destructive: true,
                        onConfirm: async () => {
                          await remove.mutateAsync(a.employeeId);
                        },
                      })
                    }
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <EmptyState>No employees assigned yet.</EmptyState>
          ))}
      </DialogContent>
    </Dialog>
  );
}
