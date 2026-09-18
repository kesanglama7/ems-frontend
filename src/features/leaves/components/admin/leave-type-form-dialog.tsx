"use client";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";

import { useEffect } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";

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
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

import { useCreateLeaveType } from "../../hooks/use-leave-types";
import { useUpdateLeaveType } from "../../hooks/use-leave-types";
import {
  leaveTypeSchema,
  type LeaveTypeFormValues,
} from "../../schemas/leave-type.schema";
import type {
  CreateLeaveTypePayload,
  LeaveType,
  UpdateLeaveTypePayload,
} from "../../types/leave.types";

interface LeaveTypeFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  leaveType?: LeaveType | null;
}

export function LeaveTypeFormDialog({
  open,
  onOpenChange,
  leaveType,
}: LeaveTypeFormDialogProps) {
  const isEditing = Boolean(leaveType);

  const createMutation = useCreateLeaveType();

  const updateMutation = useUpdateLeaveType();

  const isPending = createMutation.isPending || updateMutation.isPending;

  const form = useForm<LeaveTypeFormValues>({
    resolver: zodResolver(leaveTypeSchema),
    defaultValues: {
      audience: "ALL",
      eligibleGender: "ALL",
      name: "",
      description: "",
      yearlyAllowance: 0,
      hasLimitedBalance: false,
      allowHalfDay: true,
      isEmployeeRequestable: true,
      isPaid: true,
    },
  });

  const limited = useWatch({
    control: form.control,
    name: "hasLimitedBalance",
  });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (leaveType) {
      form.reset({
        audience: leaveType.audience ?? "ALL",
        eligibleGender: leaveType.eligibleGender ?? "ALL",
        name: leaveType.name,
        description: leaveType.description ?? "",
        yearlyAllowance: Number(leaveType.yearlyAllowance),
        hasLimitedBalance: leaveType.hasLimitedBalance,
        allowHalfDay: leaveType.allowHalfDay,
        isEmployeeRequestable: leaveType.isEmployeeRequestable,
        isPaid: leaveType.isPaid,
      });

      return;
    }

    form.reset({
      audience: "ALL",
      eligibleGender: "ALL",
      name: "",
      description: "",
      yearlyAllowance: 0,
      hasLimitedBalance: false,
      allowHalfDay: true,
      isEmployeeRequestable: true,
      isPaid: true,
    });
  }, [open, leaveType, form]);

  async function onSubmit(values: LeaveTypeFormValues) {
    try {
      if (leaveType) {
        const payload: UpdateLeaveTypePayload = {
          audience: values.audience,
          eligibleGender:
            values.eligibleGender === "ALL" ? null : values.eligibleGender,
          name: values.name.trim(),
          description: values.description.trim(),
          yearlyAllowance: values.yearlyAllowance,
          ...(leaveType &&
          values.hasLimitedBalance === leaveType.hasLimitedBalance
            ? {}
            : { hasLimitedBalance: values.hasLimitedBalance }),
          allowHalfDay: values.allowHalfDay,
          isEmployeeRequestable: values.isEmployeeRequestable,
          isPaid: values.isPaid,
        };

        await updateMutation.mutateAsync({
          leaveTypeId: leaveType.id,
          payload,
        });
      } else {
        const description = values.description.trim();

        const payload: CreateLeaveTypePayload = {
          audience: values.audience,
          eligibleGender:
            values.eligibleGender === "ALL" ? null : values.eligibleGender,
          name: values.name.trim(),
          description: description || undefined,
          yearlyAllowance: values.yearlyAllowance,
          hasLimitedBalance: values.hasLimitedBalance,
          allowHalfDay: values.allowHalfDay,
          isEmployeeRequestable: values.isEmployeeRequestable,
          isPaid: values.isPaid,
        };

        await createMutation.mutateAsync(payload);
      }

      onOpenChange(false);
    } catch {
      // Mutation hooks show the API error; keep the form open.
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        if (isPending) {
          return;
        }

        onOpenChange(nextOpen);
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? "Edit leave type" : "Create leave type"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the leave type name and description."
              : "Add a new leave type available to employees."}
          </DialogDescription>
        </DialogHeader>

        <form id="leave-type-form" onSubmit={form.handleSubmit(onSubmit)}>
          <FieldGroup className="-space-y-3">
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Leave type name</FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    autoFocus
                    maxLength={100}
                    placeholder="Annual leave"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <Controller
                name="audience"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="leave-audience">
                      Available to
                    </FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        if (value) field.onChange(value);
                      }}
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id="leave-audience"
                        onBlur={field.onBlur}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue>
                          {
                            {
                              ALL: "All eligible employees",
                              SELECTED: "Selected employees only",
                            }[field.value]
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">
                          All eligible employees
                        </SelectItem>
                        <SelectItem value="SELECTED">
                          Selected employees only
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
              <Controller
                name="eligibleGender"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor="leave-gender">
                      Gender eligibility
                    </FieldLabel>
                    <Select
                      value={field.value}
                      onValueChange={(value) => {
                        if (value) field.onChange(value);
                      }}
                      disabled={isPending}
                    >
                      <SelectTrigger
                        id="leave-gender"
                        onBlur={field.onBlur}
                        aria-invalid={fieldState.invalid}
                      >
                        <SelectValue>
                          {
                            {
                              ALL: "All genders",
                              MALE: "Male only",
                              FEMALE: "Female only",
                              OTHER: "Other only",
                            }[field.value]
                          }
                        </SelectValue>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ALL">All genders</SelectItem>
                        <SelectItem value="MALE">Male only</SelectItem>
                        <SelectItem value="FEMALE">Female only</SelectItem>
                        <SelectItem value="OTHER">Other only</SelectItem>
                      </SelectContent>
                    </Select>
                    <FieldError errors={[fieldState.error]} />
                  </Field>
                )}
              />
            </div>
            <hr className="border-t" />

            <div className="flex flex-col gap-y-3">
              <Controller
                name="allowHalfDay"
                control={form.control}
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <FieldLabel>Half day</FieldLabel>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </Field>
                )}
              />
              <Controller
                name="isPaid"
                control={form.control}
                render={({ field }) => (
                  <Field orientation="horizontal">
                    <FieldLabel>Paid</FieldLabel>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </Field>
                )}
              />

            <Controller
              name="hasLimitedBalance"
              control={form.control}
              render={({ field }) => (
                <Field orientation="horizontal">
                  <div className="flex-1">
                    <FieldLabel>Limited yearly balance</FieldLabel>
                  </div>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </Field>
              )}
            />
            {limited && (
              <Controller
                name="yearlyAllowance"
                control={form.control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Days per year</FieldLabel>
                    <Input
                      {...field}
                      type="number"
                      min="0"
                      step="0.5"
                      onChange={(event) =>
                        field.onChange(event.target.valueAsNumber)
                      }
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            )}
            </div>
            <hr className="border-t" />
            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Description</FieldLabel>

                  <Textarea
                    {...field}
                    id={field.name}
                    rows={4}
                    maxLength={500}
                    placeholder="Paid time off for vacation."
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>

          <Button type="submit" form="leave-type-form" disabled={isPending}>
            {isPending && <LoaderCircle className="size-4 animate-spin" />}

            {isPending
              ? isEditing
                ? "Saving..."
                : "Creating..."
              : isEditing
                ? "Update leave type"
                : "Create leave type"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
