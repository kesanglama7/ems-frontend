"use client";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Field,
  FieldLabel,
  FieldError,
  FieldDescription,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/api-error";
import {
  useAssignmentLeaveTypes,
  useManageLeaveAssignments,
} from "../hooks/use-leave-assignments";
import {
  leaveAssignmentSchema,
  type LeaveAssignmentFormValues,
} from "../schemas/leave-assignment.schema";
export function LeaveAssignmentDialog({
  employeeIds,
  onClose,
  onSuccess,
}: {
  employeeIds: string[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const typesQuery = useAssignmentLeaveTypes();
  const mutation = useManageLeaveAssignments();
  const form = useForm<LeaveAssignmentFormValues>({
    resolver: zodResolver(leaveAssignmentSchema),
    defaultValues: {
      employeeIds: [...employeeIds],
      leaveTypeId: "",
      action: "assign",
      days: 1,
    },
  });
  const action = useWatch({ control: form.control, name: "action" });
  const selectedTypeId = useWatch({
    control: form.control,
    name: "leaveTypeId",
  });
  const types = (typesQuery.data?.data ?? []).filter(
    (type) =>
      type.audience === "SELECTED" && (action === "remove" || type.isActive),
  );
  const selectedType = types.find((type) => type.id === selectedTypeId);
  async function submit(values: LeaveAssignmentFormValues) {
    if (!selectedType) {
      form.setError("leaveTypeId", {
        message: "Choose an available leave type.",
      });
      return;
    }
    if (
      values.action === "assign" &&
      !selectedType.allowHalfDay &&
      !Number.isInteger(values.days)
    ) {
      form.setError("days", {
        message: "This leave type only supports whole-day allocations.",
      });
      return;
    }
    try {
      await mutation.mutateAsync(values);
      onSuccess();
    } catch {
      /* Keep selections and dialog open for correction. */
    }
  }
  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !mutation.isPending) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <form onSubmit={form.handleSubmit(submit)} className="space-y-5">
          <DialogHeader>
            <DialogTitle>Manage leave access</DialogTitle>
            <DialogDescription>
              {employeeIds.length} employee{employeeIds.length === 1 ? "" : "s"}{" "}
              selected. Choose one restricted leave type for this group.
            </DialogDescription>
          </DialogHeader>
          <Controller
            name="action"
            control={form.control}
            render={({ field }) => (
              <Field>
                <FieldLabel htmlFor="leave-assignment-action">
                  Action
                </FieldLabel>
                <Select
                  value={field.value}
                  onValueChange={(value) => {
                    if (value) {
                      field.onChange(value);
                      form.setValue("leaveTypeId", "");
                      mutation.reset();
                    }
                  }}
                  disabled={mutation.isPending}
                >
                  <SelectTrigger id="leave-assignment-action">
                    <SelectValue>
                      {field.value === "assign"
                        ? "Assign leave access"
                        : "Remove leave access"}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="assign">Assign leave access</SelectItem>
                    <SelectItem value="remove">Remove leave access</SelectItem>
                  </SelectContent>
                </Select>
              </Field>
            )}
          />
          {typesQuery.isPending ? (
            <p role="status" className="text-sm text-muted-foreground">
              Loading leave types…
            </p>
          ) : typesQuery.isError ? (
            <div role="alert" className="space-y-2 text-sm">
              <p>{getApiErrorMessage(typesQuery.error)}</p>
              <Button
                type="button"
                variant="outline"
                onClick={() => void typesQuery.refetch()}
              >
                Retry
              </Button>
            </div>
          ) : (
            <Controller
              name="leaveTypeId"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="assignment-leave-type">
                    Leave type
                  </FieldLabel>
                  <Select
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value ?? "");
                      mutation.reset();
                    }}
                    disabled={mutation.isPending || !types.length}
                  >
                    <SelectTrigger
                      id="assignment-leave-type"
                      aria-invalid={fieldState.invalid}
                      onBlur={field.onBlur}
                    >
                      <SelectValue placeholder="Choose a leave type">
                        {selectedType?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {types.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
                          {!type.isActive ? " (inactive)" : ""}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FieldDescription>
                    {!types.length
                      ? "No available leave types with Selected employees audience."
                      : selectedType?.eligibleGender
                        ? `Only employees with gender ${selectedType.eligibleGender.toLowerCase()} are eligible.`
                        : "Only leave types for selected employees are listed."}
                  </FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          )}
          {action === "assign" && (
            <Controller
              name="days"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="leave-assignment-days">
                    Days for each selected employee
                  </FieldLabel>
                  <Input
                    id="leave-assignment-days"
                    type="number"
                    min={selectedType?.allowHalfDay === false ? 1 : 0.5}
                    max={365}
                    step={selectedType?.allowHalfDay === false ? 1 : 0.5}
                    value={Number.isFinite(field.value) ? field.value : ""}
                    onBlur={field.onBlur}
                    onChange={(event) =>
                      field.onChange(event.target.valueAsNumber)
                    }
                    disabled={mutation.isPending}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    This bulk action gives the same allocation to everyone in
                    the current selection. You can edit employees individually
                    from the leave type page.
                  </FieldDescription>
                  <FieldError errors={[fieldState.error]} />
                </Field>
              )}
            />
          )}
          <p className="rounded-lg border bg-muted/30 p-3 text-sm text-muted-foreground">
            {action === "assign"
              ? "New assignments are created and existing employees are updated to this allocation. Used and pending days are protected. If any employee is ineligible, nobody is changed."
              : "Pending leave must be reviewed before removing access. Historical balances and leave records are preserved. If any employee has pending leave, nobody is removed."}
          </p>
          {mutation.isError && (
            <p role="alert" className="text-sm text-destructive">
              {getApiErrorMessage(mutation.error)}
            </p>
          )}
          <FieldError errors={[form.formState.errors.employeeIds]} />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={mutation.isPending}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={action === "remove" ? "destructive" : "default"}
              disabled={
                mutation.isPending ||
                typesQuery.isPending ||
                typesQuery.isError ||
                !selectedType
              }
            >
              {mutation.isPending
                ? "Saving…"
                : action === "assign"
                  ? "Assign leave access"
                  : "Remove leave access"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
