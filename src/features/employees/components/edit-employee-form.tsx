"use client";

import {
  useEffect,
  useMemo,
} from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Controller,
  useForm,
} from "react-hook-form";
import {
  zodResolver,
} from "@hookform/resolvers/zod";
import {
  LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getApiErrorMessage } from "@/lib/api-error";

import { useDepartments } from "@/features/departments/hooks/use-departments";

import { useEmployee } from "../hooks/use-employee";
import { useUpdateEmployee } from "../hooks/use-update-employee";
import {
  updateEmployeeSchema,
  type UpdateEmployeeFormValues,
} from "../schemas/update-employee.schema";
import type { UpdateEmployeePayload } from "../types/employee.types";
import { workModeItems } from "../constants/employee.enums";

interface EditEmployeeFormProps {
  employeeId: string;
}

const NO_DEPARTMENT =
  "NO_DEPARTMENT";

function toLocalPhone(
  phone: string | null,
) {
  if (!phone) {
    return "";
  }

  const normalized =
    phone.replace(/\s/g, "");

  if (
    /^\+977(97|98)\d{8}$/.test(
      normalized,
    )
  ) {
    return normalized.slice(4);
  }

  return "";
}

function toDateInputValue(
  value: string | null,
) {
  if (!value) {
    return "";
  }

  return value.slice(0, 10);
}

function EditEmployeeSkeleton() {
  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-64 w-full rounded-lg" />
      <Skeleton className="h-64 w-full rounded-lg" />
    </div>
  );
}

