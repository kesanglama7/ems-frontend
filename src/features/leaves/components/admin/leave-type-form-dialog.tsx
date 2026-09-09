"use client";

import { useEffect } from "react";
import {
  Controller,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
import { toast } from "sonner";

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
import { getApiErrorMessage } from "@/lib/api-error";

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

  const createMutation =
    useCreateLeaveType();

  const updateMutation =
    useUpdateLeaveType();

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending;

  const form =
    useForm<LeaveTypeFormValues>({
      resolver: zodResolver(
        leaveTypeSchema,
      ),
      defaultValues: {
        name: "",
        description: "",
        yearlyAllowance: 0,
        hasLimitedBalance: false,
        allowHalfDay: true,
        isEmployeeRequestable: true,
        isPaid: true,
      },
    });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (leaveType) {
      form.reset({
        name: leaveType.name,
        description:
          leaveType.description ?? "",
        yearlyAllowance: leaveType.yearlyAllowance,
        hasLimitedBalance: leaveType.hasLimitedBalance,
        allowHalfDay: leaveType.allowHalfDay,
        isEmployeeRequestable: leaveType.isEmployeeRequestable,
        isPaid: leaveType.isPaid,
      });

      return;
    }

    form.reset({
      name: "",
      description: "",
      yearlyAllowance: 0,
      hasLimitedBalance: false,
      allowHalfDay: true,
      isEmployeeRequestable: true,
      isPaid: true,
    });
  }, [
    open,
    leaveType,
    form,
  ]);

  async function onSubmit(
    values: LeaveTypeFormValues,
  ) {
    try {
      if (leaveType) {
        const payload:
          UpdateLeaveTypePayload = {
          name: values.name.trim(),
          description:
            values.description.trim(),
          yearlyAllowance: values.yearlyAllowance,
          hasLimitedBalance: values.hasLimitedBalance,
          allowHalfDay: values.allowHalfDay,
          isEmployeeRequestable: values.isEmployeeRequestable,
          isPaid: values.isPaid,
        };

        const response =
          await updateMutation.mutateAsync({
            leaveTypeId:
              leaveType.id,
            payload,
          });

      } else {
        const description =
          values.description.trim();

        const payload:
          CreateLeaveTypePayload = {
          name: values.name.trim(),
          description:
            description ||
            undefined,
          yearlyAllowance: values.yearlyAllowance,
          hasLimitedBalance: values.hasLimitedBalance,
          allowHalfDay: values.allowHalfDay,
          isEmployeeRequestable: values.isEmployeeRequestable,
          isPaid: values.isPaid,
        };

        const response =
          await createMutation.mutateAsync(
            payload,
          );

      }

      onOpenChange(false);
    } catch (error) {
      toast.error(
        getApiErrorMessage(error),
      );
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
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? "Edit leave type"
              : "Create leave type"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the leave type name and description."
              : "Add a new leave type available to employees."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="leave-type-form"
          onSubmit={form.handleSubmit(
            onSubmit,
          )}
        >
          <FieldGroup className="-space-y-2">
            <Controller
              name="name"
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
                  <FieldLabel
                    htmlFor={
                      field.name
                    }
                  >
                    Leave type name
                  </FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    autoFocus
                    maxLength={100}
                    placeholder="Annual leave"
                    aria-invalid={
                      fieldState.invalid
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
              name="hasLimitedBalance" 
              control={form.control} 
              render={({ field }) => 
                <Field orientation="horizontal">
                  <div className="flex-1">
                    <FieldLabel>Limited yearly balance</FieldLabel>
                  </div>
                  <Switch checked={field.value} onCheckedChange={field.onChange}/>
                </Field>} 
            />
              {form.watch("hasLimitedBalance") && 
                <Controller 
                  name="yearlyAllowance" 
                  control={form.control} render={({ field, fieldState }) => 
                    <Field data-invalid={fieldState.invalid}>
                      <FieldLabel>Days per year</FieldLabel>
                      <Input {...field} type="number" min="0" step="0.5" onChange={(event) => field.onChange(event.target.valueAsNumber)} aria-invalid={fieldState.invalid}/>
                      {fieldState.invalid && <FieldError errors={[fieldState.error]}/>}
                    </Field>} 
                />}
              <hr className="border-t" />
              <div className="grid gap-4 sm:grid-cols-2">
                <Controller 
                  name="allowHalfDay" 
                  control={form.control} render={({ field }) => 
                    <Field orientation="horizontal">
                      <FieldLabel>Half day</FieldLabel>
                      <Switch checked={field.value} onCheckedChange={field.onChange}/>
                    </Field>} 
                />
                <Controller 
                name="isEmployeeRequestable" 
                control={form.control} render={({ field }) =>
                  <Field orientation="horizontal">
                    <FieldLabel>Employee request</FieldLabel>
                    <Switch checked={field.value} onCheckedChange={field.onChange}/>
                  </Field>} 
                />
                <Controller 
                name="isPaid" 
                control={form.control} 
                render={({ field }) => 
                  <Field orientation="horizontal">
                    <FieldLabel>Paid</FieldLabel>
                    <Switch checked={field.value} onCheckedChange={field.onChange}/>
                  </Field>}
                />
              </div>
            <hr className="border-t" />
            <Controller
              name="description"
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
                  <FieldLabel
                    htmlFor={
                      field.name
                    }
                  >
                    Description
                  </FieldLabel>

                  <Textarea
                    {...field}
                    id={field.name}
                    rows={4}
                    maxLength={500}
                    placeholder="Paid time off for vacation."
                    aria-invalid={
                      fieldState.invalid
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
          </FieldGroup>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={isPending}
            onClick={() =>
              onOpenChange(false)
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="leave-type-form"
            disabled={isPending}
          >
            {isPending && (
              <LoaderCircle className="size-4 animate-spin" />
            )}

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
