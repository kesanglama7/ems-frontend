"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSaveHoliday } from "../hooks";
import { holidaySchema, type HolidayFormValues } from "../schema";
import type { Holiday } from "../types";

interface HolidayDialogProps {
  item?: Holiday;
  initialDate: string;
  onClose: () => void;
}

export function HolidayDialog({ item, initialDate, onClose }: HolidayDialogProps) {
  const save = useSaveHoliday();
  const form = useForm<HolidayFormValues>({
    resolver: zodResolver(holidaySchema),
    defaultValues: {
      name: item?.name ?? "",
      date: item?.date.slice(0, 10) ?? initialDate,
      description: item?.description ?? "",
      isOfficeClosed: item?.isOfficeClosed ?? true,
    },
  });

  const onSubmit = (values: HolidayFormValues) => {
    save.mutate({ values, id: item?.id }, { onSuccess: onClose });
  };

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !save.isPending) onClose();
      }}
    >
      <DialogContent className="max-h-[90dvh] overflow-y-auto sm:max-w-lg">
        <form className="space-y-5" onSubmit={form.handleSubmit(onSubmit)} noValidate>
          <DialogHeader>
            <DialogTitle>
              {item ? "Edit calendar entry" : "Add calendar entry"}
            </DialogTitle>
            <DialogDescription>
              Choose whether the office is closed on this date.
            </DialogDescription>
          </DialogHeader>

          <FieldGroup>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="holiday-name">Name</FieldLabel>
                  <Input
                    {...field}
                    id="holiday-name"
                    maxLength={160}
                    placeholder="Festival holiday"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="date"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="holiday-date">Date</FieldLabel>
                  <Input
                    {...field}
                    id="holiday-date"
                    type="date"
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="holiday-description">
                    Description (optional)
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="holiday-description"
                    maxLength={1000}
                    aria-invalid={fieldState.invalid}
                  />
                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />

            <Controller
              name="isOfficeClosed"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field
                  orientation="horizontal"
                  data-invalid={fieldState.invalid}
                  className="rounded-lg border p-3"
                >
                  <Checkbox
                    id="holiday-closed"
                    name={field.name}
                    checked={field.value}
                    onCheckedChange={(checked) => field.onChange(checked === true)}
                    aria-invalid={fieldState.invalid}
                  />
                  <FieldContent>
                    <FieldLabel htmlFor="holiday-closed">
                      Office closed on this date
                    </FieldLabel>
                    <FieldDescription>
                      Office closures are excluded from leave deductions. Review
                      existing leave requests before changing a closure.
                    </FieldDescription>
                    {fieldState.invalid && (
                      <FieldError errors={[fieldState.error]} />
                    )}
                  </FieldContent>
                </Field>
              )}
            />
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={save.isPending}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={save.isPending}>
              {save.isPending ? "Saving…" : "Save calendar entry"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
