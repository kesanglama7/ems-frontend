"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getApiErrorMessage } from "@/lib/api-error";
import { getTodayDate } from "@/lib/general";

import { useCreateLeaveRequest } from "../../hooks/use-my-leaves";
import { useLeaveTypes } from "../../hooks/use-leave-types";
import {
  createLeaveRequestSchema,
  type CreateLeaveRequestFormValues,
} from "../../schemas/create-leave-request.schema";

interface CreateLeaveDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateLeaveDialog({
  open,
  onOpenChange,
}: CreateLeaveDialogProps) {
  const { mutateAsync, isPending } = useCreateLeaveRequest();
  const { data: leaveTypesQuery } = useLeaveTypes();
  const leaveTypes = leaveTypesQuery?.data ?? [];

  const leaveTypeItems = leaveTypes
    .filter((type) => type.isActive)
    .map((type) => ({
      label: type.name,
      value: type.id,
    }));

  const form = useForm<CreateLeaveRequestFormValues>({
    resolver: zodResolver(createLeaveRequestSchema),
    defaultValues: {
      leaveTypeId: "",
      startDate: "",
      endDate: "",
      reason: "",
    },
  });

  const { watch, reset, control, handleSubmit } = form;
  const formData = watch();

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  async function onSubmit(values: CreateLeaveRequestFormValues) {
    try {
      await mutateAsync(values);
      onOpenChange(false);
    } catch (error) {
      // useCreateLeaveRequest hook already handles toasts
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply for Leave</DialogTitle>
          <DialogDescription>
            Submit a new leave request for approval.
          </DialogDescription>
        </DialogHeader>

        <form id="leave-request-form" onSubmit={handleSubmit(onSubmit)}>
          <FieldGroup>
            <Controller
              name="leaveTypeId"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Leave Type</FieldLabel>
                  <Select
                    items={leaveTypeItems}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue placeholder="Select a leave type" />
                    </SelectTrigger>
                    <SelectContent />
                  </Select>
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="startDate"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>Start Date</FieldLabel>
                    <Input
                      {...field}
                      type="date"
                      id={field.name}
                      min={getTodayDate()}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="endDate"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>End Date</FieldLabel>
                    <Input
                      {...field}
                      type="date"
                      id={field.name}
                      min={formData.startDate || getTodayDate()}
                      aria-invalid={fieldState.invalid}
                    />
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="reason"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>Reason</FieldLabel>
                  <Textarea
                    {...field}
                    id={field.name}
                    rows={4}
                    maxLength={500}
                    placeholder="Briefly describe why you are applying for leave."
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldDescription>
                    Maximum 500 characters.
                  </FieldDescription>
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
          <Button type="submit" form="leave-request-form" disabled={isPending}>
            {isPending && <LoaderCircle className="size-4 animate-spin" />}
            {isPending ? "Submitting..." : "Submit Request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
