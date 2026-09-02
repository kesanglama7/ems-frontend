"use client";

import {
  useCallback,
  useEffect,
} from "react";
import {
  Controller,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Building2,
  CalendarDays,
  Clock3,
  MapPin,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  useOfficeSettings,
  useUpdateOfficeSettings,
} from "../hooks/use-office-settings";

import {
  updateOfficeSettingSchema,
  type UpdateOfficeSettingFormValues,
} from "../schemas/update-office-setting.schema";

import {
  TIMEZONE_OPTIONS,
  WORKING_DAYS,
  WORKING_DAY_LABELS,
} from "../types/office-settings.types";

import { OfficeLocationPicker } from "./office-location-picker";

export function OfficeSettingsForm() {
  const {
    data: settings,
    isLoading,
    error,
  } = useOfficeSettings();

  const updateMutation =
    useUpdateOfficeSettings();

  const form =
    useForm<UpdateOfficeSettingFormValues>({
      resolver: zodResolver(
        updateOfficeSettingSchema,
      ),

      defaultValues: {
        officeName: "",
        timezone: "Asia/Kathmandu",

        workStartTime: "09:00",
        workEndTime: "18:00",

        workingDays: [],

        gracePeriodMinutes: 0,

        officeLatitude: null,
        officeLongitude: null,
        officeAddress: "",

        attendanceRadiusMeters: 100,
      },
    });

  useEffect(() => {
    if (!settings) {
      return;
    }

    form.reset({
      officeName:
        settings.officeName ?? "",

      timezone:
        settings.timezone ??
        "Asia/Kathmandu",

      workStartTime:
        settings.workStartTime ??
        "09:00",

      workEndTime:
        settings.workEndTime ??
        "18:00",

      workingDays:
        settings.workingDays ?? [],

      gracePeriodMinutes:
        settings.gracePeriodMinutes ??
        0,

      officeLatitude:
        settings.officeLatitude ??
        null,

      officeLongitude:
        settings.officeLongitude ??
        null,

      officeAddress:
        settings.officeAddress ?? "",

      attendanceRadiusMeters:
        settings.attendanceRadiusMeters ??
        100,
    });
  }, [settings, form]);

  const handleTimePickerTrigger =
    useCallback(
      (
        event: React.SyntheticEvent<HTMLInputElement>,
      ) => {
        const input =
          event.currentTarget;

        if (
          "showPicker" in input &&
          typeof input.showPicker ===
            "function"
        ) {
          try {
            input.showPicker();
          } catch {
            // Native browser fallback.
          }
        }
      },
      [],
    );

  const officeLatitude = form.watch(
    "officeLatitude",
  );

  const officeLongitude = form.watch(
    "officeLongitude",
  );

  const attendanceRadiusMeters =
    form.watch(
      "attendanceRadiusMeters",
    );

  function handleLocationChange(
    latitude: number,
    longitude: number,
  ) {
    form.setValue(
      "officeLatitude",
      latitude,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );

    form.setValue(
      "officeLongitude",
      longitude,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  function handleAddressResolved(
    address: string,
  ) {
    form.setValue(
      "officeAddress",
      address,
      {
        shouldDirty: true,
        shouldValidate: true,
      },
    );
  }

  function onSubmit(
    data: UpdateOfficeSettingFormValues,
  ) {
    updateMutation.mutate({
      officeName: data.officeName,
      timezone: data.timezone,

      workStartTime:
        data.workStartTime,

      workEndTime:
        data.workEndTime,

      workingDays:
        data.workingDays,

      gracePeriodMinutes:
        data.gracePeriodMinutes,

      attendanceRadiusMeters:
        data.attendanceRadiusMeters,

      ...(data.officeLatitude !==
        null &&
      data.officeLongitude !== null
        ? {
            officeLatitude:
              data.officeLatitude,

            officeLongitude:
              data.officeLongitude,
          }
        : {}),

      ...(data.officeAddress.trim()
        ? {
            officeAddress:
              data.officeAddress.trim(),
          }
        : {}),
    });
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="space-y-6">
          <div>
            <Skeleton className="mb-2 h-6 w-44" />
            <Skeleton className="h-4 w-72" />
          </div>

          <Separator />

          <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
            {Array.from({
              length: 5,
            }).map((_, index) => (
              <div
                key={index}
                className="space-y-2"
              >
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-10 w-full" />
              </div>
            ))}
          </div>

          <Skeleton className="h-[420px] w-full rounded-xl" />
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-6">
        <p className="text-sm text-destructive">
          Failed to load office
          settings.
        </p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="p-6">
        <div>
          <h2 className="text-xl font-semibold tracking-tight">
            Office Settings
          </h2>

          <p className="mt-1 text-sm text-muted-foreground">
            Configure office
            information, working
            schedule and employee
            attendance location.
          </p>
        </div>

        <Separator className="my-6" />

        <form
          onSubmit={form.handleSubmit(
            onSubmit,
          )}
          className="space-y-8"
        >
          {/* GENERAL */}

          <section className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                <Building2 className="size-4" />
              </div>

              <div>
                <h3 className="font-medium">
                  General information
                </h3>

                <p className="text-sm text-muted-foreground">
                  Basic information used
                  throughout the EMS.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Controller
                name="officeName"
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
                      Office Name
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Main Office"
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
                name="timezone"
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
                      Timezone
                    </FieldLabel>

                    <Select
                      value={field.value}
                      onValueChange={
                        field.onChange
                      }
                    >
                      <SelectTrigger
                        className="w-full"
                        aria-invalid={
                          fieldState.invalid
                        }
                      >
                        <SelectValue placeholder="Select timezone" />
                      </SelectTrigger>

                      <SelectContent>
                        {TIMEZONE_OPTIONS.map(
                          (timezone) => (
                            <SelectItem
                              key={
                                timezone.value
                              }
                              value={
                                timezone.value
                              }
                            >
                              {
                                timezone.label
                              }
                            </SelectItem>
                          ),
                        )}
                      </SelectContent>
                    </Select>

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
                name="gracePeriodMinutes"
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
                      Grace Period
                    </FieldLabel>

                    <div className="relative">
                      <Input
                        id={field.name}
                        type="number"
                        min={0}
                        max={180}
                        value={
                          Number.isFinite(
                            field.value,
                          )
                            ? field.value
                            : ""
                        }
                        onChange={(
                          event,
                        ) =>
                          field.onChange(
                            event.target
                              .valueAsNumber,
                          )
                        }
                        aria-invalid={
                          fieldState.invalid
                        }
                        className="pr-20"
                      />

                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        minutes
                      </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Extra time allowed
                      after the scheduled
                      work start time.
                    </p>

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
            </div>
          </section>

          <Separator />

          {/* SCHEDULE */}

          <section className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                <Clock3 className="size-4" />
              </div>

              <div>
                <h3 className="font-medium">
                  Working Schedule
                </h3>

                <p className="text-sm text-muted-foreground">
                  Define standard office
                  hours and working days.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Controller
                name="workStartTime"
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
                      Work Start Time
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      type="time"
                      className="cursor-pointer"
                      onClick={
                        handleTimePickerTrigger
                      }
                      onFocus={
                        handleTimePickerTrigger
                      }
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
                name="workEndTime"
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
                      Work End Time
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      type="time"
                      className="cursor-pointer"
                      onClick={
                        handleTimePickerTrigger
                      }
                      onFocus={
                        handleTimePickerTrigger
                      }
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
            </div>

            <Controller
              name="workingDays"
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
                  <div className="flex items-center gap-2">
                    <CalendarDays className="size-4 text-muted-foreground" />

                    <FieldLabel>
                      Working Days
                    </FieldLabel>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {WORKING_DAYS.map(
                      (day) => {
                        const selected =
                          field.value.includes(
                            day,
                          );

                        return (
                          <Button
                            key={day}
                            type="button"
                            size="sm"
                            variant={
                              selected
                                ? "default"
                                : "outline"
                            }
                            onClick={() => {
                              field.onChange(
                                selected
                                  ? field.value.filter(
                                      (
                                        currentDay,
                                      ) =>
                                        currentDay !==
                                        day,
                                    )
                                  : [
                                      ...field.value,
                                      day,
                                    ],
                              );
                            }}
                          >
                            {
                              WORKING_DAY_LABELS[
                                day
                              ]
                            }
                          </Button>
                        );
                      },
                    )}
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
          </section>

          <Separator />

          {/* OFFICE LOCATION */}

          <section className="space-y-5">
            <div className="flex items-start gap-3">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border bg-muted/40">
                <MapPin className="size-4" />
              </div>

              <div>
                <h3 className="font-medium">
                  Office Location
                </h3>

                <p className="text-sm text-muted-foreground">
                  Employees must be
                  within the configured
                  attendance radius when
                  checking in.
                </p>
              </div>
            </div>

            <OfficeLocationPicker
              latitude={
                officeLatitude
              }
              longitude={
                officeLongitude
              }
              radiusMeters={
                attendanceRadiusMeters ||
                100
              }
              onLocationChange={
                handleLocationChange
              }
              onAddressResolved={
                handleAddressResolved
              }
            />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Controller
                name="officeAddress"
                control={form.control}
                render={({
                  field,
                  fieldState,
                }) => (
                  <Field
                    data-invalid={
                      fieldState.invalid
                    }
                    className="md:col-span-2"
                  >
                    <FieldLabel
                      htmlFor={
                        field.name
                      }
                    >
                      Office Address
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      placeholder="Enter or select the office address"
                      aria-invalid={
                        fieldState.invalid
                      }
                    />

                    <p className="text-xs text-muted-foreground">
                      Automatically
                      detected from the
                      selected map
                      location. You can
                      edit it manually.
                    </p>

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
                name="attendanceRadiusMeters"
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
                      Attendance Radius
                    </FieldLabel>

                    <div className="relative">
                      <Input
                        id={field.name}
                        type="number"
                        min={20}
                        max={5000}
                        value={
                          Number.isFinite(
                            field.value,
                          )
                            ? field.value
                            : ""
                        }
                        onChange={(
                          event,
                        ) =>
                          field.onChange(
                            event.target
                              .valueAsNumber,
                          )
                        }
                        aria-invalid={
                          fieldState.invalid
                        }
                        className="pr-16"
                      />

                      <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        meters
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {[50, 100, 200, 500].map(
                        (radius) => (
                          <Button
                            key={radius}
                            type="button"
                            size="sm"
                            variant={
                              field.value ===
                              radius
                                ? "secondary"
                                : "ghost"
                            }
                            onClick={() =>
                              field.onChange(
                                radius,
                              )
                            }
                          >
                            {radius}m
                          </Button>
                        ),
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground">
                      Allowed distance
                      from the office
                      location for
                      attendance.
                    </p>

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

              <Field>
                <FieldLabel>
                  Coordinates
                </FieldLabel>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    readOnly
                    value={
                      officeLatitude !==
                      null
                        ? officeLatitude.toFixed(
                            6,
                          )
                        : ""
                    }
                    placeholder="Latitude"
                    className="bg-muted/30 font-mono text-xs"
                  />

                  <Input
                    readOnly
                    value={
                      officeLongitude !==
                      null
                        ? officeLongitude.toFixed(
                            6,
                          )
                        : ""
                    }
                    placeholder="Longitude"
                    className="bg-muted/30 font-mono text-xs"
                  />
                </div>

                <p className="text-xs text-muted-foreground">
                  Generated from the
                  selected map position.
                </p>
              </Field>
            </div>
          </section>

          <Separator />

          <div className="flex items-center justify-end">
            <Button
              type="submit"
              disabled={
                updateMutation.isPending ||
                !form.formState.isDirty
              }
            >
              {updateMutation.isPending
                ? "Saving..."
                : "Save Settings"}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}