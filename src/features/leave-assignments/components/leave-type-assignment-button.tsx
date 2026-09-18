"use client";
import { useDeferredValue, useState } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
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
    },
  });
  const action = useWatch({ control: form.control, name: "action" });
  const assignments = useLeaveAssignments(type.id);
  const [search, setSearch] = useState("");
  const querySearch = useDeferredValue(search.trim());
  const employees = useAssignmentEmployees(querySearch, action === "assign");
  const mutation = useManageLeaveAssignments();
  const assigned = assignments.data?.data ?? [];
  const assignedIds = new Set(assigned.map((item) => item.employeeId));
  const options =
    action === "assign"
      ? (employees.data?.pages.flatMap((page) => page.data) ?? []).filter(
          (employee) =>
            !assignedIds.has(employee.id) &&
            (!type.eligibleGender || employee.gender === type.eligibleGender),
        )
      : assigned
          .map((item) => item.employee)
          .filter((employee) =>
            `${employee.firstName} ${employee.lastName} ${employee.employeeCode}`
              .toLowerCase()
              .includes(querySearch.toLowerCase()),
          );
  async function submit(values: LeaveAssignmentFormValues) {
    try {
      await mutation.mutateAsync(values);
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
                    ? `Already assigned employees are hidden.${type.eligibleGender ? ` Only ${type.eligibleGender.toLowerCase()} employees are shown.` : ""}`
                    : "Choose from employees currently assigned to this leave type."}
                </FieldDescription>
                <FieldError errors={[fieldState.error]} />
              </Field>
            )}
          />
          <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            {action === "assign"
              ? "Existing balances are preserved. Default balances are initialized for newly assigned employees."
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
