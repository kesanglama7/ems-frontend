"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Controller,
  useForm,
} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LoaderCircle } from "lucide-react";
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
import { getApiErrorMessage } from "@/lib/api-error";

import { useDepartments } from "@/features/departments/hooks/use-departments";

import { useCreateEmployee } from "../hooks/use-create-employee";
import {
  createEmployeeSchema,
  type CreateEmployeeFormValues,
} from "../schemas/create-employee.schema";
import type { CreateEmployeePayload } from "../types/employee.types";

const NO_DEPARTMENT = "NONE";

function optionalValue(
  value: string,
): string | undefined {
  const normalized = value.trim();

  return normalized.length
    ? normalized
    : undefined;
}

export function CreateEmployeeForm() {
  const router = useRouter();

  const createMutation =
    useCreateEmployee();

  const departmentsQuery =
    useDepartments();

  const form =
    useForm<CreateEmployeeFormValues>({
      resolver: zodResolver(
        createEmployeeSchema,
      ),
      defaultValues: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        jobTitle: "",
        departmentId: "",
        dateOfJoining: "",
      },
    });

    const activeDepartments =
        departmentsQuery.data?.data.filter(
            (department) => department.isActive,
        ) ?? [];

        const departmentItems = [
        {
            label: "No department",
            value: NO_DEPARTMENT,
        },
        ...activeDepartments.map((department) => ({
            label: department.name,
            value: department.id,
        })),
    ];

  async function onSubmit(
    values: CreateEmployeeFormValues,
  ) {
    const payload: CreateEmployeePayload =
      {
        firstName:
          values.firstName.trim(),
        lastName:
          values.lastName.trim(),
        email: values.email.trim(),
        password: values.password,
        phone: values.phone
        ? `+977${values.phone}`
        : undefined,
        jobTitle: optionalValue(
          values.jobTitle,
        ),
        departmentId:
          optionalValue(
            values.departmentId,
          ),
        dateOfJoining:
          optionalValue(
            values.dateOfJoining,
          ),
      };

    try {
      const response =
        await createMutation.mutateAsync(
          payload,
        );

      toast.success(
        response.message ||
          "Employee created successfully.",
      );

      router.replace(
        "/admin/employees",
      );
    } catch (error) {
      toast.error(
        getApiErrorMessage(error),
      );
    }
  }

  return (
    <div className="mx-auto w-full max-w-3xl">
      <div className="mb-6">
        <h1 className="text-2xl font-semibold tracking-tight">
          Create employee
        </h1>

        <p className="text-muted-foreground mt-1 text-sm">
          Create a new employee
          account and employment
          profile.
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
              Basic information about
              the employee.
            </p>
          </div>

          <FieldGroup>
            <div className="grid gap-5 sm:grid-cols-2">
              <Controller
                name="firstName"
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
                      First name
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      autoComplete="given-name"
                      aria-invalid={
                        fieldState.invalid
                      }
                      placeholder="John"
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
                      Last name
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      autoComplete="family-name"
                      aria-invalid={
                        fieldState.invalid
                      }
                      placeholder="Doe"
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

            <div className="grid gap-5 sm:grid-cols-2">
              <Controller
                name="email"
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
                      Email
                    </FieldLabel>

                    <Input
                      {...field}
                      id={field.name}
                      type="email"
                      autoComplete="email"
                      aria-invalid={
                        fieldState.invalid
                      }
                      placeholder="john@example.com"
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
                name="phone"
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                    <FieldLabel htmlFor={field.name}>
                        Phone
                    </FieldLabel>

                    <div
                        className="border-input focus-within:border-ring focus-within:ring-ring/50 flex h-9 overflow-hidden rounded-md border bg-transparent focus-within:ring-[3px]"
                    >
                        <div className="bg-muted text-muted-foreground flex items-center border-r px-3 text-sm font-medium">
                        +977
                        </div>

                        <Input
                        id={field.name}
                        name={field.name}
                        value={field.value}
                        inputMode="numeric"
                        autoComplete="tel-national"
                        maxLength={10}
                        aria-invalid={fieldState.invalid}
                        placeholder="9812345678"
                        className="h-full rounded-none border-0 shadow-none focus-visible:ring-0"
                        onBlur={field.onBlur}
                        ref={field.ref}
                        onChange={(event) => {
                            const digits =
                            event.target.value
                                .replace(/\D/g, "")
                                .slice(0, 10);

                            field.onChange(digits);
                        }}
                        />
                    </div>

                    <FieldDescription>
                        Optional. Enter a 10-digit number
                        starting with 97 or 98.
                    </FieldDescription>

                    {fieldState.invalid && (
                        <FieldError
                        errors={[fieldState.error]}
                        />
                    )}
                    </Field>
                )}
                />
            </div>
          </FieldGroup>
        </div>

        <div className="rounded-lg border p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="font-medium">
              Employment information
            </h2>

            <p className="text-muted-foreground mt-1 text-sm">
              Department, job title,
              and joining date.
            </p>
          </div>

          <FieldGroup>
            <Controller
              name="jobTitle"
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
                    htmlFor={field.name}
                  >
                    Job title
                  </FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    aria-invalid={
                      fieldState.invalid
                    }
                    placeholder="Software Engineer"
                  />

                  <FieldDescription>
                    Optional
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

            <div className="grid gap-5 sm:grid-cols-2">
             <Controller
                name="departmentId"
                control={form.control}
                render={({ field, fieldState }) => (
                    <Field data-invalid={fieldState.invalid}>
                    <FieldLabel>Department</FieldLabel>

                    <Select
                        items={departmentItems}
                        value={field.value || NO_DEPARTMENT}
                        onValueChange={(value) => {
                        if (!value) {
                            return;
                        }

                        field.onChange(
                            value === NO_DEPARTMENT
                            ? ""
                            : value,
                        );
                        }}
                        disabled={departmentsQuery.isPending}
                    >
                        <SelectTrigger
                        aria-invalid={fieldState.invalid}
                        >
                        <SelectValue placeholder="Select department" />
                        </SelectTrigger>

                        <SelectContent>
                        <SelectGroup>
                            {departmentItems.map((item) => (
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
                        Optional. Only active departments
                        can be assigned.
                    </FieldDescription>

                    {fieldState.invalid && (
                        <FieldError
                        errors={[fieldState.error]}
                        />
                    )}
                    </Field>
                )}
                />

              <Controller
                name="dateOfJoining"
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
                      Optional
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

        <div className="rounded-lg border p-5 sm:p-6">
          <div className="mb-5">
            <h2 className="font-medium">
              Account access
            </h2>

            <p className="text-muted-foreground mt-1 text-sm">
              Set the employee&apos;s initial
              account password.
            </p>
          </div>

          <Controller
            name="password"
            control={form.control}
            render={({
              field,
              fieldState,
            }) => (
              <Field
                data-invalid={
                  fieldState.invalid
                }
                className="max-w-md"
              >
                <FieldLabel
                  htmlFor={field.name}
                >
                  Initial password
                </FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  type="password"
                  autoComplete="new-password"
                  aria-invalid={
                    fieldState.invalid
                  }
                  placeholder="Minimum 8 characters"
                />

                <FieldDescription>
                  The employee will use
                  this password to sign in.
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

        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
        <Link href="/admin/employees">
          <Button
            variant="outline"
          >
            Cancel
          </Button>
        </Link>

          <Button
            type="submit"
            disabled={
              createMutation.isPending
            }
          >
            {createMutation.isPending && (
              <LoaderCircle className="size-4 animate-spin" />
            )}

            {createMutation.isPending
              ? "Creating..."
              : "Create employee"}
          </Button>
        </div>
      </form>
    </div>
  );
}