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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getApiErrorMessage } from "@/lib/api-error";

import { useCreateDepartment } from "../hooks/use-create-department";
import { useUpdateDepartment } from "../hooks/use-update-department";
import {
  departmentSchema,
  type DepartmentFormValues,
} from "../schemas/department.schema";
import type {
  CreateDepartmentPayload,
  Department,
  UpdateDepartmentPayload,
} from "../types/department.types";

interface DepartmentFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  department?: Department | null;
}

export function DepartmentFormDialog({
  open,
  onOpenChange,
  department,
}: DepartmentFormDialogProps) {
  const isEditing = Boolean(department);

  const createMutation =
    useCreateDepartment();

  const updateMutation =
    useUpdateDepartment();

  const isPending =
    createMutation.isPending ||
    updateMutation.isPending;

  const form =
    useForm<DepartmentFormValues>({
      resolver: zodResolver(
        departmentSchema,
      ),
      defaultValues: {
        name: "",
        description: "",
      },
    });

  useEffect(() => {
    if (!open) {
      return;
    }

    if (department) {
      form.reset({
        name: department.name,
        description:
          department.description ?? "",
      });

      return;
    }

    form.reset({
      name: "",
      description: "",
    });
  }, [
    open,
    department,
    form,
  ]);

  async function onSubmit(
    values: DepartmentFormValues,
  ) {
    try {
      if (department) {
        const payload:
          UpdateDepartmentPayload = {
          name: values.name.trim(),

          // Empty string intentionally
          // allows an existing description
          // to be cleared.
          description:
            values.description.trim(),
        };

        const response =
          await updateMutation.mutateAsync({
            departmentId:
              department.id,
            payload,
          });

        toast.success(
          response.message ||
            "Department updated successfully.",
        );
      } else {
        const description =
          values.description.trim();

        const payload:
          CreateDepartmentPayload = {
          name: values.name.trim(),
          description:
            description ||
            undefined,
        };

        const response =
          await createMutation.mutateAsync(
            payload,
          );

        toast.success(
          response.message ||
            "Department created successfully.",
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
              ? "Edit department"
              : "Create department"}
          </DialogTitle>

          <DialogDescription>
            {isEditing
              ? "Update the department name and description."
              : "Add a new department to your organization."}
          </DialogDescription>
        </DialogHeader>

        <form
          id="department-form"
          onSubmit={form.handleSubmit(
            onSubmit,
          )}
        >
          <FieldGroup>
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
                    Department name
                  </FieldLabel>

                  <Input
                    {...field}
                    id={field.name}
                    autoFocus
                    maxLength={100}
                    placeholder="Engineering"
                    aria-invalid={
                      fieldState.invalid
                    }
                  />

                  <FieldDescription>
                    Maximum 100
                    characters.
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
                    placeholder="Software and technical operations."
                    aria-invalid={
                      fieldState.invalid
                    }
                  />

                  <FieldDescription>
                    Optional. Maximum
                    500 characters.
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
            form="department-form"
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
                ? "Save changes"
                : "Create department"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}