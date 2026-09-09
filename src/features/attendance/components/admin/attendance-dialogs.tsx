"use client";

import {
  Controller,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Pencil,
  Plus,
} from "lucide-react";

import { Button } from "@/components/ui/button";
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
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";


import {
  useCreateAdminAttendance,
  useUpdateAdminAttendance,
} from "../../hooks/use-attendance";
import {
  correctAttendanceSchema,
  createAttendanceSchema,
  type CorrectAttendanceFormValues,
  type CreateAttendanceFormValues,
} from "../../schemas/attendance.schema";
import EmployeeSearchSelect from "@/components/shared/admin/employee-search-select";


interface CreateAttendanceDialogProps {
  open: boolean;
  onOpenChange: (
    open: boolean,
  ) => void;
  onSuccess: () => void;
}

export function CreateAttendanceDialog({
  open,
  onOpenChange,
  onSuccess,
}: CreateAttendanceDialogProps) {
  const createMutation =
    useCreateAdminAttendance();

  const form =
    useForm<CreateAttendanceFormValues>(
      {
        resolver: zodResolver(
          createAttendanceSchema,
        ),
        defaultValues: {
          employeeId: "",
          checkInAt: "",
          checkOutAt: "",
          reason: "",
        },
      },
    );

  function handleOpenChange(
    nextOpen: boolean,
  ) {
    if (
      createMutation.isPending
    ) {
      return;
    }

    onOpenChange(nextOpen);

    if (!nextOpen) {
      form.reset();
    }
  }

  async function onSubmit(
    values: CreateAttendanceFormValues,
  ) {
    try {
      await createMutation.mutateAsync(
        {
          employeeId:
            values.employeeId,

          checkInAt: new Date(
            values.checkInAt,
          ).toISOString(),

          checkOutAt:
            values.checkOutAt
              ? new Date(
                  values.checkOutAt,
                ).toISOString()
              : undefined,

          reason: values.reason,
        },
      );

      form.reset();

      onOpenChange(false);

      onSuccess();
    } catch {
      // Mutation already handles toast errors.
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={
        handleOpenChange
      }
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Create Manual Attendance
          </DialogTitle>

          <DialogDescription>
            Add an attendance record
            manually for an employee.
          </DialogDescription>
        </DialogHeader>

        <form
          id="create-attendance-form"
          className="space-y-5"
          onSubmit={form.handleSubmit(
            onSubmit,
          )}
        >
          <Controller
            name="employeeId"
            control={form.control}
            render={({
              field,
              fieldState,
            }) => (
              <Field
                data-invalid={
                  fieldState.invalid
                }
              >
                <FieldLabel>
                  Employee
                </FieldLabel>

                <EmployeeSearchSelect
                  value={
                    field.value
                  }
                  onChange={
                    field.onChange
                  }
                  disabled={
                    createMutation.isPending
                  }
                />

                {fieldState.invalid && (
                  <FieldError
                    errors={[
                      fieldState.error,
                    ]}
                  />
                )}
              </Field>
            )}
          />

          <Controller
            name="checkInAt"
            control={form.control}
            render={({
              field,
              fieldState,
            }) => (
              <Field
                data-invalid={
                  fieldState.invalid
                }
              >
                <FieldLabel>
                  Check-in Time
                </FieldLabel>

                <Input
                  type="datetime-local"
                  {...field}
                  disabled={
                    createMutation.isPending
                  }
                  onChange={(
                    event,
                  ) =>
                    field.onChange(
                      event.target
                        .value,
                    )
                  }
                />

                {fieldState.invalid && (
                  <FieldError
                    errors={[
                      fieldState.error,
                    ]}
                  />
                )}
              </Field>
            )}
          />

          <Controller
            name="checkOutAt"
            control={form.control}
            render={({
              field,
              fieldState,
            }) => (
              <Field
                data-invalid={
                  fieldState.invalid
                }
              >
                <FieldLabel>
                  Check-out Time{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </FieldLabel>

                <Input
                  type="datetime-local"
                  {...field}
                  value={
                    field.value || ""
                  }
                  disabled={
                    createMutation.isPending
                  }
                  onChange={(
                    event,
                  ) =>
                    field.onChange(
                      event.target
                        .value ||
                        undefined,
                    )
                  }
                />

                {fieldState.invalid && (
                  <FieldError
                    errors={[
                      fieldState.error,
                    ]}
                  />
                )}
              </Field>
            )}
          />

          <Controller
            name="reason"
            control={form.control}
            render={({
              field,
              fieldState,
            }) => (
              <Field
                data-invalid={
                  fieldState.invalid
                }
              >
                <FieldLabel>
                  Reason
                </FieldLabel>

                <Textarea
                  {...field}
                  rows={3}
                  maxLength={500}
                  placeholder="Why is this attendance being created manually?"
                  disabled={
                    createMutation.isPending
                  }
                  onChange={(
                    event,
                  ) =>
                    field.onChange(
                      event.target
                        .value,
                    )
                  }
                />

                <div className="text-right text-xs text-muted-foreground">
                  {
                    field.value
                      .length
                  }
                  /500
                </div>

                {fieldState.invalid && (
                  <FieldError
                    errors={[
                      fieldState.error,
                    ]}
                  />
                )}
              </Field>
            )}
          />
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={
              createMutation.isPending
            }
            onClick={() =>
              handleOpenChange(
                false,
              )
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="create-attendance-form"
            disabled={
              createMutation.isPending
            }
          >
            <Plus className="size-4" />

            {createMutation.isPending
              ? "Creating..."
              : "Create"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─────────────────────────────────────────────────────────────
// Correct Attendance Dialog
// ─────────────────────────────────────────────────────────────

interface CorrectAttendanceDialogProps {
  open: boolean;
  onOpenChange: (
    open: boolean,
  ) => void;
  attendanceId: string;
  defaultCheckInAt?: string;
  defaultCheckOutAt?: string;
  onSuccess: () => void;
}

export function CorrectAttendanceDialog({
  open,
  onOpenChange,
  attendanceId,
  defaultCheckInAt,
  defaultCheckOutAt,
  onSuccess,
}: CorrectAttendanceDialogProps) {
  const updateMutation =
    useUpdateAdminAttendance();

  const defaultCheckInLocal =
    defaultCheckInAt
      ? new Date(
          defaultCheckInAt,
        )
          .toISOString()
          .slice(0, 16)
      : "";

  const defaultCheckOutLocal =
    defaultCheckOutAt
      ? new Date(
          defaultCheckOutAt,
        )
          .toISOString()
          .slice(0, 16)
      : "";

  const form =
    useForm<CorrectAttendanceFormValues>(
      {
        resolver: zodResolver(
          correctAttendanceSchema,
        ),
        defaultValues: {
          checkInAt:
            defaultCheckInLocal,
          checkOutAt:
            defaultCheckOutLocal,
          reason: "",
        },
      },
    );

  function handleOpenChange(
    nextOpen: boolean,
  ) {
    if (
      updateMutation.isPending
    ) {
      return;
    }

    /*
     * Populate the form whenever the
     * dialog is opened.
     *
     * This avoids mutating an object
     * created using useMemo.
     */
    if (nextOpen) {
      form.reset({
        checkInAt:
          defaultCheckInLocal,
        checkOutAt:
          defaultCheckOutLocal,
        reason: "",
      });
    }

    onOpenChange(nextOpen);

    if (!nextOpen) {
      form.reset();
    }
  }

  async function onSubmit(
    values: CorrectAttendanceFormValues,
  ) {
    try {
      await updateMutation.mutateAsync(
        {
          attendanceId,

          payload: {
            checkInAt:
              values.checkInAt
                ? new Date(
                    values.checkInAt,
                  ).toISOString()
                : undefined,

            checkOutAt:
              values.checkOutAt
                ? new Date(
                    values.checkOutAt,
                  ).toISOString()
                : undefined,

            reason:
              values.reason,
          },
        },
      );

      form.reset();

      onOpenChange(false);

      onSuccess();
    } catch {
      // Mutation already handles toast errors.
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={
        handleOpenChange
      }
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Correct Attendance
          </DialogTitle>

          <DialogDescription>
            Fix check-in or check-out
            times for this attendance
            record.
          </DialogDescription>
        </DialogHeader>

        <form
          id="correct-attendance-form"
          className="space-y-5"
          onSubmit={form.handleSubmit(
            onSubmit,
          )}
        >
          <Controller
            name="checkInAt"
            control={form.control}
            render={({
              field,
              fieldState,
            }) => (
              <Field
                data-invalid={
                  fieldState.invalid
                }
              >
                <FieldLabel>
                  Check-in Time
                </FieldLabel>

                <Input
                  type="datetime-local"
                  {...field}
                  value={
                    field.value || ""
                  }
                  disabled={
                    updateMutation.isPending
                  }
                  onChange={(
                    event,
                  ) =>
                    field.onChange(
                      event.target
                        .value ||
                        undefined,
                    )
                  }
                />

                {fieldState.invalid && (
                  <FieldError
                    errors={[
                      fieldState.error,
                    ]}
                  />
                )}
              </Field>
            )}
          />

          <Controller
            name="checkOutAt"
            control={form.control}
            render={({
              field,
              fieldState,
            }) => (
              <Field
                data-invalid={
                  fieldState.invalid
                }
              >
                <FieldLabel>
                  Check-out Time{" "}
                  <span className="font-normal text-muted-foreground">
                    (optional)
                  </span>
                </FieldLabel>

                <Input
                  type="datetime-local"
                  {...field}
                  value={
                    field.value || ""
                  }
                  disabled={
                    updateMutation.isPending
                  }
                  onChange={(
                    event,
                  ) =>
                    field.onChange(
                      event.target
                        .value ||
                        undefined,
                    )
                  }
                />

                {fieldState.invalid && (
                  <FieldError
                    errors={[
                      fieldState.error,
                    ]}
                  />
                )}
              </Field>
            )}
          />

          <Controller
            name="reason"
            control={form.control}
            render={({
              field,
              fieldState,
            }) => (
              <Field
                data-invalid={
                  fieldState.invalid
                }
              >
                <FieldLabel>
                  Reason
                </FieldLabel>

                <Textarea
                  {...field}
                  rows={3}
                  maxLength={500}
                  placeholder="Why is this correction being made?"
                  disabled={
                    updateMutation.isPending
                  }
                  onChange={(
                    event,
                  ) =>
                    field.onChange(
                      event.target
                        .value,
                    )
                  }
                />

                <div className="text-right text-xs text-muted-foreground">
                  {
                    field.value
                      .length
                  }
                  /500
                </div>

                {fieldState.invalid && (
                  <FieldError
                    errors={[
                      fieldState.error,
                    ]}
                  />
                )}
              </Field>
            )}
          />
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={
              updateMutation.isPending
            }
            onClick={() =>
              handleOpenChange(
                false,
              )
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="correct-attendance-form"
            disabled={
              updateMutation.isPending
            }
          >
            <Pencil className="size-4" />

            {updateMutation.isPending
              ? "Saving..."
              : "Save Correction"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}