export function EditEmployeeForm({
  employeeId,
}: EditEmployeeFormProps) {
  const router = useRouter();

  const employeeQuery =
    useEmployee(employeeId);

  const departmentsQuery =
    useDepartments();

  const updateMutation =
    useUpdateEmployee();

  const form =
    useForm<UpdateEmployeeFormValues>({
      resolver: zodResolver(
        updateEmployeeSchema,
      ),
      defaultValues: {
        firstName: "",
        lastName: "",
        phone: "",
        jobTitle: "",
        departmentId: "",
        dateOfJoining: "",
        workMode: "ON_FIELD",
      },
    });

  useEffect(() => {
    const employee =
      employeeQuery.data?.data;

    if (!employee) {
      return;
    }

    form.reset({
      firstName:
        employee.firstName,
      lastName:
        employee.lastName,
      phone: toLocalPhone(
        employee.phone,
      ),
      jobTitle:
        employee.jobTitle ?? "",
      departmentId:
        employee.departmentId ??
        "",
      dateOfJoining:
        toDateInputValue(
          employee.dateOfJoining,
        ),
      workMode:
        employee.workMode,
    });
  }, [
    employeeQuery.data,
    form,
  ]);

  const departmentItems =
    useMemo(() => {
      const departments =
        departmentsQuery.data?.data ??
        [];

      const activeDepartments =
        departments.filter(
          (department) =>
            department.isActive,
        );

      /*
       * If the employee currently belongs
       * to a department that has since been
       * deactivated, retain it in the select
       * so the existing value can still be
       * displayed correctly.
       */
      const currentDepartment =
        employeeQuery.data?.data
          .department;

      const currentInactive =
        currentDepartment &&
        !currentDepartment.isActive
          ? currentDepartment
          : null;

      return [
        {
          label: "No department",
          value: NO_DEPARTMENT,
        },

        ...activeDepartments.map(
          (department) => ({
            label:
              department.name,
            value:
              department.id,
          }),
        ),

        ...(currentInactive
          ? [
              {
                label:
                  `${currentInactive.name} (Inactive)`,
                value:
                  currentInactive.id,
              },
            ]
          : []),
      ];
    }, [
      departmentsQuery.data,
      employeeQuery.data,
    ]);

  if (employeeQuery.isPending) {
    return (
      <EditEmployeeSkeleton />
    );
  }

  if (employeeQuery.isError) {
    return (
      <div className="mx-auto flex min-h-72 w-full max-w-7xl flex-col items-center justify-center rounded-lg border border-dashed p-6 text-center">
        <h2 className="font-medium">
          Unable to load employee
        </h2>

        <p className="text-muted-foreground mt-1 max-w-md text-sm">
          {getApiErrorMessage(
            employeeQuery.error
          )}
        </p>

        <div className="mt-4 flex gap-2">
            <Link href="/admin/employees">
          <Button
            variant="outline"
          >
            Back
          </Button>
            </Link>

          <Button
            onClick={() =>
              employeeQuery.refetch()
            }
          >
            Retry
          </Button>
        </div>
      </div>
    );
  }

  const employee =
    employeeQuery.data.data;

  async function onSubmit(
    values: UpdateEmployeeFormValues,
  ) {
    const payload:
      UpdateEmployeePayload = {
      firstName:
        values.firstName.trim(),

      lastName:
        values.lastName.trim(),

      phone: values.phone
        ? `+977${values.phone}`
        : "",

      jobTitle:
        values.jobTitle.trim(),

      departmentId:
        values.departmentId
          ? values.departmentId
          : null,

      dateOfJoining:
        values.dateOfJoining
          ? values.dateOfJoining
          : null,
      workMode: values.workMode,
    };

    try {
      const response =
        await updateMutation.mutateAsync(
          {
            employeeId,
            payload,
          },
        );

      toast.success(
        response.message ||
          "Employee updated successfully.",
      );

      router.replace(
        `/admin/employees/${employeeId}`,
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(error),
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-7xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Edit employee
        </h1>

        <p className="text-muted-foreground mt-1 text-sm">
          Update information for{" "}
          {employee.firstName}{" "}
          {employee.lastName}.
        </p>
      </div>

      <form
        onSubmit={form.handleSubmit(
          onSubmit,
        )}
        className="space-y-8"
      >
        <div className="rounded-lg border p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="font-medium">
              Personal information
            </h2>

            <p className="text-muted-foreground mt-1 text-sm">
              Update the employee&apos;s
              basic information.
            </p>
          </div>

          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Controller
                name="firstName"
                control={
                  form.control
                }
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
                      First name
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      autoComplete="given-name"
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
                name="lastName"
                control={
                  form.control
                }
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
                      Last name
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      autoComplete="family-name"
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
              name="phone"
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
                    Phone
                  </FieldLabel>

                  <div className="border-input focus-within:border-ring focus-within:ring-ring/50 flex h-9 max-w-md overflow-hidden rounded-md border bg-transparent focus-within:ring-[3px]">
                    <div className="bg-muted text-muted-foreground flex items-center border-r px-3 text-sm font-medium">
                      +977
                    </div>

                    <Input
                      id={field.name}
                      name={field.name}
                      ref={field.ref}
                      value={
                        field.value
                      }
                      inputMode="numeric"
                      autoComplete="tel-national"
                      maxLength={10}
                      placeholder="9812345678"
                      aria-invalid={
                        fieldState.invalid
                      }
                      className="h-full rounded-none border-0 shadow-none focus-visible:ring-0"
                      onBlur={
                        field.onBlur
                      }
                      onChange={(
                        event,
                      ) => {
                        const digits =
                          event.target.value
                            .replace(
                              /\D/g,
                              "",
                            )
                            .slice(
                              0,
                              10,
                            );

                        field.onChange(
                          digits,
                        );
                      }}
                    />
                  </div>

                  <FieldDescription>
                    10-digit Nepal
                    mobile number
                    starting with 97
                    or 98.
                  </FieldDescription>

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
        </div>

        <div className="rounded-lg border p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="font-medium">
              Employment information
            </h2>

            <p className="text-muted-foreground mt-1 text-sm">
              Update job,
              department, and
              joining information.
            </p>
          </div>

          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
            <Controller
              name="jobTitle"
              control={
                form.control
              }
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
                    Job title
                  </FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    placeholder="Software Engineer"
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
              name="workMode"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel>Work Mode</FieldLabel>

                  <Select
                    items={workModeItems}
                    value={field.value}
                    onValueChange={field.onChange}
                  >
                    <SelectTrigger aria-invalid={fieldState.invalid}>
                      <SelectValue placeholder="Select work mode" />
                    </SelectTrigger>

                    <SelectContent>
                      <SelectGroup>
                        {workModeItems.map((item) => (
                          <SelectItem
                            key={item.value}
                            value={item.value}
                          >
                            {item.label}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>

                  <FieldDescription>
                    Select whether the employee works on field or remotely.
                  </FieldDescription>

                  {fieldState.invalid && (
                    <FieldError errors={[fieldState.error]} />
                  )}
                </Field>
              )}
            />
            </div>

            <div className="grid gap-5 sm:grid-cols-2">
              <Controller
                name="departmentId"
                control={
                  form.control
                }
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
                      Department
                    </FieldLabel>

                    <Select
                      items={
                        departmentItems
                      }
                      value={
                        field.value ||
                        NO_DEPARTMENT
                      }
                      onValueChange={(
                        value,
                      ) => {
                        if (!value) {
                          return;
                        }

                        field.onChange(
                          value ===
                            NO_DEPARTMENT
                            ? ""
                            : value,
                        );
                      }}
                      disabled={
                        departmentsQuery
                          .isPending
                      }
                    >
                      <SelectTrigger
                        aria-invalid={
                          fieldState.invalid
                        }
                      >
                        <SelectValue placeholder="Select department" />
                      </SelectTrigger>

                      <SelectContent>
                        <SelectGroup>
                          {departmentItems.map(
                            (item) => (
                              <SelectItem
                                key={
                                  item.value
                                }
                                value={
                                  item.value
                                }
                              >
                                {
                                  item.label
                                }
                              </SelectItem>
                            ),
                          )}
                        </SelectGroup>
                      </SelectContent>
                    </Select>

                    <FieldDescription>
                      Select No
                      department to
                      remove the current
                      assignment.
                    </FieldDescription>

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
                name="dateOfJoining"
                control={
                  form.control
                }
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
                      Joining date
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      type="date"
                      aria-invalid={
                        fieldState.invalid
                      }
                    />

                    <FieldDescription>
                      Clear the field
                      to remove the
                      joining date.
                    </FieldDescription>

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
          </FieldGroup>
        </div>

        <div className="rounded-lg border bg-muted/30 p-4">
          <p className="text-sm font-medium">
            Account information
          </p>

          <p className="text-muted-foreground mt-1 text-sm">
            Email, employee code,
            account status, and role
            cannot be changed from
            this form.
          </p>
        </div>

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Link href={`/admin/employees/${employeeId}`}>
            <Button
              variant="outline"
            >
              Cancel
            </Button>
          </Link>

          <Button
            type="submit"
            disabled={
              updateMutation.isPending
            }
          >
            {updateMutation.isPending && (
              <LoaderCircle className="size-4 animate-spin" />
            )}

            {updateMutation.isPending
              ? "Saving..."
              : "Save changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}