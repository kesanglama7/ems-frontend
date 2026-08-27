"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field, FieldGroup, FieldLabel, FieldError } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useOfficeSettings, useUpdateOfficeSettings } from "../hooks/use-office-settings";
import { updateOfficeSettingSchema } from "../schemas/update-office-setting.schema";
import { WORKING_DAYS, WORKING_DAY_LABELS, TIMEZONE_OPTIONS, type WorkingDay } from "../types/office-settings.types";
import { useEffect, useCallback } from "react";

type FormValues = z.infer<typeof updateOfficeSettingSchema>;

export function OfficeSettingsForm() {
  const { data: settings, isLoading, error } = useOfficeSettings();
  const updateMutation = useUpdateOfficeSettings();

  const form = useForm<FormValues>({
    resolver: zodResolver(updateOfficeSettingSchema),
    defaultValues: {
      officeName: "",
      timezone: "Asia/Kathmandu",
      workStartTime: "09:00",
      workEndTime: "18:00",
      workingDays: [],
      gracePeriodMinutes: 0,
    },
  });

  useEffect(() => {
    if (settings) {
      form.reset({
        officeName: settings.officeName,
        timezone: settings.timezone,
        workStartTime: settings.workStartTime,
        workEndTime: settings.workEndTime,
        workingDays: settings.workingDays as WorkingDay[],
        gracePeriodMinutes: settings.gracePeriodMinutes,
      });
    }
  }, [settings, form]);

  // Triggers native browser time picker on click/focus anywhere inside input
  const handleTimePickerTrigger = useCallback((e: React.SyntheticEvent<HTMLInputElement>) => {
    if ("showPicker" in e.currentTarget && typeof e.currentTarget.showPicker === "function") {
      try {
        e.currentTarget.showPicker();
      } catch (err) {
        // Fallback for browsers restricting cross-origin or rapid trigger calls
      }
    }
  }, []);

  function onSubmit(data: FormValues) {
    updateMutation.mutate(data);
  }

  const workingDays = form.watch("workingDays") || [];

  function toggleWorkingDay(day: WorkingDay) {
    const current = form.getValues("workingDays") || [];
    const updated = current.includes(day)
      ? current.filter((d) => d !== day)
      : [...current, day];
    form.setValue("workingDays", updated, { shouldValidate: true });
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-8 w-48 mb-6" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-10 w-full" />
            </div>
          ))}
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-destructive">Failed to load office settings.</p>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <h2 className="text-lg font-semibold mb-1">Office Settings</h2>
      <p className="text-muted-foreground text-sm mb-6">
        Configure office hours, timezone, and working days.
      </p>
      <Separator className="mb-6" />

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Field>
            <FieldLabel>Office Name</FieldLabel>
            <FieldGroup>
              <Input placeholder="Main Office" {...form.register("officeName")} />
            </FieldGroup>
            {form.formState.errors.officeName && (
              <FieldError>{form.formState.errors.officeName.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Timezone</FieldLabel>
            <FieldGroup>
              <Select
                value={form.watch("timezone") ?? undefined}
                onValueChange={(val) => form.setValue("timezone", val ?? undefined, { shouldValidate: true })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  {TIMEZONE_OPTIONS.map((tz) => (
                    <SelectItem key={tz.value} value={tz.value}>
                      {tz.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FieldGroup>
            {form.formState.errors.timezone && (
              <FieldError>{form.formState.errors.timezone.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Work Start Time</FieldLabel>
            <FieldGroup>
              <Input
                type="time"
                className="w-full cursor-pointer"
                onClick={handleTimePickerTrigger}
                onFocus={handleTimePickerTrigger}
                {...form.register("workStartTime")}
              />
            </FieldGroup>
            {form.formState.errors.workStartTime && (
              <FieldError>{form.formState.errors.workStartTime.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Work End Time</FieldLabel>
            <FieldGroup>
              <Input
                type="time"
                className="w-full cursor-pointer"
                onClick={handleTimePickerTrigger}
                onFocus={handleTimePickerTrigger}
                {...form.register("workEndTime")}
              />
            </FieldGroup>
            {form.formState.errors.workEndTime && (
              <FieldError>{form.formState.errors.workEndTime.message}</FieldError>
            )}
          </Field>

          <Field>
            <FieldLabel>Grace Period (minutes)</FieldLabel>
            <FieldGroup>
              <Input
                type="number"
                min={0}
                placeholder="10"
                {...form.register("gracePeriodMinutes", { valueAsNumber: true })}
              />
            </FieldGroup>
            {form.formState.errors.gracePeriodMinutes && (
              <FieldError>{form.formState.errors.gracePeriodMinutes.message}</FieldError>
            )}
          </Field>
        </div>

        <Field>
          <FieldLabel>Working Days</FieldLabel>
          <div className="flex flex-wrap gap-2 mt-2">
            {WORKING_DAYS.map((day) => {
              const isSelected = workingDays.includes(day);
              return (
                <Button
                  key={day}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={() => toggleWorkingDay(day)}
                >
                  {WORKING_DAY_LABELS[day]}
                </Button>
              );
            })}
          </div>
          {form.formState.errors.workingDays && (
            <FieldError>{form.formState.errors.workingDays.message}</FieldError>
          )}
        </Field>

        <div className="flex justify-end">
          <Button type="submit" disabled={updateMutation.isPending}>
            {updateMutation.isPending ? "Saving..." : "Save Settings"}
          </Button>
        </div>
      </form>
    </Card>
  );
}