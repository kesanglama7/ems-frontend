"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Upload } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Field,
  FieldError,
  FieldLabel,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import {
  DOCUMENT_ACCEPT,
  DOCUMENT_TYPES,
} from "../constants/document.constants";
import { useUploadDocument } from "../hooks/use-upload-document";
import {
  uploadDocumentSchema,
  type UploadDocumentFormValues,
} from "../schemas/upload-document.schema";
import { DOCUMENT_TYPE_LABELS } from "../utils/document.utils";
import { formatFileSize } from "../utils/document.utils";

export function UploadDocumentDialog() {
  const [open, setOpen] = useState(false);

  const uploadDocument = useUploadDocument();

  const form = useForm<UploadDocumentFormValues>({
    resolver: zodResolver(uploadDocumentSchema),
    defaultValues: {
      type: undefined,
      title: "",
      file: undefined,
    },
  });

  function handleOpenChange(nextOpen: boolean) {
    if (uploadDocument.isPending) {
      return;
    }

    setOpen(nextOpen);

    if (!nextOpen) {
      form.reset();
    }
  }

  function onSubmit(
    values: UploadDocumentFormValues,
  ) {
    uploadDocument.mutate(values, {
      onSuccess: () => {
        form.reset();
        setOpen(false);
      },
    });
  }

  return (
    <Dialog
      open={open}
      onOpenChange={handleOpenChange}
    >
      <DialogTrigger
        render={
          <Button>
            <Upload />
            Upload document
          </Button>
        }
      />

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            Upload document
          </DialogTitle>

          <DialogDescription>
            Upload a document for review by your
            organization administrator.
          </DialogDescription>
        </DialogHeader>

        <form
          id="upload-document-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-5"
        >
          <Controller
            name="type"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
              >
                <FieldLabel>
                  Document type
                </FieldLabel>

                <Select
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <SelectTrigger
                    aria-invalid={
                      fieldState.invalid
                    }
                    className="w-full"
                  >
                    <SelectValue placeholder="Select document type" />
                  </SelectTrigger>

                  <SelectContent>
                    {DOCUMENT_TYPES.map((type) => (
                      <SelectItem
                        key={type}
                        value={type}
                      >
                        {
                          DOCUMENT_TYPE_LABELS[
                            type
                          ]
                        }
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
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
              >
                <FieldLabel htmlFor={field.name}>
                  Title
                </FieldLabel>

                <Input
                  {...field}
                  id={field.name}
                  placeholder="e.g. My Passport"
                  maxLength={150}
                  autoComplete="off"
                  aria-invalid={
                    fieldState.invalid
                  }
                />

                <div className="flex justify-end">
                  <span className="text-xs text-muted-foreground">
                    {field.value.length}/150
                  </span>
                </div>

                {fieldState.invalid && (
                  <FieldError
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />

          <Controller
            name="file"
            control={form.control}
            render={({ field, fieldState }) => (
              <Field
                data-invalid={fieldState.invalid}
              >
                <FieldLabel htmlFor={field.name}>
                  File
                </FieldLabel>

                <Input
                  id={field.name}
                  name={field.name}
                  ref={field.ref}
                  type="file"
                  accept={DOCUMENT_ACCEPT}
                  onBlur={field.onBlur}
                  aria-invalid={
                    fieldState.invalid
                  }
                  onChange={(event) => {
                    field.onChange(
                      event.target.files?.[0],
                    );
                  }}
                />

                {field.value instanceof File ? (
                  <div className="rounded-md border bg-muted/30 px-3 py-2">
                    <p className="truncate text-sm font-medium">
                      {field.value.name}
                    </p>

                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatFileSize(
                        field.value.size,
                      )}
                    </p>
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    PDF, JPG, JPEG, or PNG. Maximum
                    file size 5 MB.
                  </p>
                )}

                {fieldState.invalid && (
                  <FieldError
                    errors={[fieldState.error]}
                  />
                )}
              </Field>
            )}
          />
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            disabled={uploadDocument.isPending}
            onClick={() =>
              handleOpenChange(false)
            }
          >
            Cancel
          </Button>

          <Button
            type="submit"
            form="upload-document-form"
            disabled={uploadDocument.isPending}
          >
            {uploadDocument.isPending
              ? "Uploading..."
              : "Upload document"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}