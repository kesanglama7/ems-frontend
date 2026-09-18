"use client";

import { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { z } from "zod";

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

import type {
  CategoryFormValues,
  ManagedCategory,
} from "../../types/categories.types";

const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Category name must be at least 2 characters.")
    .max(100, "Category name must be at most 100 characters."),
  description: z
    .string()
    .max(500, "Description must be at most 500 characters."),
});

type FormValues = z.infer<typeof categorySchema>;

type RequestCategoryDialogFormProps = {
  category: ManagedCategory | null;
  saving: boolean;
  error: boolean;
  onClose: () => void;
  onSave: (values: CategoryFormValues) => Promise<void>;
};

export function RequestCategoryDialogForm({
  category,
  saving,
  error,
  onClose,
  onSave,
}: RequestCategoryDialogFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(categorySchema),
    mode: "onChange",
    defaultValues: {
      name: category?.name ?? "",
      description: category?.description ?? "",
    },
  });

  // defaultValues are only read on initialization. Reset when the
  // dialog switches between adding and editing a category.
  useEffect(() => {
    form.reset({
      name: category?.name ?? "",
      description: category?.description ?? "",
    });
  }, [category?.id, category?.name, category?.description, form]);

  const handleSave = async (values: FormValues) => {
    try {
      await onSave(values);
    } catch {
      // The parent sets `error`; keep this dialog open.
    }
  };

  const submitting = saving || form.formState.isSubmitting;

  return (
    <Dialog
      open
      onOpenChange={(open) => {
        if (!open && !submitting) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {category ? "Edit category" : "Add category"}
          </DialogTitle>
          <DialogDescription>
            {category
              ? "Update the category details below."
              : "Create a category employees can select when submitting requests."}
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={form.handleSubmit(handleSave)}
          
        >
          <FieldGroup className='-space-y-2'>
            <Controller
              name="name"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="category-name">
                    Category name
                    <span className="text-destructive">*</span>
                  </FieldLabel>
                  <Input
                    {...field}
                    id="category-name"
                    placeholder="e.g. Equipment request"
                    maxLength={100}
                    required
                    autoFocus
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid
                        ? "category-name-error"
                        : undefined
                    }
                  />
                  {fieldState.invalid && (
                    <FieldError
                      id="category-name-error"
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />

            <Controller
              name="description"
              control={form.control}
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel htmlFor="category-description">
                    Description
                  </FieldLabel>
                  <Textarea
                    {...field}
                    id="category-description"
                    placeholder="When should employees use this category?"
                    maxLength={500}
                    rows={4}
                    aria-invalid={fieldState.invalid}
                    aria-describedby={
                      fieldState.invalid
                        ? "category-description-count category-description-error"
                        : "category-description-count"
                    }
                  />
                  <p
                    id="category-description-count"
                    className="text-right text-xs text-muted-foreground"
                  >
                    {field.value.length}/500
                  </p>
                  {fieldState.invalid && (
                    <FieldError
                      id="category-description-error"
                      errors={[fieldState.error]}
                    />
                  )}
                </Field>
              )}
            />
          </FieldGroup>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              Could not save the category. Please try again.
            </p>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={submitting}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={submitting || !form.formState.isValid}
            >
              {submitting
                ? "Saving..."
                : category
                  ? "Save changes"
                  : "Create category"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}