"use client";

import { useEffect, useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getTodayDate } from "@/lib/general";

import {
  useCreateLeaveRequest,
  useLeavePreview,
} from "../../hooks/use-my-leaves";
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
  const {
    mutateAsync: createLeaveRequest,
    isPending: isCreating,
  } = useCreateLeaveRequest();

  const { data: leaveTypesQuery } = useLeaveTypes();

  const leaveTypes = useMemo(
    () => leaveTypesQuery?.data ?? [],
    [leaveTypesQuery?.data],
  );

  const leaveTypeItems = useMemo(
    () =>
      leaveTypes
        .filter((leaveType) => leaveType.isActive)
        .map((leaveType) => ({
          label: leaveType.name,
          value: String(leaveType.id),
        })),
    [leaveTypes],
  );

  const form = useForm<CreateLeaveRequestFormValues>({
    resolver: zodResolver(createLeaveRequestSchema),
    defaultValues: {
      leaveTypeId: "",
      startDate: "",
      endDate: "",
      duration: "FULL_DAY",
      reason: "",
    },
  });

  const {
    control,
    getValues,
    handleSubmit,
    reset,
    setValue,
    trigger,
    watch,
  } = form;

  const leaveTypeId = watch("leaveTypeId");
  const startDate = watch("startDate");
  const duration = watch("duration");

  const selectedLeaveType = useMemo(
    () =>
      leaveTypes.find(
        (leaveType) => String(leaveType.id) === leaveTypeId,
      ),
    [leaveTypes, leaveTypeId],
  );

  const durationItems = useMemo(() => {
    const items = [
      {
        label: "Full day",
        value: "FULL_DAY",
      },
    ];

    if (selectedLeaveType?.allowHalfDay !== false) {
      items.push(
        {
          label: "First half",
          value: "FIRST_HALF",
        },
        {
          label: "Second half",
          value: "SECOND_HALF",
        },
      );
    }

    return items;
  }, [selectedLeaveType?.allowHalfDay]);

  useEffect(() => {
    if (
      selectedLeaveType?.allowHalfDay === false &&
      getValues("duration") !== "FULL_DAY"
    ) {
      setValue("duration", "FULL_DAY", {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [
    selectedLeaveType?.allowHalfDay,
    getValues,
    setValue,
  ]);

  useEffect(() => {
    if (!open) {
      reset();
    }
  }, [open, reset]);

  async function onSubmit(
    values: CreateLeaveRequestFormValues,
  ) {
    try {
      await createLeaveRequest(values);

      reset();
      onOpenChange(false);
    } catch {
      // The useCreateLeaveRequest hook handles error toasts.
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Apply for Leave</DialogTitle>

          <DialogDescription>
            Submit a new leave request for approval.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
        >
          <FieldGroup className="-space-y-4">
            <Controller
              name="leaveTypeId"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Leave Type
                  </FieldLabel>

                  <Select
                    items={leaveTypeItems}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger
                      id={field.name}
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select a leave type" />
                    </SelectTrigger>

                    <SelectContent>
                      {leaveTypeItems.map((item) => (
                        <SelectItem
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Controller
                name="startDate"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      Start Date
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      type="date"
                      min={getTodayDate()}
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                      />
                    )}
                  </Field>
                )}
              />

              <Controller
                name="endDate"
                control={control}
                render={({ field, fieldState }) => (
                  <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                      End Date
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      type="date"
                      min={startDate || getTodayDate()}
                      disabled={duration !== "FULL_DAY"}
                      aria-invalid={fieldState.invalid}
                    />

                    {fieldState.invalid && (
                      <FieldError
                        errors={[fieldState.error]}
                      />
                    )}
                  </Field>
                )}
              />
            </div>

            <Controller
              name="duration"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Duration
                  </FieldLabel>

                  <Select
                    items={durationItems}
                    value={field.value}
                    onValueChange={(value) => {
                      field.onChange(value);

                      if (value !== "FULL_DAY") {
                        const selectedStartDate =
                          getValues("startDate");

                        if (selectedStartDate) {
                          setValue(
                            "endDate",
                            selectedStartDate,
                            {
                              shouldDirty: true,
                              shouldValidate: true,
                            },
                          );
                        }
                      }
                    }}
                  >
                    <SelectTrigger
                      id={field.name}
                      className="w-full"
                      aria-invalid={fieldState.invalid}
                    >
                      <SelectValue placeholder="Select duration" />
                    </SelectTrigger>

                    <SelectContent>
                      {durationItems.map((item) => (
                        <SelectItem
                          key={item.value}
                          value={item.value}
                        >
                          {item.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="reason"
              control={control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor={field.name}>
                    Reason
                  </FieldLabel>

                  <Textarea
                    {...field}
                    id={field.name}
                    rows={4}
                    placeholder="Enter the reason for your leave request"
                    aria-invalid={fieldState.invalid}
                  />

                  {fieldState.invalid && (
                    <FieldError
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>

            <Button
              type="submit"
              disabled={isCreating}
              className="w-full sm:w-auto mt-4"
            >
              {isCreating && (
                <LoaderCircle className="animate-spin" />
              )}

              Submit Request
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}