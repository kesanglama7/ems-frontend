"use client";
import { useDeferredValue, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useAssignmentEmployees,
  useLeaveAssignments,
  useManageLeaveAssignments,
} from "../hooks/use-leave-assignments";
import {
  leaveAssignmentSchema,
  type LeaveAssignmentFormValues,
} from "../schemas/leave-assignment.schema";
import type { AssignmentLeaveType } from "../types/leave-assignment.types";
import type { AssignedEmployee } from "../types/leave-assignment.types";
import { EmployeeMultiSelect } from "./employee-multi-select";
export function LeaveTypeAssignmentButton({
  type,
}: {
  type: AssignmentLeaveType;
}) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button
        type="button"
        size="sm"
        variant="outline"
        onClick={() => setOpen(true)}
      >
        Manage employees
      </Button>
      {open && <TypeAssignments type={type} onClose={() => setOpen(false)} />}
    </>
  );
}
function TypeAssignments({
  type,
  onClose,
}: {
  type: AssignmentLeaveType;
  onClose: () => void;
}) {
  const form = useForm<LeaveAssignmentFormValues>({
    resolver: zodResolver(leaveAssignmentSchema),
    defaultValues: {
      leaveTypeId: type.id,
      employeeIds: [],
      action: type.isActive ? "assign" : "remove",
      days: 1,
    },
  });
  const action = useWatch({ control: form.control, name: "action" });
  const selectedIds = useWatch({ control: form.control, name: "employeeIds" });
  const assignments = useLeaveAssignments(type.id);
  const [search, setSearch] = useState("");
  const querySearch = useDeferredValue(search.trim());
  const employees = useAssignmentEmployees(querySearch, action === "assign");
  const mutation = useManageLeaveAssignments();
  const [selectedEmployees, setSelectedEmployees] = useState<
    Record<string, AssignedEmployee>
  >({});
  const [allocationDays, setAllocationDays] = useState<Record<string, number>>(
    {},
  );
  const assigned = assignments.data?.data ?? [];
  const assignedByEmployee = new Map(
    assigned.map((item) => [item.employeeId, item]),
  );
  const fetchedEmployees =
    employees.data?.pages.flatMap((page) => page.data) ?? [];
  const candidates =
    action === "assign"
      ? [
          ...assigned.map((item) => item.employee),
          ...fetchedEmployees.filter(
            (employee) =>
              !type.eligibleGender || employee.gender === type.eligibleGender,
          ),
        ]
      : assigned.map((item) => item.employee);
  const options = [
    ...new Map(candidates.map((employee) => [employee.id, employee])).values(),
  ].filter((employee) =>
    `${employee.firstName} ${employee.lastName} ${employee.employeeCode}`
      .toLowerCase()
      .includes(querySearch.toLowerCase()),
  );
  async function submit(values: LeaveAssignmentFormValues) {
    const allocations = values.employeeIds.map((employeeId) => ({
      employeeId,
      days:
        allocationDays[employeeId] ??
        Number(assignedByEmployee.get(employeeId)?.assignedDays ?? 1),
    }));
    if (
      values.action === "assign" &&
      allocations.some(
        ({ days }) =>
          !Number.isFinite(days) ||
          days < 0.5 ||
          days > 365 ||
          (!type.allowHalfDay && !Number.isInteger(days)),
      )
    ) {
      form.setError("days", {
        message: type.allowHalfDay
          ? "Each allocation must be between 0.5 and 365 days."
          : "Each allocation must be a whole number between 1 and 365 days.",
      });
      return;
    }
    try {
      await mutation.mutateAsync({
        ...values,
        ...(values.action === "assign" && { assignments: allocations }),
      });
      onClose();
    } catch {}
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-xl">
        <form className="space-y-5" onSubmit={form.handleSubmit(submit)}>
          <DialogHeader>
            <DialogTitle>{type.name} · Employees</DialogTitle>
            <DialogDescription>
              Assign or remove multiple employees at once.{" "}
              {assignments.isSuccess
                ? `${assigned.length} currently assigned.`
                : ""}
            </DialogDescription>
          </DialogHeader>
          <Controller
            control={form.control}
            name="action"
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="type-assignment-action">Action</FieldLabel>
                <Select
                  value={field.value}
                  disabled={mutation.isPending}
                  onValueChange={(value) => {
                    if (value) {
                      field.onChange(value);
                      form.setValue("employeeIds", []);
                      setSelectedEmployees({});
                      setAllocationDays({});
                      setSearch("");
                      mutation.reset();
                    }
                  }}
                >
                  <SelectTrigger id="type-assignment-action">
                    <SelectValue>
                      {field.value === "assign"
                        ? "Assign employees"
                        : "Remove employees"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assign" disabled={!type.isActive}>
                      Assign employees
                    </SelectItem>
                    <SelectItem value="remove">Remove employees</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          <Controller
            control={form.control}
            name="employeeIds"
            render={({ field, fieldState }) => (
              <Field data-invalid={fieldState.invalid}>
                <FieldLabel htmlFor="leave-assignment-employees">
                  Employees
                </FieldLabel>
                <EmployeeMultiSelect
                  key={action}
                  value={field.value}
                  onChange={(value) => {
                    field.onChange(value);
                    mutation.reset();
                  }}
                  onEmployeeToggle={(employee, checked) => {
                    setSelectedEmployees((current) => {
                      if (checked)
                        return { ...current, [employee.id]: employee };
                      const next = { ...current };
                      delete next[employee.id];
                      return next;
                    });
                    setAllocationDays((current) => {
                      if (checked)
                        return {
                          ...current,
                          [employee.id]: Number(
                            assignedByEmployee.get(employee.id)?.assignedDays ??
                              1,
                          ),
                        };
                      const next = { ...current };
                      delete next[employee.id];
                      return next;
                    });
                  }}
                  options={options}
                  search={search}
                  onSearch={setSearch}
                  disabled={mutation.isPending}
                  loading={
                    assignments.isPending ||
                    (action === "assign" && employees.isPending)
                  }
                  error={
                    assignments.isError ||
                    (action === "assign" && employees.isError)
                  }
                  retry={() => {
                    void assignments.refetch();
                    if (action === "assign") void employees.refetch();
                  }}
                  hasMore={action === "assign" && employees.hasNextPage}
                  loadingMore={employees.isFetchingNextPage}
                  loadMore={() => employees.fetchNextPage()}
                />
                <FieldDescription>
                  {action === "assign"
                    ? `Choose new employees or select an assigned employee to update their days.${type.eligibleGender ? ` Only ${type.eligibleGender.toLowerCase()} employees are shown.` : ""}`
                    : "Choose from employees currently assigned to this leave type."}
                </FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          {action === "assign" && selectedIds.length > 0 && (
            <Field data-invalid={Boolean(form.formState.errors.days)}>
              <FieldLabel>Individual day allocations</FieldLabel>
              <div className="space-y-2 rounded-lg border p-3">
                {selectedIds.map((employeeId) => {
                  const employee =
                    selectedEmployees[employeeId] ??
                    assignedByEmployee.get(employeeId)?.employee;
                  const name = employee
                    ? `${employee.firstName} ${employee.lastName}`.trim()
                    : employeeId;
                  const days =
                    allocationDays[employeeId] ??
                    Number(
                      assignedByEmployee.get(employeeId)?.assignedDays ?? 1,
                    );
                  return (
                    <div
                      key={employeeId}
                      className="grid items-center gap-2 sm:grid-cols-[1fr_9rem]"
                    >
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{name}</p>
                        {employee && (
                          <p className="text-xs text-muted-foreground">
                            {employee.employeeCode}
                            {assignedByEmployee.has(employeeId)
                              ? " · currently assigned"
                              : ""}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Input
                          aria-label={`Days allocated to ${name}`}
                          type="number"
                          min={type.allowHalfDay ? 0.5 : 1}
                          max={365}
                          step={type.allowHalfDay ? 0.5 : 1}
                          value={Number.isFinite(days) ? days : ""}
                          disabled={mutation.isPending}
                          onChange={(event) =>
                            setAllocationDays((current) => ({
                              ...current,
                              [employeeId]: event.target.valueAsNumber,
                            }))
                          }
                        />
                        <span className="text-xs text-muted-foreground">
                          days
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
              <FieldDescription>
                Each employee can receive a different compensatory leave
                balance. Saving an assigned employee updates their current-year
                total.
              </FieldDescription>
              <FieldError errors={[form.formState.errors.days]} />
            </Field>
          )}
          <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            {action === "assign"
              ? "Allocations replace the employee’s current-year total, but cannot be lower than used plus pending days."
              : "Pending leave blocks removal of the entire selection. Historical balances and leave records are preserved."}
          </p>
          {mutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              {getApiErrorMessage(mutation.error)}
            </p>
          )}
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={action === "remove" ? "destructive" : "default"}
              disabled={
                mutation.isPending ||
                assignments.isPending ||
                assignments.isError ||
                (action === "assign" &&
                  (!type.isActive || employees.isPending || employees.isError))
              }
            >
              {mutation.isPending
                ? "Saving…"
                : action === "assign"
                  ? "Assign selected"
                  : "Remove selected"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
